import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesGameData, IWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import { getNextPlayingRole } from "../werewolves.functions";
import Villager from "../roles/Villager";
import Thief from "../roles/Thief";

const onThiefChooseRole = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId, target }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const currentUser = roomData.users.find((u) => u._id === userId);
    const targetUser = roomData.users.find((u) => u._id === target);
    const gameTurn = gameData.turn || 1;
  
    gameData.swapedRoles = [
      ...gameData.swapedRoles || [],
      {
        playerId: currentUser!._id,
        target: targetUser!._id,
        turn: gameTurn,
        roles: {
          [currentUser!._id]: gameData.roles[currentUser!._id],
          [targetUser!._id]: gameData.roles[targetUser!._id],
        }
      }
    ];
  
    const votesThisTurn = gameData.swapedRoles.filter((swapedRole) => swapedRole.turn === gameTurn);
    const thiefUsers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId] instanceof Thief && gameData.roles[userId].isAlive);
  
    if (thiefUsers.length !== votesThisTurn.length) {
      roomData.gameData = gameData;
      io.in(roomId).emit("room:updated", roomData);
      return;
    }
  
    for (const swapedRole of gameData.swapedRoles) {
      gameData.roles[swapedRole.playerId] = gameData.roles[swapedRole.target];
      gameData.roles[swapedRole.target] = new Villager();
    }
  
    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    };
  
    roomData.gameData = gameData;
  
    io.in(roomId).emit("room:updated", roomData);
  }
}

export default onThiefChooseRole;