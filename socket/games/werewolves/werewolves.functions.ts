import Cupidon from "./roles/Cupidon";
import Hunter from "./roles/Hunter";
import Psychic from "./roles/Psychic";
import Thief from "./roles/Thief";
import { WerewolfRole } from "./roles/WerewolvePlayer";
import Witch from "./roles/Witch";
import Wolf from "./roles/Wolf";
import { IWerewolvesComposition, IWerewolvesPlayer } from "./werewolves.types";

type RoleConstructor = new () => WerewolfRole;

export const werewolvesRoles: Record<string, RoleConstructor> = {
    wolf: Wolf,
    hunter: Hunter,
    thief: Thief,
    witch: Witch,
    psychic: Psychic,
    cupidon: Cupidon
}

export function getAvailableRolesInstance(composition: IWerewolvesComposition): WerewolfRole[] {
    return Object.keys(composition)
        .reduce((acc: WerewolfRole[], role: string) => ([
            ...acc,
            ...Array(composition[role]).fill(new werewolvesRoles[role]())
        ])
    , [])
}

export function getAvailableRoles(composition: IWerewolvesComposition): RoleConstructor[] {
    return Object.keys(composition)
        .reduce((acc: RoleConstructor[], role: string) => ([
            ...acc,
            ...Array(composition[role]).fill(werewolvesRoles[role])
        ])
    , [])
}

export function handleGiveUsersRoles(users: IWerewolvesPlayer[], composition: IWerewolvesComposition): IWerewolvesPlayer[] {
    const availableRoles = getAvailableRolesInstance(composition);
    const shuffledComposition = availableRoles.sort(() => 0.5 - Math.random());

    return users.map((user) => {
        const role = shuffledComposition[0];
        shuffledComposition.shift();
        return { ...user, role };
    })
}