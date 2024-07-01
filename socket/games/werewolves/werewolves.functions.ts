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
import { IWerewolvesComposition, IWerewolvesGameData, IWerewolvesGameState, IWerewolvesPlayer } from "./werewolves.types";

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

    return {
        state: 'day',
        roleTurn: 'Village',
    }
}