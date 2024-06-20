/* eslint-disable @typescript-eslint/no-unused-vars */
// import { getRandomIndex } from "../../../utils/functions";
import { RoomLogger } from "../../logs-handler";
import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType } from "../../types";
import { getGameCharacters } from "./speedrundle.functions";
import {
  ISpeedrundleRoomData,
  defaultSpeedrundleGameData,
  speedrundleColumns,
  ISpeedrundleLeagueOfLegendsColumn,
  ISpeedrundleAnswer,
} from "./speedrundle.types";

const calculateScore = (time : number, nbTries : number) => {
  const baseScore = 1000;

  let reduction = 0;

  if (time > 10) {
    reduction += time * 0.8;
  }

  if (nbTries < 1) {
    reduction += nbTries * 0;
  } else if (nbTries < 15) {
    reduction += nbTries * 17;
  } else {
    reduction += nbTries * 22;
  }

  const ratio = (nbTries / time);
  if (ratio > 0.4) reduction += 20 / ratio;

  const reducedScore = baseScore - reduction;
  return Math.max(Math.round(reducedScore), 100);
};

// Socket handlers
const SpeedrundleHandler = (io: IoType, socket: SocketType) => {
  const roomLogger = new RoomLogger();

  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultSpeedrundleGameData;
    if (!roomData.config.theme) return;
    const allCharacters = await getGameCharacters(roomData.config?.theme);
    const nbRounds = roomData.config.nbRounds || 1;
    gameData.allCharacters = allCharacters;
    gameData.charactersToGuess = allCharacters
      .sort(() => 0.5 - Math.random())
      .slice(0, nbRounds);
    gameData.usersAnswers = roomData.users.map(({ _id }) => ({
      playerId: _id,
      currentRound: 1,
      guesses: [],
      score: 0,
    }));
    gameData.columns =
      (speedrundleColumns.league_of_legends as ISpeedrundleLeagueOfLegendsColumn) ||
      [];
    gameData.startDate = new Date();

    roomLogger.onGameInitialized(roomData);

    io.in(roomId).emit("game:speedrundle:data", {
      ...roomData,
      data: gameData,
    });
  };

  const onGuess = (roomId: string, userId: string, characterId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultSpeedrundleGameData;

    const userAnswers: ISpeedrundleAnswer | undefined =
      gameData.usersAnswers.find(({ playerId }) => playerId === userId);

    if (!userAnswers) return;

    const { currentRound } = userAnswers;

    const thisRoundGuesses = userAnswers.guesses[currentRound - 1] || [];
    userAnswers.guesses[currentRound - 1] = [...thisRoundGuesses, characterId];

    const currentGuess = gameData.charactersToGuess[currentRound - 1];

    if (currentGuess._id.toString() === characterId) {
      const currentScore = calculateScore(
        (new Date().getTime() - gameData.startDate.getTime())/1000,
        userAnswers.guesses[currentRound - 1].length
      );
      userAnswers.score += currentScore;
      if (currentRound < roomData.config.nbRounds) {
        userAnswers.currentRound = userAnswers.currentRound + 1;
        setTimeout(
          () => io.in(roomId).emit("game:speedrundle:data", { data: gameData }),
          3000
        );
      } else {
        // roomData.gameState = "results";
        setTimeout(() => {
          io.in(roomId).emit("game:speedrundle:data", { data: gameData });
          // io.in(roomId).emit("room:updated", roomData);
        }, 3000);
      }
    }

    socket.emit("game:speedrundle:data", { data: gameData });
  };

  const onGetData = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId);
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultSpeedrundleGameData;
    io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  };

  socket.on("game:speedrundle:initialize", onInitialize);
  socket.on("game:speedrundle:guess", onGuess);
  socket.on("game:speedrundle:get-data", onGetData);
};

export default SpeedrundleHandler;
