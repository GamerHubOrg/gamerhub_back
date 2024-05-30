import { getRandomElement } from "../../../utils/functions";
import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType, SocketUser } from "../../types";
import { getGameWords } from "./undercover.functions";
import { IUndercoverRoomData, IUndercoverSendVote, IUndercoverSendWord, IUndercoverVote, defaultUndercoverGameData, defaultUndercoverConfig, IUndercoverPlayer } from "./undercover.types";

// Socket handlers
const UndercoverHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const config = roomData.config || defaultUndercoverConfig;
    const words = gameData.words || [];
    const randomPlayerTurn = getRandomElement(roomData.users);
    const playerTurn = randomPlayerTurn.id;

    const wordsPair = getGameWords();
    const randomOrderWords = getRandomElement(wordsPair, wordsPair.length);

    const randomSpies = getRandomElement(roomData.users, config.spyCount);

    gameData.undercoverPlayerIds = config.spyCount === 1 || config.spyCount > roomData.users.length 
      ? [randomSpies.id]
      : randomSpies.map((u: IUndercoverPlayer) => u.id)
    gameData.civilianWord = randomOrderWords[0];
    gameData.spyWord = randomOrderWords[1];
    gameData.playerTurn = playerTurn;
    gameData.words = words;

    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onSendWord = ({ roomId, userId, word }: IUndercoverSendWord) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const gameConfig = roomData.config || defaultUndercoverConfig;
    const gameTurn = gameData.turn || 1;
    const words = gameData.words || [];
    const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

    words.push({
        playerId: userId,
        word
    })

    const validWords = words.filter((w) => usersThatCanPlay.some((u) => u.id === w.playerId))
    if (gameConfig.wordsPerTurn * usersThatCanPlay.length === validWords.length / gameTurn) {
      gameData.state = 'vote';
      io.in(roomId).emit("game:undercover:data", { data: gameData });
      return
    }

    const currentPlayerIndex = usersThatCanPlay.findIndex((u: SocketUser) => u.id === userId);
    const randomPlayer = usersThatCanPlay[currentPlayerIndex + 1] ? usersThatCanPlay[currentPlayerIndex + 1].id : usersThatCanPlay[0].id;
    gameData.playerTurn = randomPlayer;
    gameData.words = words;

    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onVote = ({ roomId, userId, vote }: IUndercoverSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const votes = gameData.votes || [];
    const users = roomData.users || [];
    const gameTurn = gameData.turn || 1;
    const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

    votes.push({ playerId: userId, vote })
    gameData.votes = votes;

    if (votes.length !== usersThatCanPlay.length) {
      io.in(roomId).emit("game:undercover:data", { data: gameData });
      return;
    }

    const mostVotedPlayer = votes.reduce((acc: any, vote: IUndercoverVote) => {
      const voteNumber = votes.filter((v) => v.vote === vote.vote).length;
      if (!acc) return undefined
      if (acc.count > 0 && acc.count === voteNumber && acc.vote !== vote.vote) return undefined;

      return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
    }, { count: 0 })

    const isVoteTied = !mostVotedPlayer;
    const isMostVotedUndercover = !isVoteTied && gameData.undercoverPlayerIds?.includes(mostVotedPlayer.vote);

    if (!isVoteTied && isMostVotedUndercover) {
      roomData.gameState = 'results';
      gameData.campWin = 'civilian';
      io.in(roomId).emit("game:undercover:data", { data: gameData });
      io.in(roomId).emit("room:updated", roomData);
      return;
    }

    if (!isVoteTied && !isMostVotedUndercover) {
      const votedPlayerIndex = users.findIndex((u) => u.id === mostVotedPlayer.vote);
      if (votedPlayerIndex === -1) return;
      const user = roomData.users[votedPlayerIndex];
      roomData.users[votedPlayerIndex] = {
        ...user,
        isEliminated: true
      }

      const notEliminatedPlayers = users.filter((u) => !u.isEliminated).length;

      if (notEliminatedPlayers < 3) {
        roomData.gameState = 'results';
        gameData.campWin = 'undercover';
        io.in(roomId).emit("game:undercover:data", { data: gameData });
        io.in(roomId).emit("room:updated", roomData);
        return;
      }
    }

    const usersNotEliminated = roomData.users.filter((u) => !u.isEliminated);
    const currentPlayerIndex = usersNotEliminated.findIndex((u: SocketUser) => u.id === gameData.playerTurn);
    const randomPlayer = usersNotEliminated[currentPlayerIndex + 1] ? usersNotEliminated[currentPlayerIndex + 1].id : usersNotEliminated[0].id;

    gameData.playerTurn = randomPlayer;
    gameData.state = 'words';
    gameData.turn = gameTurn + 1;
    gameData.votes = [];
    io.in(roomId).emit("game:undercover:data", { data: gameData });
    io.in(roomId).emit("room:updated", roomData);
  };

  const onGetData = (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    const gameData = roomData.gameData || defaultUndercoverGameData;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  }

  socket.on("game:undercover:initialize", onInitialize);
  socket.on("game:undercover:send-word", onSendWord);
  socket.on("game:undercover:vote", onVote);
  socket.on("game:undercover:get-data", onGetData);
};

export default UndercoverHandler;
