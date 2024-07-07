import { roomsDataMap } from "../../room-handler";
import { GameState, IoType, SocketType } from "../../types";
import Hunter from "./roles/Hunter";
import Thief from "./roles/Thief";
import Villager from "./roles/Villager";
import Witch from "./roles/Witch";
import { nightRolesOrder } from "./werewolves.constants";
import { getAvailableRoles, getAvailableRolesInstance, getIsGameEnded, getNextPlayingRole, getThiefUsersIds, handleGiveUsersRoles } from "./werewolves.functions";
import { IWerewolvesChooseRole, IWerewolvesGameData, IWerewolvesRoomData, IWerewolvesSendCouple, IWerewolvesSendKill, IWerewolvesSendSave, IWerewolvesSendVote, IWerewolvesSendWatchRole, IWerewolvesVote, defaultWerewolvesConfig, defaultWerewolvesGameData } from "./werewolves.types";

const WerewolvesHandler = (io: IoType, socket: SocketType) => {
  const onInitialize = async (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;

    gameData.state = 'day';
    gameData.turn = 0;
    gameData.wolfVotes = [];
    gameData.villageVotes = [];
    gameData.tmpVotes = [];
    gameData.witchSaves = [];
    gameData.witchKills = [];
    gameData.hunterKills = [];
    gameData.psychicWatch = [];
    gameData.swapedRoles = undefined;
    gameData.thiefUsers = [];
    gameData.couple = [];
    gameData.roleTurn = undefined;
    gameData.campWin = undefined;
    gameData.roles = handleGiveUsersRoles(roomData.users, config.composition, gameData);
    gameData.usersThatPlayed = [...roomData.users];

    roomData.gameData = gameData;
    
    io.in(roomId).emit("room:updated", roomData);
    setTimeout(() => io.in(roomId).emit("game:werewolves:start"), 200);

    setTimeout(() => {
      gameData.state = 'night';
      const compositionRoles = getAvailableRolesInstance(config.composition, gameData);
      const order = nightRolesOrder.filter((role) => compositionRoles.some((comp) => comp instanceof role));
      const playerRoleToPlay = order[0];
      
      if (playerRoleToPlay) {
        const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
        gameData.roleTurn = roleTurn?.name;
      }

      if (order.includes(Thief)) {
        gameData.thiefUsers = getThiefUsersIds(roomData);
      }

      gameData.turn = 1;

      io.in(roomId).emit("game:werewolves:state", { data: gameData });
    }, 5000)
  }

  const onGetData = (roomId: string) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);
    const gameData = roomData.gameData || defaultWerewolvesGameData;
    io.in(roomId).emit("game:werewolves:data", { data: gameData });
  }

  const onWolfVote = ({ roomId, userId, vote }: IWerewolvesSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.wolfVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter((u) => gameData.roles[u._id]?.isAlive && gameData.roles[u._id]?.camp === 'wolves')

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
      const votedUser = roomData.users.find((u) => u._id === mostVotedPlayer.vote);
      if (!votedUser) return;

      const isWitchAlive = Object.values(gameData.roles).find((role) => role instanceof Witch && role?.isAlive);
      const isVotedHunter = gameData.roles[votedUser._id] instanceof Hunter;

      if (isWitchAlive || isVotedHunter) {
        gameData.roles[votedUser._id]?.setIsBeingKilled(true);
      } else {
        gameData.roles[votedUser._id]?.setIsAlive(false);
      }
      gameData.roles[votedUser._id]?.setDeathTurn(gameTurn);

      const isPartOfCouple = gameData.couple?.includes(votedUser._id);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== votedUser._id);

      if (isPartOfCouple && !isWitchAlive) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }

      const compositionRoles = getAvailableRoles(config.composition, gameData);
      const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
      const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
      const currentRole = Object.values(gameData.roles).find((role) => role?.name === gameData.roleTurn);
      const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

      const playerRoleToPlay = order[currentRoleTurnIndex + 1];

      if (playerRoleToPlay) {
        const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
        gameData.roleTurn = roleTurn?.name;
      } else {
        gameData.roleTurn = gameData.roles[votedUser._id] instanceof Hunter ? gameData.roles[votedUser._id]?.name : 'Village';
        gameData.state = 'day';
      }

      gameData.tmpVotes = [];
      roomData.gameData = gameData;

      const isGameEnded = getIsGameEnded({...roomData, gameData});

      if (isGameEnded) {
        roomData.gameState = isGameEnded.gameState as GameState;
        roomData.gameData = isGameEnded.gameData;
      }

      io.in(roomId).emit("room:updated", roomData);
      return;
    }

    const isGameEnded = getIsGameEnded({...roomData, gameData});

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
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

  const onWitchSavePlayer = ({ roomId, userId: playerId, save }: IWerewolvesSendSave) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchSaves = gameData.witchSaves || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    witchSaves.push({ playerId, save, turn: gameTurn })
    gameData.witchSaves = witchSaves;

    const votedPlayer = roomData.users.find((u) => u._id === save);
  
    if (!votedPlayer) return;
    gameData.roles[votedPlayer._id]?.setIsBeingKilled(false);
    gameData.roles[votedPlayer._id]?.setDeathTurn(undefined);

    const beingKilledPlayers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId].isBeingKilled);

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const isPartOfCouple = gameData.couple?.includes(userId);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== userId);

      if (isPartOfCouple && !isHunter) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }

    const currentPlayer = roomData.users.find((u) => u._id === playerId);
    if (!currentPlayer) return;
    (gameData.roles[currentPlayer._id] as Witch).power.useSavePotion();

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = Object.values(gameData.roles).find((role) => role?.name === gameData.roleTurn);
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find((userId) => gameData.roles[userId] instanceof Hunter);
      const isHunterBeingKilled = beingKilledPlayers.includes(hunterPlayer as string);
      gameData.roleTurn = isHunterBeingKilled ? Object.values(gameData.roles).find((role) => role instanceof Hunter)?.name : 'Village';
      gameData.state = 'day';
    }

    roomData.gameData = gameData;
    io.in(roomId).emit("room:updated", roomData);
  }

  const onWitchKillPlayer = ({ roomId, userId: playerId, kill }: IWerewolvesSendKill) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const witchKills = gameData.witchKills || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    witchKills.push({ playerId, kill, turn: gameTurn })
    gameData.witchKills = witchKills;

    const votedPlayer = roomData.users.find((u) => u._id === kill);
    if (!votedPlayer) return;
    gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);

    const beingKilledPlayers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId].isBeingKilled);

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const isPartOfCouple = gameData.couple?.includes(userId);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== userId);

      if (isPartOfCouple && !isHunter) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }

    const currentPlayer = roomData.users.find((u) => u._id === playerId);
    if (!currentPlayer) return;
    (gameData.roles[currentPlayer._id] as Witch).power.useKillPotion();

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = Object.values(gameData.roles).find((role) => role?.name === gameData.roleTurn);
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find((userId) => gameData.roles[userId] instanceof Hunter);
      const isHunterBeingKilled = beingKilledPlayers.includes(hunterPlayer as string);
      gameData.roleTurn = isHunterBeingKilled ? Object.values(gameData.roles).find((role) => role instanceof Hunter)?.name : 'Village';
      gameData.state = 'day';
    }

    const isGameEnded = getIsGameEnded({...roomData, gameData});

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  }

  const onWitchSkip = ({ roomId }: { roomId: string }) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const gameTurn = gameData.turn || 1;

    const beingKilledPlayers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId].isBeingKilled);

    for (const userId of beingKilledPlayers) {
      const isHunter = gameData.roles[userId] instanceof Hunter;
      if (!isHunter) {
        gameData.roles[userId]?.setIsBeingKilled(false);
        gameData.roles[userId]?.setIsAlive(false);
        gameData.roles[userId]?.setDeathTurn(gameTurn);
      }

      const isPartOfCouple = gameData.couple?.includes(userId);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== userId);

      if (isPartOfCouple && !isHunter) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }

    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = Object.values(gameData.roles).find((role) => role?.name === gameData.roleTurn);
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.name;
    } else {
      const hunterPlayer = Object.keys(gameData.roles).find((userId) => gameData.roles[userId] instanceof Hunter);
      const isHunterBeingKilled = beingKilledPlayers.includes(hunterPlayer as string);
      gameData.roleTurn = isHunterBeingKilled ? Object.values(gameData.roles).find((role) => role instanceof Hunter)?.name : 'Village';
      gameData.state = 'day';
    }

    const isGameEnded = getIsGameEnded({...roomData, gameData});

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  }

  const onVillageVote = ({ roomId, userId, vote }: IWerewolvesSendVote) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const config = roomData.config || defaultWerewolvesConfig;
    const votes = gameData.villageVotes || [];
    const gameTurn = gameData.turn || 1;

    const usersThatCanVote = roomData.users.filter((u) => gameData.roles[u._id]?.isAlive)

    votes.push({ playerId: userId, vote, turn: gameTurn })
    gameData.villageVotes = votes;
    gameData.tmpVotes = gameData.tmpVotes?.filter((v) => v.playerId !== userId);

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

    const votedPlayer = roomData.users.find((u) => u._id === mostVotedPlayer?.vote);
    if (!isVoteTied && votedPlayer) {     
      const isHunterVoted = gameData.roles[votedPlayer._id] instanceof Hunter;

      const isPartOfCouple = gameData.couple?.includes(votedPlayer._id);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== votedPlayer._id);

      if (isHunterVoted) {
        gameData.roles[votedPlayer._id]?.setIsBeingKilled(true)
        if (isPartOfCouple) {
          gameData.roles[otherCoupleUser!._id]?.setIsBeingKilled(true);
        }
      } else {
        gameData.roles[votedPlayer._id]?.setIsAlive(false)
        if (isPartOfCouple) {
          gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
          gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
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
    const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));

    const playerRoleToPlay = order[0];
    if (playerRoleToPlay) {
      const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);
      gameData.roleTurn = roleTurn?.name;
      gameData.state = 'night';
    }

    gameData.tmpVotes = [];

    const isGameEnded = getIsGameEnded({...roomData, gameData});

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  }

  const onHunterKillPlayer = ({ roomId, userId: playerId, kill } : IWerewolvesSendKill) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    const gameData = roomData.gameData || defaultWerewolvesGameData;
    const villageVotes = gameData.villageVotes || [];
    const hunterKills = gameData.hunterKills || [];
    const gameTurn = gameData.turn || 1;
    const config = roomData.config || defaultWerewolvesConfig;

    hunterKills.push({ playerId, kill, turn: gameTurn })
    gameData.hunterKills = hunterKills;

    const hunterPlayer = roomData.users.find((u) => u._id === playerId);
    if (hunterPlayer) {
      gameData.roles[hunterPlayer._id]?.setIsBeingKilled(false);
      gameData.roles[hunterPlayer._id]?.setIsAlive(false);
    }

    const votedPlayer = roomData.users.find((u) => u._id === kill);
    if (votedPlayer) {
      gameData.roles[votedPlayer._id]?.setIsBeingKilled(true);
    }

    const beingKilledPlayers = Object.keys(gameData.roles).filter((userId) => gameData.roles[userId].isBeingKilled);

    for (const userId of beingKilledPlayers) {
      gameData.roles[userId]?.setIsBeingKilled(false);
      gameData.roles[userId]?.setIsAlive(false);
      gameData.roles[userId]?.setDeathTurn(gameTurn);

      const isPartOfCouple = gameData.couple?.includes(userId);
      const otherCoupleUser = roomData.users.find((u) => gameData.couple?.includes(u._id) && u._id !== userId);

      if (isPartOfCouple) {
        gameData.roles[otherCoupleUser!._id]?.setIsAlive(false);
        gameData.roles[otherCoupleUser!._id]?.setDeathTurn(gameTurn);
      }
    }

    const villageAlreadyVoted = !!villageVotes.find((v) => v.turn === gameTurn);
    const compositionRoles = getAvailableRoles(config.composition, gameData);
    const gameRoles = compositionRoles.filter((role) => Object.values(gameData.roles).some((r) => r instanceof role && r.isAlive));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const playerRoleToPlay = order[0];

    if (villageAlreadyVoted && playerRoleToPlay) {
      gameData.turn += 1;
      const roleTurn = Object.values(gameData.roles).find((role) => role instanceof playerRoleToPlay);

      gameData.roleTurn = roleTurn?.name;
      gameData.state = 'night';
    } else {
      gameData.roleTurn = 'Village';
    }

    const isGameEnded = getIsGameEnded({...roomData, gameData});

    if (isGameEnded) {
      roomData.gameState = isGameEnded.gameState as GameState;
      roomData.gameData = isGameEnded.gameData;
    } else {
      roomData.gameData = gameData;
    }

    io.in(roomId).emit("room:updated", roomData);
  }

  const onPsychicWatchRole = ({ roomId, userId, watch }: IWerewolvesSendWatchRole) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const psychicWatch = gameData.psychicWatch || [];
    const gameTurn = gameData.turn || 1;

    psychicWatch.push({ playerId: userId, watch, turn: gameTurn })
    gameData.psychicWatch = psychicWatch;

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    }
    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  }

  const onCupidonDefineCouple = ({ roomId, couple }: IWerewolvesSendCouple) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;

    gameData.couple = couple;

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    }

    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  }

  const onThiefChooseRole = ({ roomId, userId, swap }: IWerewolvesChooseRole) => {
    const roomData = (roomsDataMap.get(roomId) as IWerewolvesRoomData);
    if (!roomData) return socket.emit("room:not-found", roomId);

    let gameData = roomData.gameData || defaultWerewolvesGameData;
    const currentUser = roomData.users.find((u) => u._id === userId);
    const targetUser = roomData.users.find((u) => u._id === swap);

    gameData.swapedRoles = {
      [currentUser!._id]: gameData.roles[currentUser!._id],
      [targetUser!._id]: gameData.roles[targetUser!._id],
    }

    gameData.roles[currentUser!._id] = gameData.roles[targetUser!._id];
    gameData.roles[targetUser!._id] = new Villager();

    const nextRole: Partial<IWerewolvesGameData> = getNextPlayingRole(roomData);
    gameData = {
      ...gameData,
      ...nextRole,
    }

    roomData.gameData = gameData;

    io.in(roomId).emit("room:updated", roomData);
  }

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
}

export default WerewolvesHandler;