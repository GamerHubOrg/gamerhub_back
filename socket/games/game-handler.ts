import { roomsDataMap } from "../room-handler";
import { IoType, IRoomData, SocketType } from "../types";
import SpeedrundleHandler from "./speedrundle/speedrundle.handler";
import UndercoverHandler from "./undercover/undercover.handler";
import WerewolvesHandler from "./werewolves/werewolves.handler";

export function getLiveGames(roomsDataMap: Map<string, IRoomData>) {
  const roomsIds = Array.from(roomsDataMap.keys());
  return roomsIds.reduce((acc: any[], roomId: string) => {
    const room = roomsDataMap.get(roomId) as IRoomData;
    if (room.gameState !== 'started') return acc;
    return [
      ...acc,
      {
        roomId,
        users: room.users,
        config: room.config,
        gameName: room.gameName,
      }
    ]
  }, []);
}

// Socket handlers
const GameHandler = (io: IoType, socket: SocketType) => {
  UndercoverHandler(io, socket);
  SpeedrundleHandler(io, socket);
  WerewolvesHandler(io, socket);

  socket.on('games:get:live', () => {
    const liveGames = getLiveGames(roomsDataMap);
    io.emit('games:live:data', liveGames)
  })
};

export default GameHandler;
