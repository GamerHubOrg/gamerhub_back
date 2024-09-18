import { roomsDataMap } from "../../../room-handler";
import { GameState, IoType, SocketType } from "../../../types";
import Hunter from "../roles/Hunter";
import Witch from "../roles/Witch";
import { nightRolesOrder } from "../werewolves.constants";
import { getAvailableRoles, getIsGameEnded, saveGame } from "../werewolves.functions";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget, IWerewolvesTarget } from "../werewolves.types";

const onWolfVote = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId, target }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.wolfVotes || [];
    const tmpVotes = gameData.tmpVotes || [];
    const gameTurn = gameData.turn || 1;
  
    const usersThatCanVote = roomData.users.filter(
      (u) =>
        gameData.roles[u._id]?.isAlive &&
        gameData.roles[u._id]?.camp === "wolves"
    );
  
    votes.push({ playerId: userId, target, turn: gameTurn });
    gameData.wolfVotes = votes;
    gameData.tmpVotes = tmpVotes.filter((v) => v.playerId !== userId);
  
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
  
    if (!isVoteTied) {
      const votedUser = roomData.users.find(
        (u) => u._id === mostVotedPlayer.target
      );
      if (!votedUser) return;
  
      const isWitchAlive = Object.values(gameData.roles).some(
        (role) => role instanceof Witch && role?.isAlive
      );
      const isVotedHunter = gameData.roles[votedUser._id] instanceof Hunter;
  
      if (isWitchAlive || isVotedHunter) {
        gameData.roles[votedUser._id]?.setIsBeingKilled(true);
      } else {
        gameData.roles[votedUser._id]?.setIsAlive(false);
      }
      gameData.roles[votedUser._id]?.setDeathTurn(gameTurn);
  
      const isPartOfCouple = gameData.couple?.includes(votedUser._id);
      const otherCoupleUser = roomData.users.find(
        (u) => gameData.couple?.includes(u._id) && u._id !== votedUser._id
      );

      if (isPartOfCouple && !isWitchAlive) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
  
      const compositionRoles = getAvailableRoles(config.composition, gameData);
      const gameRoles = compositionRoles.filter((role) =>
        Object.values(gameData.roles).some(
          (r) => r instanceof role && r.isAlive
        )
      );
      const order = nightRolesOrder.filter((role) =>
        gameRoles.some((comp) => comp === role)
      );
      const currentRole = Object.values(gameData.roles).find(
        (role) => role?.name === gameData.roleTurn
      );
      const currentRoleTurnIndex = order.findIndex(
        (role) => currentRole instanceof role
      );
  
      const playerRoleToPlay = order[currentRoleTurnIndex + 1];
  
      if (playerRoleToPlay) {
        gameData.roleTurn = new playerRoleToPlay().name;
      } else {
        gameData.roleTurn =
          gameData.roles[votedUser._id] instanceof Hunter
            ? gameData.roles[votedUser._id]?.name
            : "Village";
        gameData.state = "day";
      }
  
      gameData.tmpVotes = [];
      roomData.gameData = gameData;
  
      const isGameEnded = getIsGameEnded({ ...roomData, gameData });
  
      if (isGameEnded) {
        roomData.gameState = isGameEnded.gameState as GameState;
        roomData.gameData = isGameEnded.gameData;
        saveGame(roomData)
      }
  
      io.in(roomId).emit("room:updated", roomData);
      return;
    }
  
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

export default onWolfVote;