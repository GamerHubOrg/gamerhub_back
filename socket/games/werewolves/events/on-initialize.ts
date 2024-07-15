import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesConfig, defaultWerewolvesGameData, IWerewolvesRoomData } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import { getAvailableRolesInstance, getThiefUsersIds, handleGiveUsersRoles } from "../werewolves.functions";
import { nightRolesOrder } from "../werewolves.constants";
import Thief from "../roles/Thief";

const onInitialize = (io: IoType, socket: SocketType) => {
  return async function (roomId: string) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
  
    gameData.state = "day";
    gameData.turn = 0;
    gameData.wolfVotes = [];
    gameData.villageVotes = [];
    gameData.tmpVotes = [];
    gameData.witchSaves = [];
    gameData.witchKills = [];
    gameData.witchSkips = [];
    gameData.hunterKills = [];
    gameData.psychicWatch = [];
    gameData.swapedRoles = undefined;
    gameData.thiefUsers = {};
    gameData.couple = {};
    gameData.roleTurn = undefined;
    gameData.campWin = undefined;
    gameData.roles = handleGiveUsersRoles(
      roomData.users,
      config.composition,
      gameData
    );
    gameData.usersThatPlayed = [...roomData.users];
  
    roomData.gameData = gameData;
  
    io.in(roomId).emit("room:updated", roomData);
    setTimeout(() => io.in(roomId).emit("game:werewolves:start"), 200);
  
    setTimeout(() => {
      gameData.state = "night";
      const compositionRoles = getAvailableRolesInstance(
        config.composition,
        gameData
      );
      const order = nightRolesOrder.filter((role) =>
        compositionRoles.some((comp) => comp instanceof role)
      );
      const playerRoleToPlay = order[0];
  
      if (playerRoleToPlay) {
        const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
        gameData.roleTurn = roleTurn?.name;
      }
  
      if (order.includes(Thief)) {
        const thieves = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId] instanceof Thief);
        gameData.thiefUsers = getThiefUsersIds(roomData, thieves);
      }
  
      gameData.turn = 1;
  
      io.in(roomId).emit("game:werewolves:state", { data: gameData });
    }, 5000);
  }
}

export default onInitialize;