import { GameState, IoType,SocketType } from "../../../types";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget, IWerewolvesTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import { getAvailableRoles, getCoupleFromUser, getIsGameEnded, saveGame } from "../werewolves.functions";
import Hunter from "../roles/Hunter";
import { nightRolesOrder } from "../werewolves.constants";

const onVillageVote = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId, target }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.villageVotes || [];
    const gameTurn = gameData.turn || 1;
  
    const usersThatCanVote = roomData.users.filter(
      (u) => gameData.roles[u._id]?.isAlive
    );
  
    votes.push({ playerId: userId, target, turn: gameTurn });
    gameData.villageVotes = votes;
    gameData.tmpVotes = gameData.tmpVotes?.filter((v) => v.playerId !== userId);
  
    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);
  
    if (currentTurnVotes.length !== usersThatCanVote.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }
  
    const mostVotedPlayer = currentTurnVotes.reduce(
      (acc: any, vote: IWerewolvesTarget) => {
        const voteNumber = currentTurnVotes.filter(
          (v) => v.target === vote.target
        ).length;
        if (!acc) return undefined;
        if (acc.count > 0 && acc.count === voteNumber && acc.target !== vote.target)
          return undefined;
  
        return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
      },
      { count: 0 }
    );
  
    const isVoteTied = !mostVotedPlayer;
  
    const votedPlayer = roomData.users.find(
      (u) => u._id === mostVotedPlayer?.target
    );
    if (!isVoteTied && votedPlayer) {
      const isHunterVoted = gameData.roles[votedPlayer._id] instanceof Hunter;
  
      const otherCoupleUsers = getCoupleFromUser(roomData, votedPlayer._id);
      const isPartOfCouple = otherCoupleUsers?.includes(votedPlayer._id);
  
      for (const coupleUserId of otherCoupleUsers) {
        if (isHunterVoted) {
          gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);
          if (isPartOfCouple) {
            gameData.roles[coupleUserId]?.setIsBeingKilled(true);
          }
        } else {
          gameData.roles[votedPlayer._id]?.setIsAlive(false);
          if (isPartOfCouple) {
            gameData.roles[coupleUserId]?.setIsAlive(false);
            gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
          }
        }
      }
  
      gameData.roles[votedPlayer._id]?.setDeathTurn(gameTurn);
  
      if (isHunterVoted) {
        gameData.roleTurn = gameData.roles[votedPlayer._id]?.name;
        roomData.gameData = gameData;
  
        io.in(roomId).emit("room:updated", roomData);
        return;
      }
    }
  
    gameData.turn += 1;
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
  
    const playerRoleToPlay = order[0];
    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
      gameData.state = "night";
    }
  
    gameData.tmpVotes = [];
  
    const isGameEnded = getIsGameEnded({ ...roomData, gameData });
  
    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }
  
    io.in(roomId).emit("room:updated", roomData);
  }
}

export default onVillageVote;