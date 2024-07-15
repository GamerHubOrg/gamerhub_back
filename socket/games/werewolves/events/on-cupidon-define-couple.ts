import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesGameData, IWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendCouple } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import Cupidon from "../roles/Cupidon";
import { getNextPlayingRole } from "../werewolves.functions";

const onCupidonDefineCouple = (io: IoType, socket: SocketType) => {
  return function ({ roomId, playerId, couple }: IWerewolvesSendCouple) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const couples = gameData.couple || {};
  
    couples[playerId] = couple;
    gameData.couple = couples;
  
    const currentTurnVotes = Object.values(gameData.couple);
    const cupidonUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Cupidon &&
        gameData.roles[u._id]?.isAlive
    );
  
    if (currentTurnVotes.length !== cupidonUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
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

export default onCupidonDefineCouple;