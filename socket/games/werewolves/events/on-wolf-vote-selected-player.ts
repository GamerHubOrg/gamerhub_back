import { IoType,SocketType } from "../../../types";
import { defaultWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendTarget } from "../werewolves.types";
import { roomsDataMap } from "../../../room-handler";

const onWolfVoteSelectPlayer = (io: IoType, socket: SocketType) => {
  return function ({
    roomId,
    userId,
    target,
  }: IWerewolvesSendTarget) {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    console.log(userId, "want to vote for", target)
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const votes = gameData.tmpVotes?.filter((v) => v.playerId !== userId) || [];
  
    if (target) {
      votes.push({ playerId: userId, target });
      gameData.tmpVotes = votes;
    }
  
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }
}

export default onWolfVoteSelectPlayer;