import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import Witch from "../roles/Witch";
import Hunter from "../roles/Hunter";
import { getAvailableRoles } from "../werewolves.functions";
import { nightRolesOrder } from "../werewolves.constants";

const onWitchSavePlayer = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId: playerId, target }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchSaves = gameData.witchSaves || [];
    const witchKills = gameData.witchKills || [];
    const witchSkips = gameData.witchSkips || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;
  
    witchSaves.push({ playerId, target, turn: gameTurn });
    gameData.witchSaves = witchSaves;
  
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
  
    const votedPlayer = roomData.users.find((u) => u._id === target);
  
    if (!votedPlayer) return;
    gameData.roles[votedPlayer._id]?.setIsBeingKilled(false);
    gameData.roles[votedPlayer._id]?.setDeathTurn(undefined);
  
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
  
      const isPartOfCouple = gameData.couple?.includes(userId);
      const otherCoupleUser = roomData.users.find(
        (u) => gameData.couple?.includes(u._id) && u._id !== userId
      );

      if (isPartOfCouple && !isHunter) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }
  
    const currentPlayer = roomData.users.find((u) => u._id === playerId);
    if (!currentPlayer) return;
    (gameData.roles[currentPlayer._id] as Witch).power.useSavePotion();
  
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
  
    roomData.gameData = gameData;
    io.in(roomId).emit("room:updated", roomData);
  };
}

export default onWitchSavePlayer;
