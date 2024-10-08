/* eslint-disable @typescript-eslint/no-unused-vars */
import gameRecordsService from "../../../modules/gameRecords/gameRecords.service";
import { RoomLogger, SpeedundleLogger } from "../../logs-handler";
import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType } from "../../types";
import { getCharacters } from "./speedrundle.functions";
import {
  ISpeedrundleRoomData,
  defaultSpeedrundleGameData,
  speedrundleColumns,
} from "./speedrundle.types";

export const calculateScore = (time: number, nbTries: number) => {
  const baseScore = 1000;

  let reduction = 0;

  if (time > 10) {
    reduction += time * 0.8;
  }

  if (nbTries <= 1) {
    reduction += nbTries * 0;
  } else if (nbTries < 15) {
    reduction += nbTries * 17;
  } else {
    reduction += nbTries * 22;
  }

  const ratio = nbTries / time;
  if (nbTries > 10 && ratio > 0.4) reduction += 20 / ratio;

  const reducedScore = baseScore - reduction;
  return Math.max(Math.round(reducedScore), 100);
};

const saveGame = (roomData: ISpeedrundleRoomData) => {
  const { gameData, config } = roomData;
  if (!gameData) return;
  const { columns, charactersToGuess, usersAnswers } = gameData;
  gameRecordsService.insertGameRecord({
    gameName: "speedrundle",
    users: roomData.users.map(({ _id }) => _id),
    columns,
    charactersToGuess: charactersToGuess.map(({ _id }) => _id),
    usersAnswers,
    config,
  });
};

// Socket handlers
const SpeedrundleHandler = (io: IoType, socket: SocketType) => {
  const roomLogger = new RoomLogger();
  const gameLogger = new SpeedundleLogger();

  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = defaultSpeedrundleGameData;
    const { theme, selectedColumns } = roomData.config;
    const selectedColumnsLength = selectedColumns?.length || 0;

    if (!theme)
      return socket.emit(
        "room:notifications:error",
        `speedrundle.selectTheme`
      );

    if (selectedColumnsLength < 1)
      return socket.emit(
        "room:notifications:error",
        `speedrundle.selectClues`
      );
    const allCharacters = await getCharacters(roomData.config);

    const nbRounds = roomData.config.nbRounds || 1;
    gameData.allCharacters = allCharacters;
    gameData.charactersToGuess = allCharacters
      .sort(() => 0.5 - Math.random())
      .slice(0, nbRounds);
    gameData.usersAnswers = roomData.users.map(({ _id }) => ({
      playerId: _id,
      currentRound: 1,
      roundsData: Array.from({ length: nbRounds }, () => ({
        guesses: [],
        score: 0,
        hasFound: false,
        startDate: new Date(),
      })),
      score: 0,
      state: "playing",
    }));
    gameData.columns =
      speedrundleColumns[theme].filter(
        ({ key, isIcon }) => isIcon || selectedColumns?.includes(key)
      ) || [];

    roomData.gameData = gameData;

    roomLogger.onGameInitialized(roomData);

    io.in(roomId).emit("game:speedrundle:data", {
      ...roomData,
      data: gameData,
    });
  };

  const onGuess = (roomId: string, userId: string, characterId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData;
    if (!gameData) return;

    const userAnswers = gameData.usersAnswers.find(
      ({ playerId }) => playerId === userId
    );

    if (!userAnswers) return;

    const { currentRound } = userAnswers;

    const thisRoundData = userAnswers.roundsData[currentRound - 1];
    thisRoundData.guesses = [...thisRoundData.guesses, characterId];

    const currentGuess = gameData.charactersToGuess[currentRound - 1];
    if (!currentGuess) {
      return;
    }
    const hasGuessedRight = currentGuess._id.toString() === characterId;

    // If he hasn't guessed right -> continue
    if (!hasGuessedRight) {
      const { charactersToGuess, allCharacters, ...data } = gameData;
      return socket.emit("game:speedrundle:data", { data }, userId);
    }

    const user = roomData.users.find((u) => u._id === userId);
    if (user) gameLogger.onFindGuess(roomData, user, currentRound);

    thisRoundData.hasFound = true;

    const currentScore = calculateScore(
      (new Date().getTime() - thisRoundData.startDate.getTime()) / 1000,
      thisRoundData.guesses.length
    );
    thisRoundData.score = currentScore;

    socket.emit(
      "room:notifications:success",
      "speedrundle.youGuessed",
      {name : currentGuess.name}
    );
    socket.emit("game:speedrundle:find-character");

    // If one player is finished -> set state to "finished"
    const isLastRound = currentRound === roomData.config.nbRounds;
    if (isLastRound) {
      if (user) gameLogger.onFinish(roomData, user);
      userAnswers.state = "finished";
      const { charactersToGuess, allCharacters, ...data } = gameData;
      io.in(roomId).emit("game:speedrundle:data", { data }, userId);

      const allPlayersFinished = gameData.usersAnswers.every(
        (answer) => answer.state === "finished"
      );

      // If all players are finished -> results page
      if (allPlayersFinished) {
        if (user) gameLogger.onGameEnded(roomData);
        roomData.gameState = "results";
        saveGame(roomData);
        io.in(roomId).emit("game:speedrundle:end-game");
        io.in(roomId).emit("room:updated", roomData);
      }

      return;
    }

    // If he's not finished -> next character to guess
    const newRound = userAnswers.currentRound + 1;
    userAnswers.currentRound = newRound;
    userAnswers.roundsData[newRound - 1].startDate = new Date();
    const { charactersToGuess, allCharacters, ...data } = gameData;
    io.in(roomId).emit("game:speedrundle:data", { data }, userId), 3000;
  };

  const onGiveUp = (roomId: string, userId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData;
    if (!gameData) return;

    const userAnswers = gameData.usersAnswers?.find(
      ({ playerId }) => playerId === userId
    );

    if (!userAnswers) return;

    const { currentRound } = userAnswers;

    const thisRoundData = userAnswers.roundsData[currentRound - 1];
    const currentGuess = gameData.charactersToGuess[currentRound - 1];
    thisRoundData.score = 0;

    const user = roomData.users.find((u) => u._id === userId);
    if (user) gameLogger.onAbandonGuess(roomData, user, currentRound);

    socket.emit(
      "room:notifications:error",
      "speedrundle.giveUp",
      {name : currentGuess.name}
    );
    socket.emit("game:speedrundle:give-up-character");

    // If this player is finished -> set state to "finished"
    const isLastRound = currentRound === roomData.config.nbRounds;
    if (isLastRound) {
      if (user) gameLogger.onFinish(roomData, user);

      userAnswers.state = "finished";
      const { charactersToGuess, allCharacters, ...data } = gameData;
      io.in(roomId).emit("game:speedrundle:data", { data }, userId);

      const allPlayersFinished = gameData.usersAnswers.every(
        (answer) => answer.state === "finished"
      );

      // If all players are finished -> results page
      if (allPlayersFinished) {
        if (user) gameLogger.onGameEnded(roomData);
        roomData.gameState = "results";
        saveGame(roomData);
        io.in(roomId).emit("game:speedrundle:end-game");
        io.in(roomId).emit("room:updated", roomData);
      }

      return;
    }

    // If he's not finished -> next character to guess
    const newRound = userAnswers.currentRound + 1;
    userAnswers.currentRound = newRound;
    userAnswers.roundsData[newRound - 1].startDate = new Date();
    const { charactersToGuess, allCharacters, ...data } = gameData;
    io.in(roomId).emit("game:speedrundle:data", { data }, userId), 3000;
  };

  const onGetData = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultSpeedrundleGameData;
    io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  };

  socket.on("game:speedrundle:initialize", onInitialize);
  socket.on("game:speedrundle:guess", onGuess);
  socket.on("game:speedrundle:give-up", onGiveUp);
  socket.on("game:speedrundle:get-data", onGetData);
};

export default SpeedrundleHandler;
