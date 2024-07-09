import gameRecordsService from "../../../modules/gameRecords/gameRecords.service";
import { getRandomElement } from "../../../utils/functions";
import { UndercoverLogger } from "../../logs-handler";
import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType, SocketUser } from "../../types";
import { getGameWords, getGameImages } from "./undercover.functions";
import {
  IUndercoverRoomData,
  IUndercoverSendVote,
  IUndercoverSendWord,
  IUndercoverVote,
  defaultUndercoverGameData,
  defaultUndercoverConfig,
  IUndercoverPlayer,
} from "./undercover.types";

const saveGame = (roomData: IUndercoverRoomData) => {
  const { gameData, config } = roomData;
  if (!gameData) return;
  const { words, votes, civilianWord, spyWord, undercoverPlayerIds, campWin } =
    gameData;
  gameRecordsService.insertGameRecord({
    gameName: "undercover",
    users: roomData.users.map(({ _id }) => _id),
    words,
    votes,
    civilianWord,
    spyWord,
    undercoverPlayerIds,
    campWin,
    config,
  });
};

// Socket handlers
const UndercoverHandler = (io: IoType, socket: SocketType) => {
  const gameLogger = new UndercoverLogger();

  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as IUndercoverRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const config = roomData.config || defaultUndercoverConfig;
    const words = gameData.words || [];
    const randomPlayerTurn = getRandomElement(roomData.users);
    const playerTurn = randomPlayerTurn._id;

    if (config.mode === "words") {
      const wordsPair = await getGameWords();
      const randomOrderWords = getRandomElement(wordsPair, wordsPair.length);
      gameData.civilianWord = randomOrderWords[0];
      gameData.spyWord = randomOrderWords[1];
    }

    if (config.mode === "images") {
      const imagesPair = await getGameImages();
      const randomOrderImages = getRandomElement(imagesPair, imagesPair.length);
      gameData.civilianWord = randomOrderImages[0];
      gameData.spyWord = randomOrderImages[1];
    }

    const randomSpies = getRandomElement(roomData.users, config.spyCount);

    gameData.undercoverPlayerIds =
      config.spyCount === 1 || config.spyCount > roomData.users.length
        ? [randomSpies._id]
        : randomSpies.map((u: IUndercoverPlayer) => u._id);
    gameData.playerTurn = playerTurn;
    gameData.words = words;
    gameData.turn = 1;

    io.in(roomId).emit("game:undercover:data", { data: gameData });
    io.in(roomId).emit("game:undercover:start");
  };

  const onSendWord = ({ roomId, userId, word }: IUndercoverSendWord) => {
    const roomData = roomsDataMap.get(roomId) as IUndercoverRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const gameConfig = roomData.config || defaultUndercoverConfig;
    const gameTurn = gameData.turn || 1;
    const words = gameData.words || [];
    const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

    words.push({
      playerId: userId,
      word,
    });

    const user = roomData.users.find(
      (u) => u._id === userId
    ) as IUndercoverPlayer;
    gameLogger.onSendWord(roomData, user, word);

    const validWords = words.filter((w) =>
      usersThatCanPlay.some((u) => u._id === w.playerId)
    );
    if (
      gameConfig.wordsPerTurn * usersThatCanPlay.length ===
      validWords.length / gameTurn
    ) {
      gameLogger.onCanVote(roomData);
      gameData.state = "vote";
      io.in(roomId).emit("game:undercover:data", {
        ...roomData,
        data: gameData,
      });
      io.in(roomId).emit("game:undercover:new-round");
      return;
    }

    const currentPlayerIndex = usersThatCanPlay.findIndex(
      (u: SocketUser) => u._id === userId
    );
    const randomPlayer = usersThatCanPlay[currentPlayerIndex + 1]
      ? usersThatCanPlay[currentPlayerIndex + 1]._id
      : usersThatCanPlay[0]._id;
    gameData.playerTurn = randomPlayer;
    gameData.words = words;

    io.in(roomId).emit("game:undercover:data", { ...roomData, data: gameData });
  };

  const onVote = ({ roomId, userId, vote }: IUndercoverSendVote) => {
    const roomData = roomsDataMap.get(roomId) as IUndercoverRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultUndercoverGameData;
    const votes = gameData.votes || [];
    const users = roomData.users || [];
    const gameTurn = gameData.turn || 1;
    const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

    votes.push({ playerId: userId, vote, turn: gameTurn });
    gameData.votes = votes;

    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);
    const user = roomData.users.find(
      (u) => u._id === userId
    ) as IUndercoverPlayer;
    const votedPlayer = roomData.users.find(
      (u) => u._id === vote
    ) as IUndercoverPlayer;
    gameLogger.onVote(roomData, user, votedPlayer);

    if (currentTurnVotes.length !== usersThatCanPlay.length) {
      io.in(roomId).emit("game:undercover:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const mostVotedPlayer = currentTurnVotes.reduce(
      (acc: any, vote: IUndercoverVote) => {
        const voteNumber = currentTurnVotes.filter(
          (v) => v.vote === vote.vote
        ).length;
        if (!acc) return undefined;
        if (acc.count > 0 && acc.count === voteNumber && acc.vote !== vote.vote)
          return undefined;

        return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
      },
      { count: 0 }
    );

    const isVoteTied = !mostVotedPlayer;
    const isMostVotedUndercover =
      !isVoteTied &&
      gameData.undercoverPlayerIds?.includes(mostVotedPlayer.vote);

    if (!isVoteTied && isMostVotedUndercover) {
      gameLogger.onSideWin(roomData, "civilian");
      roomData.gameState = "results";
      gameData.campWin = "civilian";
      saveGame(roomData);
      io.in(roomId).emit("game:undercover:data", {
        ...roomData,
        data: gameData,
      });
      io.in(roomId).emit("room:updated", roomData);
      return;
    }

    if (!isVoteTied && !isMostVotedUndercover) {
      const votedPlayerIndex = users.findIndex(
        (u) => u._id === mostVotedPlayer.vote
      );
      if (votedPlayerIndex === -1) return;
      const user = roomData.users[votedPlayerIndex];
      roomData.users[votedPlayerIndex] = {
        ...user,
        isEliminated: true,
      };

      io.in(roomId).emit(
        "room:notifications:info",
        `Joueur éliminé lors du vote : ${user.username}`
      );
      if (user.socket_id === socket.id) {
        socket.emit("room:notifications:error", "Vous avez été éliminé");
      }

      const notEliminatedPlayers = users.filter((u) => !u.isEliminated).length;

      if (notEliminatedPlayers < 3) {
        gameLogger.onSideWin(roomData, "undercover");
        roomData.gameState = "results";
        gameData.campWin = "undercover";
        saveGame(roomData);
        io.in(roomId).emit("game:undercover:data", { data: gameData });
        io.in(roomId).emit("room:updated", roomData);
        return;
      }
    }

    const usersNotEliminated = roomData.users.filter((u) => !u.isEliminated);
    const currentPlayerIndex = usersNotEliminated.findIndex(
      (u: SocketUser) => u._id === gameData.playerTurn
    );
    const randomPlayer = usersNotEliminated[currentPlayerIndex + 1]
      ? usersNotEliminated[currentPlayerIndex + 1]._id
      : usersNotEliminated[0]._id;

    io.in(roomId).emit(
      "room:notifications:info",
      "Le vote s'est soldé par une égalité"
    );
    io.in(roomId).emit("game:undercover:new-round");

    gameData.playerTurn = randomPlayer;
    gameData.state = "words";
    gameData.turn = gameTurn + 1;
    io.in(roomId).emit("game:undercover:data", { ...roomData, data: gameData });
    io.in(roomId).emit("room:updated", roomData);
  };

  const onGetData = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as IUndercoverRoomData;
    const gameData = roomData.gameData || defaultUndercoverGameData;
    io.in(roomId).emit("game:undercover:data", { data: gameData });
  };

  socket.on("game:undercover:initialize", onInitialize);
  socket.on("game:undercover:send-word", onSendWord);
  socket.on("game:undercover:vote", onVote);
  socket.on("game:undercover:get-data", onGetData);
};

export default UndercoverHandler;
