/* eslint-disable @typescript-eslint/no-unused-vars */
// import { getRandomIndex } from "../../../utils/functions";
import RoomLogger from "../../logs-handler";
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

// Socket handlers
const SpeedrundleHandler = (io: IoType, socket: SocketType) => {
  const roomLogger = new RoomLogger();

  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultSpeedrundleGameData;
    if (!roomData.config?.theme) return;
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
    }));
    gameData.columns =
      (speedrundleColumns.league_of_legends as ISpeedrundleLeagueOfLegendsColumn) ||
      [];

    roomLogger.onGameInitialized(roomData);

    io.in(roomId).emit("game:speedrundle:data", {
      ...roomData,
      data: gameData,
    });
  };

  const onGuess = (roomId: string, userId: string, characterId: string) => {
    const roomData = roomsDataMap.get(roomId) as ISpeedrundleRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    console.log("roomId", roomId);
    console.log("userId", userId);
    console.log("characterId", characterId);
    const gameData = roomData.gameData || defaultSpeedrundleGameData;

    const userAnswers: ISpeedrundleAnswer | undefined =
      gameData.usersAnswers.find(({ playerId }) => playerId === userId);

    if (!userAnswers) return;

    const thisRoundGuesses =
      userAnswers.guesses[userAnswers.currentRound - 1] || [];
    userAnswers.guesses[userAnswers.currentRound - 1] = [
      ...thisRoundGuesses,
      characterId,
    ];
    console.log("gameData", gameData);

    io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  };

  // const onVote = ({ roomId, userId, vote }: ISpeedrundleSendVote) => {
  //   const roomData = (roomsDataMap.get(roomId) as ISpeedrundleRoomData);
  //   if (!roomData) return socket.emit("room:not-found", roomId);

  //   const gameData = roomData.gameData || defaultSpeedrundleGameData;
  //   const votes = gameData.votes || [];
  //   const users = roomData.users || [];
  //   const gameTurn = gameData.turn || 1;
  //   const usersThatCanPlay = roomData.users.filter((u) => !u.isEliminated);

  //   votes.push({ playerId: userId, vote })
  //   gameData.votes = votes;

  //   if (votes.length !== usersThatCanPlay.length) {
  //     io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  //     return;
  //   }

  //   const mostVotedPlayer = votes.reduce((acc: any, vote: ISpeedrundleVote) => {
  //     const voteNumber = votes.filter((v) => v.vote === vote.vote).length;
  //     if (!acc) return undefined
  //     if (acc.count > 0 && acc.count === voteNumber && acc.vote !== vote.vote) return undefined;

  //     return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
  //   }, { count: 0 })

  //   const isVoteTied = !mostVotedPlayer;
  //   const isMostVotedSpeedrundle = !isVoteTied && gameData.undercoverPlayerIds?.includes(mostVotedPlayer.vote);

  //   if (!isVoteTied && isMostVotedSpeedrundle) {
  //     roomData.gameState = 'results';
  //     gameData.campWin = 'civilian';
  //     io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  //     io.in(roomId).emit("room:updated", roomData);
  //     return;
  //   }

  //   if (!isVoteTied && !isMostVotedSpeedrundle) {
  //     const votedPlayerIndex = users.findIndex((u) => u.id === mostVotedPlayer.vote);
  //     if (votedPlayerIndex === -1) return;
  //     const user = roomData.users[votedPlayerIndex];
  //     roomData.users[votedPlayerIndex] = {
  //       ...user,
  //       isEliminated: true
  //     }

  //     const notEliminatedPlayers = users.filter((u) => !u.isEliminated).length;

  //     if (notEliminatedPlayers < 3) {
  //       roomData.gameState = 'results';
  //       gameData.campWin = 'undercover';
  //       io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  //       io.in(roomId).emit("room:updated", roomData);
  //       return;
  //     }
  //   }

  //   const usersNotEliminated = roomData.users.filter((u) => !u.isEliminated);
  //   const currentPlayerIndex = usersNotEliminated.findIndex((u: SocketUser) => u.id === gameData.playerTurn);
  //   const randomPlayer = usersNotEliminated[currentPlayerIndex + 1] ? usersNotEliminated[currentPlayerIndex + 1].id : usersNotEliminated[0].id;

  //   gameData.playerTurn = randomPlayer;
  //   gameData.state = 'words';
  //   gameData.turn = gameTurn + 1;
  //   gameData.votes = [];
  //   io.in(roomId).emit("game:speedrundle:data", { data: gameData });
  //   io.in(roomId).emit("room:updated", roomData);
  // };

  socket.on("game:speedrundle:initialize", onInitialize);
  socket.on("game:speedrundle:guess", onGuess);
  // socket.on("game:speedrundle:vote", onVote);
};

export default SpeedrundleHandler;
