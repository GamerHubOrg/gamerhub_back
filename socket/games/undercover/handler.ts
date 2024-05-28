import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType, SocketUser } from "../../types";
import { IUndercoverConfig, IUndercoverGameData, IUndercoverSendVote, IUndercoverSendWord, defaultUndercoverGameData } from "./types";

// Socket handlers
const UndercoverHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = (roomData.gameData as IUndercoverGameData) || defaultUndercoverGameData;
    const words = (gameData as IUndercoverGameData).words || [];
    const randomPlayer = roomData.users[0].id;

    gameData.playerTurn = randomPlayer;
    gameData.words = words;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onSendWord = ({ roomId, userId, word }: IUndercoverSendWord) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = (roomData.gameData as IUndercoverGameData) || defaultUndercoverGameData;
    const gameConfig = (roomData.config as IUndercoverConfig) || { wordsPerTurn: 1 };
    const words = gameData.words || [];
    const currentPlayerIndex = roomData.users.findIndex((u: SocketUser) => u.id === userId);
    const randomPlayer = roomData.users[currentPlayerIndex + 1] ? roomData.users[currentPlayerIndex + 1].id : roomData.users[0].id;

    words.push({
        playerId: userId,
        word
    })

    gameData.playerTurn = randomPlayer;
    gameData.words = words;

    if (words.length / roomData.users.length === gameConfig.wordsPerTurn) {
      gameData.state = 'vote';
    }

    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onVote = ({ roomId, userId, vote }: IUndercoverSendVote) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = (roomData.gameData as IUndercoverGameData) || defaultUndercoverGameData;
    const votes = gameData.votes || [];

    votes.push({ playerId: userId, vote, turn: gameData.turn })

    if ((votes.length / gameData.turn) === roomData.users.length) {
      gameData.state = 'words';
    }

    gameData.votes = votes;

    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  socket.on("game:undercover:initialize", onInitialize);
  socket.on("game:undercover:send-word", onSendWord);
  socket.on("game:undercover:vote", onVote);
};

export default UndercoverHandler;
