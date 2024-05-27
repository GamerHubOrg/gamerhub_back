import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType } from "../../types";
import { IUndercoverGameData, IUndercoverSendWord } from "./types";

// Socket handlers
const UndercoverHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData: IUndercoverGameData = roomData.gameData || {};
    const words = (gameData as IUndercoverGameData).words || [];
    const randomPlayer = roomData.users[0].id;

    gameData.playerTurn = randomPlayer;
    gameData.words = words;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onSendWord = ({ roomId, userId, word }: IUndercoverSendWord) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData: IUndercoverGameData = roomData.gameData || {};
    const words = (gameData as IUndercoverGameData).words || [];
    const randomPlayer = roomData.users[0].id;

    words.push({
        playerId: userId,
        word
    })

    gameData.playerTurn = randomPlayer;
    gameData.words = words;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  socket.on("game:undercover:initialize", onInitialize);
  socket.on("game:undercover:send-word", onSendWord);
};

export default UndercoverHandler;
