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
import { defaultWerewolvesGameData, IWerewolvesComposition, IWerewolvesGameData, IWerewolvesGameState, IWerewolvesPlayer, IWerewolvesRoomData } from "./werewolves.types";

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
            if (gameData.turn > 1 && firstRoundOnlyRoles.includes(rolesList[role])) return acc;

            return [
                ...acc,
                ...Array(composition[role]).fill(new werewolvesRoles[role]())
            ];
        }
    , [])
}

export function getAvailableRoles(composition: IWerewolvesComposition, gameData: IWerewolvesGameData): RoleConstructor[] {
    return Object.keys(composition)
        .reduce((acc: RoleConstructor[], role: string) => {
            if (gameData.turn > 1 && firstRoundOnlyRoles.includes(rolesList[role])) return acc;

            return [
                ...acc,
                ...Array(composition[role]).fill(werewolvesRoles[role])
            ]
        }
    , [])
}

export function handleGiveUsersRoles(users: IWerewolvesPlayer[], composition: IWerewolvesComposition, gameData: IWerewolvesGameData): IWerewolvesPlayer[] {
    const availableRoles = getAvailableRolesInstance(composition, gameData);
    const shuffledComposition = availableRoles.sort(() => 0.5 - Math.random());

    return users.map((user) => {
        const role = shuffledComposition[0];
        shuffledComposition.shift();
        return { ...user, role };
    })
}

export function getThiefUsers(users: IWerewolvesPlayer[]) {
    const availableUsers = users.filter((user) => !(user.role instanceof Thief))
    return getRandomElement(availableUsers, 2, true);
}

export function getNextPlayingRole(composition: IWerewolvesComposition, users: IWerewolvesPlayer[], gameData: IWerewolvesGameData): { state: IWerewolvesGameState, roleTurn: string } {
    const compositionRoles = getAvailableRoles(composition, gameData);
    const gameRoles = compositionRoles.filter((role) => users.some((u) => u.role instanceof role));
    const order = nightRolesOrder.filter((role) => gameRoles.some((comp) => comp === role));
    const currentRole = users.find((user) => user.role?.name === gameData.roleTurn)?.role;
    const currentRoleTurnIndex = order.findIndex((role) => currentRole instanceof role);

    const playerRoleToPlay = order[currentRoleTurnIndex + 1];

    if (playerRoleToPlay) {
        const roleTurn = users.find((user) => user.role instanceof playerRoleToPlay);
        return {
            state: gameData.state,
            roleTurn: roleTurn!.role!.name
        }
    }

    console.log({ playerRoleToPlay })

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

    const aliveUsers = roomData.users.filter((u) => u.role?.isAlive);
    const aliveVillagers = aliveUsers.filter((u) => u.role?.camp === 'village');
    const aliveWolves = aliveUsers.filter((u) => u.role?.camp === 'wolves');
    const aliveCouple = aliveUsers.filter((u) => gameData.couple?.includes(u._id));

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