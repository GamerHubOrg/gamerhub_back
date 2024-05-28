import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType, SocketUser } from "../../types";
import { IUndercoverRoomData, IUndercoverSendVote, IUndercoverSendWord, IUndercoverVote, defaultUndercoverGameData } from "./types";
import WordsDatabase from './words.json';

// Socket handlers
const UndercoverHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const words = gameData.words || [];
    const randomPlayer = roomData.users[0].id;

    const randomCategory = Math.floor(Math.random() * WordsDatabase.length);
    const wordCategory = WordsDatabase[randomCategory];
    const randomPair = Math.floor(Math.random() * wordCategory.length);
    const wordsPair = wordCategory[randomPair];
    const randomSpyWord = Math.floor(Math.random() * 2);

    const randomUser = Math.floor(Math.random() * roomData.users.length);

    gameData.undercoverPlayerIds = [roomData.users[randomUser].id];
    gameData.civilianWord = wordsPair[1 - randomSpyWord];
    gameData.spyWord = wordsPair[randomSpyWord];
    gameData.playerTurn = randomPlayer;
    gameData.words = words;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  const onSendWord = ({ roomId, userId, word }: IUndercoverSendWord) => {
    const roomData = (roomsDataMap.get(roomId) as IUndercoverRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const gameConfig = roomData.config || { wordsPerTurn: 3 };
    const words = gameData.words || [];
    const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

    words.push({
        playerId: userId,
        word
    })


    const validWords = words.filter((w) => usersThatCanPlay.some((u) => u.id === w.playerId))
    if (validWords.length % usersThatCanPlay.length === usersThatCanPlay.length % gameConfig.wordsPerTurn) {
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
    gameData.votes = [];
    io.in(roomId).emit("game:undercover:data", { data: gameData });
    io.in(roomId).emit("room:updated", roomData);
  };

  socket.on("game:undercover:initialize", onInitialize);
  socket.on("game:undercover:send-word", onSendWord);
  socket.on("game:undercover:vote", onVote);
};

export default UndercoverHandler;
