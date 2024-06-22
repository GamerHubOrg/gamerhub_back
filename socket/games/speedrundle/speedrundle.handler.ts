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
} from "./speedrundle.types";

const calculateScore = (time: number, nbTries: number) => {
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

// Socket handlers
const SpeedrundleHandler = (io: IoType, socket: SocketType) => {
  const roomLogger = new RoomLogger();

  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = defaultSpeedrundleGameData;
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
      roundsData: Array.from({ length: nbRounds }, (_, i) => ({
        guesses: [],
        score: 0,
        hasFound: false,
        startDate : new Date()
      })),
      score: 0,
      state: "playing",
    }));
    gameData.columns = speedrundleColumns.league_of_legends || [];

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
    const hasGuessedRight = currentGuess._id.toString() === characterId;

    // If he hasn't guessed right -> continue
    if (!hasGuessedRight)
      return socket.emit("game:speedrundle:data", { data: gameData });

    const currentScore = calculateScore(
      (new Date().getTime() - thisRoundData.startDate.getTime()) / 1000,
      thisRoundData.guesses.length
    );
    thisRoundData.score = currentScore;

    socket.emit('room:notifications:success', `Vous avez trouvé ${currentGuess.name} !`);
    socket.emit('game:speedrundle:find-character');

    // If one player is finished -> set state to "finished"
    const isLastRound = currentRound === roomData.config.nbRounds;
    if (isLastRound) {
      userAnswers.state = "finished";
      io.in(roomId).emit("game:speedrundle:data", { data: gameData });

      const allPlayersFinished = gameData.usersAnswers.every(
        (answer) => answer.state === "finished"
      );

      // If all players are finished -> results page
      if (allPlayersFinished) {
        roomData.gameState = "results";
        io.in(roomId).emit('game:speedrundle:end-game');
        io.in(roomId).emit("room:updated", roomData);
      }

      return;
    }

    // If he's not finished -> next character to guess   
    const newRound = userAnswers.currentRound + 1
    userAnswers.currentRound = newRound;
    userAnswers.roundsData[newRound -1].startDate = new Date();
    io.in(roomId).emit("game:speedrundle:data", { data: gameData }), 3000;
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
