import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesGameData, IWerewolvesRoomData } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";

const onGetData = (io: IoType, socket: SocketType) => {
  return function (roomId: string) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }
}

export default onGetData;