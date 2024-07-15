import { getRandomElement } from "../../../utils/functions";
import Cupidon from "./roles/Cupidon";
import Hunter from "./roles/Hunter";
import Psychic from "./roles/Psychic";
import Thief from "./roles/Thief";
import Villager from "./roles/Villager";
import { WerewolfRole } from "./roles/WerewolvePlayer";
import Witch from "./roles/Witch";
import Wolf from "./roles/Wolf";
import { nightRolesOrder } from "./werewolves.constants";
import { defaultWerewolvesGameData, ILinkedWerewolfRoles, IWerewolvesComposition, IWerewolvesGameData, IWerewolvesGameState, IWerewolvesPlayer, IWerewolvesRoomData } from "./werewolves.types";
import gameRecordsService from "../../../modules/gameRecords/gameRecords.service";

type RoleConstructor = new () => WerewolfRole;

const rolesList: Record<string, any> = {
    wolf: Wolf,
    hunter: Hunter,
    thief: Thief,
    witch: Witch,
    psychic: Psychic,
    cupidon: Cupidon,
    villager: Villager,
}

const firstRoundOnlyRoles = [Thief, Cupidon];

export const werewolvesRoles: Record<string, RoleConstructor> = rolesList;

export function getAvailableRolesInstance(composition: IWerewolvesComposition, gameData: IWerewolvesGameData): WerewolfRole[] {
    return Object.keys(composition)
        .reduce((acc: WerewolfRole[], role: string) => {
            if (composition[role] <= 0) return acc;
            const isFirstRoundOnlyRole = !!firstRoundOnlyRoles.find((r) => new werewolvesRoles[role]() instanceof r);
            if (gameData.turn > 1 && isFirstRoundOnlyRole) return acc;

            return [
                ...acc,
                ...Array.from({ length: composition[role] }, () => new werewolvesRoles[role]()),
            ];
        }
    , [])
}

export function getAvailableRoles(composition: IWerewolvesComposition, gameData: IWerewolvesGameData): RoleConstructor[] {
    return Object.keys(composition)
        .reduce((acc: RoleConstructor[], role: string) => {
            if (composition[role] <= 0) return acc;
            const isFirstRoundOnlyRole = !!firstRoundOnlyRoles.find((r) => new werewolvesRoles[role]() instanceof r);
            if (gameData.turn > 1 && isFirstRoundOnlyRole) return acc;
            return [
                ...acc,
                ...Array.from({ length: composition[role] }, () => werewolvesRoles[role]),
            ]
        }
    , [])
}

export function handleGiveUsersRoles(users: IWerewolvesPlayer[], composition: IWerewolvesComposition, gameData: IWerewolvesGameData): ILinkedWerewolfRoles {
    const availableRoles = getAvailableRolesInstance(composition, gameData);
    const shuffledComposition = availableRoles.sort(() => 0.5 - Math.random());

    return users.reduce((acc, user) => {
        const role = shuffledComposition[0];
        shuffledComposition.shift();
        return { ...acc, [user._id]: role };
    }, {})
}

export function getThiefUsersIds(roomData: IWerewolvesRoomData, thieves: string[]) {
    const gameData: IWerewolvesGameData = roomData.gameData || defaultWerewolvesGameData;
    const usersKey = Object.keys(gameData.roles);

    const result = thieves.reduce((acc: Record<string, string[]>, thiefId) => {
        const alreadyPickedUsers: string[] = Object.values(acc).reduce((acc, users) => ([...acc, ...users]), []);
        const availableUsers = usersKey.filter((userId) => !(gameData.roles[userId] instanceof Thief) && !alreadyPickedUsers.some((uid) => uid === userId))

        return {
            ...acc,
            [thiefId]: getRandomElement(availableUsers, 2, true),
        }
    }, {})

    return result;
}

export function getNextPlayingRole(roomData: IWerewolvesRoomData): { state: IWerewolvesGameState, roleTurn: string } {
    const gameData: IWerewolvesGameData = roomData.gameData || defaultWerewolvesGameData;
    const composition = roomData.config!.composition;

    const roles = Object.values(gameData.roles);
    const compositionRoles = getAvailableRoles(composition, gameData);
    const gameRoles = compositionRoles.filter((role) => roles.some((r) => r instanceof role));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = roles.find((role) => role?.name === gameData.roleTurn);
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
        const roleTurn = roles.find((role) => role instanceof playerRoleToPlay);

        return {
            state: gameData.state,
            roleTurn: roleTurn!.name,
        }
    }

    return {
        state: 'day',
        roleTurn: 'Village',
    }
}

export function getIsGameEnded(roomData: IWerewolvesRoomData): Partial<IWerewolvesRoomData> | undefined {
    // Le village élimine tous les autres joueurs => village
    // Le couple élimine tous les autres joueurs si pas du meme camp => couple
    // Les loups élimine tous les autres joueurs => loups
    const gameData: IWerewolvesGameData = roomData.gameData || defaultWerewolvesGameData;
    const linkedRoles = gameData.roles;

    const aliveUsers = roomData.users.filter((u) => linkedRoles[u._id]?.isAlive);
    const aliveVillagers = aliveUsers.filter((u) => linkedRoles[u._id]?.camp === 'village');
    const aliveWolves = aliveUsers.filter((u) => linkedRoles[u._id]?.camp === 'wolves');
    const couples = gameData.couple || {};
    const couplesUsers = aliveUsers.filter((u) => Object.values(couples).some((couple) => couple?.includes(u._id)));
    const aliveCouple = [...new Set(couplesUsers.map((u) => u._id))];

    if (aliveUsers.length === 0) {
        return {
            gameData: {
                ...gameData,
                campWin: undefined,
            },
            gameState: 'results',
        }
    }

    if (aliveCouple.length === aliveUsers.length) {
        return {
            gameData: {
                ...gameData,
                campWin: 'solo',
            },
            gameState: 'results'
        }
    }

    if (aliveVillagers.length === aliveUsers.length) {
        return {
            gameData: {
                ...gameData,
                campWin: 'village'
            },
            gameState: 'results'
        }
    }

    if (aliveWolves.length === aliveUsers.length) {
        return {
            gameData: {
                ...gameData,
                campWin: 'wolves'
            },
            gameState: 'results'
        }
    }

    return undefined;
}

export function getCoupleFromUser(roomData: IWerewolvesRoomData, userId: string) {
    const gameData: IWerewolvesGameData = roomData.gameData || defaultWerewolvesGameData;
    const couple = gameData.couple || {};

    const users = roomData.users.filter(
        (u) => Object.values(couple).some((couple) => couple?.includes(u._id) && u._id !== userId));

    return [...new Set(users.map((u) => u._id))];
}

export const saveGame = (roomData: IWerewolvesRoomData) => {
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