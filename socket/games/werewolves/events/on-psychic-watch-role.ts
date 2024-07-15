import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesGameData, IWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";
import Psychic from "../roles/Psychic";
import { getNextPlayingRole } from "../werewolves.functions";

const onPsychicWatchRole = (io: IoType, socket: SocketType) => {
  return function ({ roomId, userId, target }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
  
    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const psychicWatch = gameData.psychicWatch || [];
    const gameTurn = gameData.turn || 1;
  
    psychicWatch.push({ playerId: userId, target, turn: gameTurn });
    gameData.psychicWatch = psychicWatch;
  
    const currentTurnVotes = psychicWatch.filter((v) => v.turn === gameTurn);
    const psychicsUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Psychic &&
        gameData.roles[u._id]?.isAlive
    );
  
    if (currentTurnVotes.length !== psychicsUsers.length) {
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

export default onPsychicWatchRole;