import { roomsDataMap } from "../../room-handler";
import { IoType, SocketType } from "../../types";
import { nightRolesOrder } from "./werewolves.constants";
import { getAvailableRoles, getAvailableRolesInstance, handleGiveUsersRoles } from "./werewolves.functions";
import { IWerewolvesRoomData, IWerewolvesSendKill, IWerewolvesSendSave, IWerewolvesSendVote, IWerewolvesVote, defaultWerewolvesConfig, defaultWerewolvesGameData } from "./werewolves.types";

const WerewolvesHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = async (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = defaultWerewolvesConfig;

    gameData.state = 'day';
    gameData.turn = 1;
    gameData.wolfVotes = [];
    roomData.users = handleGiveUsersRoles(roomData.users, config.composition);

    io.in(roomId).emit("room:updated", roomData);
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
    io.in(roomId).emit("game:werewolves:start");

    setTimeout(() => {
      gameData.state = 'night';
      const compositionRoles = getAvailableRolesInstance(config.composition);
      const order = nightRolesOrder.filter((role) => compositionRoles.some((comp) => comp instanceof role));
      const playerRoleToPlay = order[0];
      const roleTurn = roomData.users.find((user) => user.role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.role?.name;

      io.in(roomId).emit("game:werewolves:data", { data: gameData });
      io.in(roomId).emit("game:werewolves:state");
    }, 5000)
  }

  const onGetData = (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onWolfVote = ({ roomId, userId, vote }: IWerewolvesSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = defaultWerewolvesConfig;
    const votes = gameData.wolfVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter((u) => u.role?.isAlive && u.role?.camp === 'loups')

    votes.push({ playerId: userId, vote, turn: gameTurn })
    gameData.wolfVotes = votes;
    gameData.tmpVotes = votes.filter((v) => v.playerId !== userId);

    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);

    if (currentTurnVotes.length !== usersThatCanVote.length) {
      io.in(roomId).emit("game:werewolves:data", { ...roomData, data: gameData });
      return;
    }

    const mostVotedPlayer = currentTurnVotes.reduce((acc: any, vote: IWerewolvesVote) => {
      const voteNumber = currentTurnVotes.filter((v) => v.vote === vote.vote).length;
      if (!acc) return undefined
      if (acc.count > 0 && acc.count === voteNumber && acc.vote !== vote.vote) return undefined;

      return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
    }, { count: 0 })

    const isVoteTied = !mostVotedPlayer;

    if (!isVoteTied) {
      const votedPlayerIndex = roomData.users.findIndex((u) => u._id === mostVotedPlayer.vote);
      if (votedPlayerIndex === -1) return;
      roomData.users[votedPlayerIndex].role?.setIsBeingKilled(true);
      roomData.users[votedPlayerIndex].role?.setDeathTurn(gameTurn);

      const compositionRoles = getAvailableRoles(config.composition);
      const gameRoles = compositionRoles.filter((role) => roomData.users.some((u) => u.role instanceof role));
      const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
      const currentRole = roomData.users.find((user) => user.role?.name === gameData.roleTurn)?.role;
      const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

      const playerRoleToPlay = order[currentRoleTurnIndex + 1];

      if (playerRoleToPlay) {
        const roleTurn = roomData.users.find((user) => user.role instanceof playerRoleToPlay);
        gameData.roleTurn = roleTurn?.role?.name;
      }

      gameData.tmpVotes = [];

      io.in(roomId).emit("room:updated", roomData);
      io.in(roomId).emit("game:werewolves:data", { data: gameData });
      return;
    }

    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onWolfVoteSelectPlayer = ({ roomId, userId, vote }: IWerewolvesSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const votes = gameData.tmpVotes?.filter((v) => v.playerId !== userId) || [];

    if (vote) {
      votes.push({ playerId: userId, vote })
      gameData.tmpVotes = votes;
    }

    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onWitchSavePlayer = ({ roomId, userId, save }: IWerewolvesSendSave) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchSaves = gameData.witchSaves || [];
    const gameTurn = gameData.turn || 1;
    const config = defaultWerewolvesConfig;

    witchSaves.push({ playerId: userId, save, turn: gameTurn })
    gameData.witchSaves = witchSaves;

    const votedPlayerIndex = roomData.users.findIndex((u) => u._id === save);
    if (votedPlayerIndex === -1) return;
    roomData.users[votedPlayerIndex].role?.setIsBeingKilled(false);
    roomData.users[votedPlayerIndex].role?.setDeathTurn(undefined);

    const compositionRoles = getAvailableRoles(config.composition);
    const gameRoles = compositionRoles.filter((role) => roomData.users.some((u) => u.role instanceof role));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = roomData.users.find((user) => user.role?.name === gameData.roleTurn)?.role;
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = roomData.users.find((user) => user.role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.role?.name;
    } else {
      gameData.state = 'day';
    }

    io.in(roomId).emit("room:updated", roomData);
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onWitchKillPlayer = ({ roomId, userId, kill }: IWerewolvesSendKill) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchKills = gameData.witchKills || [];
    const gameTurn = gameData.turn || 1;
    const config = defaultWerewolvesConfig;

    witchKills.push({ playerId: userId, kill, turn: gameTurn })
    gameData.witchKills = witchKills;

    const votedPlayerIndex = roomData.users.findIndex((u) => u._id === kill);
    if (votedPlayerIndex === -1) return;
    roomData.users[votedPlayerIndex].role?.setIsBeingKilled(false);
    roomData.users[votedPlayerIndex].role?.setIsAlive(false);
    roomData.users[votedPlayerIndex].role?.setDeathTurn(gameTurn);

    const compositionRoles = getAvailableRoles(config.composition);
    const gameRoles = compositionRoles.filter((role) => roomData.users.some((u) => u.role instanceof role));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = roomData.users.find((user) => user.role?.name === gameData.roleTurn)?.role;
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = roomData.users.find((user) => user.role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.role?.name;
    } else {
      gameData.state = 'day';
    }

    io.in(roomId).emit("room:updated", roomData);
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onVillageVote = ({ roomId, userId, vote }: IWerewolvesSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = defaultWerewolvesConfig;
    const votes = gameData.villageVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter((u) => u.role?.isAlive)

    votes.push({ playerId: userId, vote, turn: gameTurn })
    gameData.villageVotes = votes;
    gameData.tmpVotes = gameData.tmpVotes.filter((v) => v.playerId !== userId);

    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);

    if (currentTurnVotes.length !== usersThatCanVote.length) {
      io.in(roomId).emit("game:werewolves:data", { ...roomData, data: gameData });
      return;
    }

    const mostVotedPlayer = currentTurnVotes.reduce((acc: any, vote: IWerewolvesVote) => {
      const voteNumber = currentTurnVotes.filter((v) => v.vote === vote.vote).length;
      if (!acc) return undefined
      if (acc.count > 0 && acc.count === voteNumber && acc.vote !== vote.vote) return undefined;

      return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
    }, { count: 0 })

    const isVoteTied = !mostVotedPlayer;

    if (!isVoteTied) {
      const votedPlayerIndex = roomData.users.findIndex((u) => u._id === mostVotedPlayer.vote);
      if (votedPlayerIndex === -1) return;
      roomData.users[votedPlayerIndex].role?.setIsAlive(false)
      roomData.users[votedPlayerIndex].role?.setDeathTurn(gameTurn);

      io.in(roomId).emit("room:updated", roomData);
    }

    const compositionRoles = getAvailableRoles(config.composition);
    const gameRoles = compositionRoles.filter((role) => roomData.users.some((u) => u.role?.isAlive && u.role instanceof role));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));

    const playerRoleToPlay = order[0];

    if (playerRoleToPlay) {
      const roleTurn = roomData.users.find((user) => user.role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.role?.name;
    }

    gameData.tmpVotes = [];
    gameData.state = 'night';
    gameData.turn += 1;

    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  socket.on("game:werewolves:initialize", onInitialize);
  socket.on("game:werewolves:get-data", onGetData);
  socket.on("game:werewolves:vote:tmp", onWolfVoteSelectPlayer);
  socket.on("game:werewolves:village:vote", onVillageVote);

  socket.on("game:werewolves:wolf:vote", onWolfVote);

  socket.on("game:werewolves:witch:save", onWitchSavePlayer);
  socket.on("game:werewolves:witch:kill", onWitchKillPlayer);
}

export default WerewolvesHandler;