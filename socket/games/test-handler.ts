import { User } from "../../shared/types/express";
import { roomsDataMap } from "../room-handler";
import { ITestGameData, IoType, SocketType } from "../types";

// Socket handlers
const TestHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData: ITestGameData = roomData.gameData || {};
    const rounds = (gameData as ITestGameData).rounds || [];

    const nombreAleatoire = Math.floor(Math.random() * 10) + 1;
    rounds.push(nombreAleatoire);

    gameData.rounds = rounds;
    io.in(roomId).emit("game:test:data", { data: gameData });
  };

  const onSaveAnswer = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
  };

  socket.on("game:test:initialize", onInitialize);
  socket.on("game:test:save-answer", onSaveAnswer);
};

export default TestHandler;
