import gameRecordsService from "../../../modules/gameRecords/gameRecords.service";
import { roomsDataMap } from "../../room-handler";
import { GameState, IoType, SocketType } from "../../types";
import Cupidon from "./roles/Cupidon";
import Hunter from "./roles/Hunter";
import Psychic from "./roles/Psychic";
import Thief from "./roles/Thief";
import Villager from "./roles/Villager";
import Witch from "./roles/Witch";
import { nightRolesOrder } from "./werewolves.constants";
import {
  getAvailableRoles,
  getAvailableRolesInstance,
  getCoupleFromUser,
  getIsGameEnded,
  getNextPlayingRole,
  getThiefUsersIds,
  handleGiveUsersRoles,
} from "./werewolves.functions";
import {
  IWerewolvesGameData,
  IWerewolvesRoomData,
  IWerewolvesSendCouple,
  IWerewolvesTarget,
  IWerewolvesSendTarget,
  defaultWerewolvesConfig,
  defaultWerewolvesGameData,
} from "./werewolves.types";

const saveGame = (roomData: IWerewolvesRoomData) => {
  const { gameData, config } = roomData;
  if (!gameData) return;
  const {
    wolfVotes,
    villageVotes,
    witchSaves,
    witchKills,
    hunterKills,
    psychicWatch,
    roles,
    swapedRoles,
    thiefUsers,
    couple,
    campWin,
    usersThatPlayed,
  } = gameData;

  gameRecordsService.insertGameRecord({
    gameName: "werewolves",
    users: roomData.users.map(({ _id }) => _id),
    wolfVotes,
    villageVotes,
    witchSaves,
    witchKills,
    hunterKills,
    psychicWatch,
    roles,
    swapedRoles,
    thiefUsers,
    couple,
    campWin,
    usersThatPlayed: usersThatPlayed?.map(({ _id }) => _id),
    config,
  });
};

const WerewolvesHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = async (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;

    gameData.state = "day";
    gameData.turn = 0;
    gameData.wolfVotes = [];
    gameData.villageVotes = [];
    gameData.tmpVotes = [];
    gameData.witchSaves = [];
    gameData.witchKills = [];
    gameData.witchSkips = [];
    gameData.hunterKills = [];
    gameData.psychicWatch = [];
    gameData.swapedRoles = undefined;
    gameData.thiefUsers = {};
    gameData.couple = {};
    gameData.roleTurn = undefined;
    gameData.campWin = undefined;
    gameData.roles = handleGiveUsersRoles(
      roomData.users,
      config.composition,
      gameData
    );
    gameData.usersThatPlayed = [...roomData.users];

    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
    setTimeout(() => io.in(roomId).emit("game:werewolves:start"), 200);

    setTimeout(() => {
      gameData.state = "night";
      const compositionRoles = getAvailableRolesInstance(
        config.composition,
        gameData
      );
      const order = nightRolesOrder.filter((role) =>
        compositionRoles.some((comp) => comp instanceof role)
      );
      const playerRoleToPlay = order[0];

      if (playerRoleToPlay) {
        const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
        gameData.roleTurn = roleTurn?.name;
      }

      if (order.includes(Thief)) {
        const thieves = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId] instanceof Thief);
        gameData.thiefUsers = getThiefUsersIds(roomData, thieves);
      }

      gameData.turn = 1;

      io.in(roomId).emit("game:werewolves:state", { data: gameData });
    }, 5000);
  };

  const onGetData = (roomId: string) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  };

  const onWolfVote = ({ roomId, userId, target }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.wolfVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter(
      (u) =>
        gameData.roles[u._id]?.isAlive &&
        gameData.roles[u._id]?.camp === "wolves"
    );

    votes.push({ playerId: userId, target, turn: gameTurn });
    gameData.wolfVotes = votes;
    gameData.tmpVotes = votes.filter((v) => v.playerId !== userId);

    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);

    if (currentTurnVotes.length !== usersThatCanVote.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const mostVotedPlayer = currentTurnVotes.reduce(
      (acc: any, vote: IWerewolvesTarget) => {
        const voteNumber = currentTurnVotes.filter(
          (v) => v.target === vote.target
        ).length;
        if (!acc) return undefined;
        if (acc.count > 0 && acc.count === voteNumber && acc.target !== vote.target)
          return undefined;

        return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
      },
      { count: 0 }
    );

    const isVoteTied = !mostVotedPlayer;

    if (!isVoteTied) {
      const votedUser = roomData.users.find(
        (u) => u._id === mostVotedPlayer.target
      );
      if (!votedUser) return;

      const isWitchAlive = Object.values(gameData.roles).some(
        (role) => role instanceof Witch && role?.isAlive
      );
      const isVotedHunter = gameData.roles[votedUser._id] instanceof Hunter;

      if (isWitchAlive || isVotedHunter) {
        gameData.roles[votedUser._id]?.setIsBeingKilled(true);
      } else {
        gameData.roles[votedUser._id]?.setIsAlive(false);
      }
      gameData.roles[votedUser._id]?.setDeathTurn(gameTurn);

      const otherCoupleUsers = getCoupleFromUser(roomData, votedUser._id);
      const isPartOfCouple = otherCoupleUsers?.includes(votedUser._id);

      for (const coupleUserId of otherCoupleUsers) {
        if (isPartOfCouple && !isWitchAlive) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }

      const compositionRoles = getAvailableRoles(config.composition, gameData);
      const gameRoles = compositionRoles.filter((role) =>
        Object.values(gameData.roles).some(
          (r) => r instanceof role && r.isAlive
        )
      );
      const order = nightRolesOrder.filter((role) =>
        gameRoles.some((comp) => comp === role)
      );
      const currentRole = Object.values(gameData.roles).find(
        (role) => role?.name === gameData.roleTurn
      );
      const currentRoleTurnIndex = order.findIndex(
        (role) => currentRole instanceof role
      );

      const playerRoleToPlay = order[currentRoleTurnIndex + 1];

      if (playerRoleToPlay) {
        gameData.roleTurn = new playerRoleToPlay().name;
      } else {
        gameData.roleTurn =
          gameData.roles[votedUser._id] instanceof Hunter
            ? gameData.roles[votedUser._id]?.name
            : "Village";
        gameData.state = "day";
      }

      gameData.tmpVotes = [];
      roomData.gameData = gameData;

      const isGameEnded = getIsGameEnded({ ...roomData, gameData });

      if (isGameEnded) {
        roomData.gameState = isGameEnded.gameState as GameState;
        roomData.gameData = isGameEnded.gameData;
        saveGame(roomData)
      }

      io.in(roomId).emit("room:updated", roomData);
      return;
    }

    const isGameEnded = getIsGameEnded({ ...roomData, gameData });

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  };

  const onWolfVoteSelectPlayer = ({
    roomId,
    userId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const votes = gameData.tmpVotes?.filter((v) => v.playerId !== userId) || [];

    if (target) {
      votes.push({ playerId: userId, target });
      gameData.tmpVotes = votes;
    }

    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  };

  const onWitchSavePlayer = ({
    roomId,
    userId: playerId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchSaves = gameData.witchSaves || [];
    const witchKills = gameData.witchKills || [];
    const witchSkips = gameData.witchSkips || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    witchSaves.push({ playerId, target, turn: gameTurn });
    gameData.witchSaves = witchSaves;

    const currentTurnVotes = [...witchKills, ...witchSaves, ...witchSkips].filter((v) => v.turn === gameTurn);
    const witchesUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Witch &&
        gameData.roles[u._id]?.isAlive
    );

    if (currentTurnVotes.length !== witchesUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const votedPlayer = roomData.users.find((u) => u._id === target);

    if (!votedPlayer) return;
    gameData.roles[votedPlayer._id]?.setIsBeingKilled(false);
    gameData.roles[votedPlayer._id]?.setDeathTurn(undefined);

    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const otherCoupleUsers = getCoupleFromUser(roomData, userId);
      const isPartOfCouple = otherCoupleUsers?.includes(userId);

      for (const coupleUserId of otherCoupleUsers) {
        if (isPartOfCouple && !isHunter) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }
    }

    const currentPlayer = roomData.users.find((u) => u._id === playerId);
    if (!currentPlayer) return;
    (gameData.roles[currentPlayer._id] as Witch).power.useSavePotion();

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
    const currentRole = Object.values(gameData.roles).find(
      (role) => role?.name === gameData.roleTurn
    );
    const currentRoleTurnIndex = order.findIndex(
      (role) => currentRole instanceof role
    );

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find(
        (userId) => gameData.roles[userId] instanceof Hunter
      );
      const isHunterBeingKilled = beingKilledPlayers.includes(
        hunterPlayer as string
      );
      gameData.roleTurn = isHunterBeingKilled
        ? Object.values(gameData.roles).find((role) => role instanceof Hunter)
            ?.name
        : "Village";
      gameData.state = "day";
    }

    roomData.gameData = gameData;
    io.in(roomId).emit("room:updated", roomData);
  };

  const onWitchKillPlayer = ({
    roomId,
    userId: playerId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchKills = gameData.witchKills || [];
    const witchSaves = gameData.witchSaves || [];
    const witchSkips = gameData.witchSkips || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    witchKills.push({ playerId, target, turn: gameTurn });
    gameData.witchKills = witchKills;

    const currentTurnVotes = [...witchKills, ...witchSaves, ...witchSkips].filter((v) => v.turn === gameTurn);
    const witchesUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Witch &&
        gameData.roles[u._id]?.isAlive
    );

    if (currentTurnVotes.length !== witchesUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const votedPlayer = roomData.users.find((u) => u._id === target);
    if (!votedPlayer) return;
    gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);

    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const otherCoupleUsers = getCoupleFromUser(roomData, userId);
      const isPartOfCouple = otherCoupleUsers?.includes(userId);

      for (const coupleUserId of otherCoupleUsers) {
        if (isPartOfCouple && !isHunter) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }
    }

    const currentPlayer = roomData.users.find((u) => u._id === playerId);
    if (!currentPlayer) return;
    (gameData.roles[currentPlayer._id] as Witch).power.useKillPotion();

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
    const currentRole = Object.values(gameData.roles).find(
      (role) => role?.name === gameData.roleTurn
    );
    const currentRoleTurnIndex = order.findIndex(
      (role) => currentRole instanceof role
    );

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find(
        (userId) => gameData.roles[userId] instanceof Hunter
      );
      const isHunterBeingKilled = beingKilledPlayers.includes(
        hunterPlayer as string
      );
      gameData.roleTurn = isHunterBeingKilled
        ? Object.values(gameData.roles).find((role) => role instanceof Hunter)
            ?.name
        : "Village";
      gameData.state = "day";
    }

    const isGameEnded = getIsGameEnded({ ...roomData, gameData });

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  };

  const onWitchSkip = ({ roomId, playerId }: { roomId: string, playerId: string }) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const gameTurn = gameData.turn || 1;
    const witchSaves = gameData.witchSaves || [];
    const witchKills = gameData.witchKills || [];
    const witchSkips = gameData.witchSkips || [];
    
    witchSkips.push({ playerId , target: '', turn: gameTurn });
    gameData.witchKills = witchKills;

    const currentTurnVotes = [...witchKills, ...witchSaves, ...witchSkips].filter((v) => v.turn === gameTurn);
    const witchesUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Witch &&
        gameData.roles[u._id]?.isAlive
    );

    if (currentTurnVotes.length !== witchesUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const otherCoupleUsers = getCoupleFromUser(roomData, userId);
      const isPartOfCouple = otherCoupleUsers?.includes(userId);

      for (const coupleUserId of otherCoupleUsers) {
        if (isPartOfCouple && !isHunter) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }
    }

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
    const currentRole = Object.values(gameData.roles).find(
      (role) => role?.name === gameData.roleTurn
    );
    const currentRoleTurnIndex = order.findIndex(
      (role) => currentRole instanceof role
    );

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find(
        (userId) => gameData.roles[userId] instanceof Hunter
      );
      const isHunterBeingKilled = beingKilledPlayers.includes(
        hunterPlayer as string
      );
      gameData.roleTurn = isHunterBeingKilled
        ? Object.values(gameData.roles).find((role) => role instanceof Hunter)
            ?.name
        : "Village";
      gameData.state = "day";
    }

    const isGameEnded = getIsGameEnded({ ...roomData, gameData });

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  };

  const onVillageVote = ({ roomId, userId, target }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.villageVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter(
      (u) => gameData.roles[u._id]?.isAlive
    );

    votes.push({ playerId: userId, target, turn: gameTurn });
    gameData.villageVotes = votes;
    gameData.tmpVotes = gameData.tmpVotes?.filter((v) => v.playerId !== userId);

    const currentTurnVotes = votes.filter((v) => v.turn === gameTurn);

    if (currentTurnVotes.length !== usersThatCanVote.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const mostVotedPlayer = currentTurnVotes.reduce(
      (acc: any, vote: IWerewolvesTarget) => {
        const voteNumber = currentTurnVotes.filter(
          (v) => v.target === vote.target
        ).length;
        if (!acc) return undefined;
        if (acc.count > 0 && acc.count === voteNumber && acc.target !== vote.target)
          return undefined;

        return acc.count > voteNumber ? acc : { ...vote, count: voteNumber };
      },
      { count: 0 }
    );

    const isVoteTied = !mostVotedPlayer;

    const votedPlayer = roomData.users.find(
      (u) => u._id === mostVotedPlayer?.target
    );
    if (!isVoteTied && votedPlayer) {
      const isHunterVoted = gameData.roles[votedPlayer._id] instanceof Hunter;

      const otherCoupleUsers = getCoupleFromUser(roomData, votedPlayer._id);
      const isPartOfCouple = otherCoupleUsers?.includes(votedPlayer._id);

      for (const coupleUserId of otherCoupleUsers) {
        if (isHunterVoted) {
          gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);
          if (isPartOfCouple) {
            gameData.roles[coupleUserId]?.setIsBeingKilled(true);
          }
        } else {
          gameData.roles[votedPlayer._id]?.setIsAlive(false);
          if (isPartOfCouple) {
            gameData.roles[coupleUserId]?.setIsAlive(false);
            gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
          }
        }
      }

      gameData.roles[votedPlayer._id]?.setDeathTurn(gameTurn);

      if (isHunterVoted) {
        gameData.roleTurn = gameData.roles[votedPlayer._id]?.name;
        roomData.gameData = gameData;

        io.in(roomId).emit("room:updated", roomData);
        return;
      }
    }

    gameData.turn += 1;
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );

    const playerRoleToPlay = order[0];
    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find(
        (role) => role instanceof playerRoleToPlay
      );
      gameData.roleTurn = roleTurn?.name;
      gameData.state = "night";
    }

    gameData.tmpVotes = [];

    const isGameEnded = getIsGameEnded({ ...roomData, gameData });

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  };

  const onHunterKillPlayer = ({
    roomId,
    userId: playerId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const villageVotes = gameData.villageVotes || [];
    const hunterKills = gameData.hunterKills || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    hunterKills.push({ playerId, target, turn: gameTurn });
    gameData.hunterKills = hunterKills;

    const hunterPlayer = roomData.users.find((u) => u._id === playerId);
    if (hunterPlayer) {
      gameData.roles[hunterPlayer._id]?.setIsBeingKilled(false);
      gameData.roles[hunterPlayer._id]?.setIsAlive(false);
    }

    const votedPlayer = roomData.users.find((u) => u._id === target);
    if (votedPlayer) {
      gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);
    }

    const beingKilledPlayers = Object.keys(gameData.roles).filter(
      (userId) => gameData.roles[userId].isBeingKilled
    );

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
      }
      gameData.roles[userId]?.setDeathTurn(gameTurn);

      const otherCoupleUsers = getCoupleFromUser(roomData, userId);
      const isPartOfCouple = otherCoupleUsers?.includes(userId);

      if (!isPartOfCouple) continue;

      for (const coupleUserId of otherCoupleUsers) {
        const isCoupleHunter = gameData.roles[coupleUserId] instanceof Hunter;
        if (!isCoupleHunter) {
          gameData.roles[coupleUserId]?.setIsAlive(false);
          gameData.roles[coupleUserId]?.setDeathTurn(gameTurn);
        }
      }
    }

    const villageAlreadyVoted = !!villageVotes.find((v) => v.turn === gameTurn);
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) =>
      Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive)
    );
    const order = nightRolesOrder.filter((role) =>
      gameRoles.some((comp) => comp === role)
    );
    const playerRoleToPlay = order[0];

    const isVotedPlayerHunter = gameData.roles[votedPlayer!._id] instanceof Hunter;

    if (isVotedPlayerHunter) {
      gameData.roleTurn = new Hunter().name;
      gameData.state = 'day';
    } else if (!isVotedPlayerHunter && villageAlreadyVoted) {
      gameData.turn += 1;
      gameData.roleTurn = new playerRoleToPlay().name;
      gameData.state = "night";
    } else {
      gameData.roleTurn = "Village";
      gameData.state = "day";
    }

    const isGameEnded = getIsGameEnded({ ...roomData, gameData });

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
      saveGame(roomData)
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  };

  const onPsychicWatchRole = ({
    roomId,
    userId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const psychicWatch = gameData.psychicWatch || [];
    const gameTurn = gameData.turn || 1;

    psychicWatch.push({ playerId: userId, target, turn: gameTurn });
    gameData.psychicWatch = psychicWatch;

    const currentTurnVotes = psychicWatch.filter((v) => v.turn === gameTurn);
    const psychicsUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Psychic &&
        gameData.roles[u._id]?.isAlive
    );

    if (currentTurnVotes.length !== psychicsUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    };
    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  };

  const onCupidonDefineCouple = ({ roomId, playerId, couple }: IWerewolvesSendCouple) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const couples = gameData.couple || {};

    couples[playerId] = couple;
    gameData.couple = couples;

    const currentTurnVotes = Object.values(gameData.couple);
    const cupidonUsers = roomData.users.filter(
      (u) =>
        gameData.roles[u._id] instanceof Cupidon &&
        gameData.roles[u._id]?.isAlive
    );

    if (currentTurnVotes.length !== cupidonUsers.length) {
      io.in(roomId).emit("game:werewolves:data", {
        ...roomData,
        data: gameData,
      });
      return;
    }

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    };

    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  };

  const onThiefChooseRole = ({
    roomId,
    userId,
    target,
  }: IWerewolvesSendTarget) => {
    const roomData = roomsDataMap.get(roomId) as IWerewolvesRoomData;
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const currentUser = roomData.users.find((u) => u._id === userId);
    const targetUser = roomData.users.find((u) => u._id === target);
    const gameTurn = gameData.turn || 1;

    gameData.swapedRoles = [
      ...gameData.swapedRoles || [],
      {
        playerId: currentUser!._id,
        target: targetUser!._id,
        turn: gameTurn,
        roles: {
          [currentUser!._id]: gameData.roles[currentUser!._id],
          [targetUser!._id]: gameData.roles[targetUser!._id],
        }
      }
    ];

    const votesThisTurn = gameData.swapedRoles.filter((swapedRole) => swapedRole.turn === gameTurn);
    const thiefUsers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId] instanceof Thief && gameData.roles[userId].isAlive);

    if (thiefUsers.length !== votesThisTurn.length) {
      roomData.gameData = gameData;
      io.in(roomId).emit("room:updated", roomData);
      return;
    }

    for (const swapedRole of gameData.swapedRoles) {
      gameData.roles[swapedRole.playerId] = gameData.roles[swapedRole.target];
      gameData.roles[swapedRole.target] = new Villager();
    }

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    };

    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  };

  socket.on("game:werewolves:initialize", onInitialize);
  socket.on("game:werewolves:get-data", onGetData);
  socket.on("game:werewolves:vote:tmp", onWolfVoteSelectPlayer);
  socket.on("game:werewolves:village:vote", onVillageVote);
  socket.on("game:werewolves:wolf:vote", onWolfVote);
  socket.on("game:werewolves:witch:save", onWitchSavePlayer);
  socket.on("game:werewolves:witch:kill", onWitchKillPlayer);
  socket.on("game:werewolves:witch:skip", onWitchSkip);
  socket.on("game:werewolves:hunter:kill", onHunterKillPlayer);
  socket.on("game:werewolves:psychic:watch", onPsychicWatchRole);
  socket.on("game:werewolves:cupidon:couple", onCupidonDefineCouple);
  socket.on("game:werewolves:thief:choose", onThiefChooseRole);
};

export default WerewolvesHandler;
