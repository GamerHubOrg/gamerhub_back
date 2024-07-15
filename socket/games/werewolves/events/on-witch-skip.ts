import { GameState, IoType,SocketType } from "../../../types";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import Witch from "../roles/Witch";
import Hunter from "../roles/Hunter";
import { getAvailableRoles, getCoupleFromUser, getIsGameEnded, saveGame } from "../werewolves.functions";
import { nightRolesOrder } from "../werewolves.constants";

const onWitchSkip = (io: IoType, socket: SocketType) => {
  return function ({ roomId, playerId }: { roomId: string, playerId: string }) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const gameTurn = gameData.turn || 1;
    const witchSaves = gameData.witchSaves || [];
    const witchKills = gameData.witchKills || [];
    const witchSkips = gameData.witchSkips || [];
    
    witchSkips.push({ playerId , target: '', turn: gameTurn });
    gameData.witchKills = witchKills;
  
    const currentTurnVotes = [...witchKills, ...witchSaves, ...witchSkips].filter((v) => v.turn === gameTurn);
    const witchesUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Witch &&
        gameData.roles[u._id]?.isAlive
    );
  
    if (currentTurnVotes.length !== witchesUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }
  
    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );
  
    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }
  
      const otherCoupleUsers = getCoupleFromUser(roomData, userId);
      const isPartOfCouple = otherCoupleUsers?.includes(userId);
  
      for (const coupleUserId of otherCoupleUsers) {
        if (isPartOfCouple && !isHunter) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }
    }
  
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
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
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find(
        (userId) => gameData.roles[userId] instanceof Hunter
      );
      const isHunterBeingKilled = beingKilledPlayers.includes(
        hunterPlayer as string
      );
      gameData.roleTurn = isHunterBeingKilled
        ? Object.values(gameData.roles).find((role) => role instanceof Hunter)
            ?.name
        : "Village";
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

export default onWitchSkip;