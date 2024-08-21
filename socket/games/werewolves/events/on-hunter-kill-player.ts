import { GameState, IoType,SocketType } from "../../../types";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import Hunter from "../roles/Hunter";
import { getAvailableRoles, getIsGameEnded, saveGame } from "../werewolves.functions";
import { nightRolesOrder } from "../werewolves.constants";

const onHunterKillPlayer = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId: playerId, target } : IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const villageVotes = gameData.villageVotes || [];
    const hunterKills = gameData.hunterKills || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;
  
    hunterKills.push({ playerId, target, turn: gameTurn });
    gameData.hunterKills = hunterKills;
  
    const hunterPlayer = roomData.users.find((u) => u._id === playerId);
    if (hunterPlayer) {
      gameData.roles[hunterPlayer._id]?.setIsBeingKilled(false);
      gameData.roles[hunterPlayer._id]?.setIsAlive(false);
    }
  
    const votedPlayer = roomData.users.find((u) => u._id === target);
    if (votedPlayer) {
      gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);
    }
  
    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );
  
    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
      }
      gameData.roles[userId]?.setDeathTurn(gameTurn);
  
      const otherCoupleUser = roomData.users.find(
        (u) => gameData.couple?.includes(u._id) && u._id !== userId
      );
      const isPartOfCouple = gameData.couple?.includes(userId);
  
      if (isPartOfCouple) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }
  
    const villageAlreadyVoted = !!villageVotes.find((v) => v.turn === gameTurn);
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
    const playerRoleToPlay = order[0];
  
    const isVotedPlayerHunter = gameData.roles[votedPlayer!._id] instanceof Hunter;
  
    if (isVotedPlayerHunter) {
      gameData.roleTurn = new Hunter().name;
      gameData.state = 'day';
    } else if (!isVotedPlayerHunter && villageAlreadyVoted) {
      gameData.turn += 1;
      gameData.roleTurn = new playerRoleToPlay().name;
      gameData.state = "night";
    } else {
      gameData.roleTurn = "Village";
      gameData.state = "day";
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

export default onHunterKillPlayer;