import { IGameData, IRoomData, SocketUser } from "../../types";
import { WerewolfRole } from "./roles/WerewolvePlayer";

export type IWerewolvesGameState = 'night' | 'day';

export type IWerewolvesCamp = 'wolves' | 'village' | 'solo';

export interface IWerewolvesPlayer extends SocketUser {}

export interface IWerewolvesRoomData extends IRoomData {
  users: IWerewolvesPlayer[];
  config?: IWerewolvesConfig;
  gameData?: IWerewolvesGameData;
}

export type IWerewolvesComposition = Record<string, number>;

export interface IWerewolvesConfig {
  maxPlayers: number;
  composition: IWerewolvesComposition;
}

export type ILinkedWerewolfRoles = Record<string, WerewolfRole>;

export interface IWerewolvesSwapedRoles {
  playerId: string;
  target: string;
  turn: number;
  roles: ILinkedWerewolfRoles;
}

export interface IWerewolvesGameData extends IGameData {
  wolfVotes?: IWerewolvesTarget[];
  villageVotes?: IWerewolvesTarget[];
  tmpVotes?: Partial<IWerewolvesTarget>[];
  witchSaves?: IWerewolvesTarget[];
  witchKills?: IWerewolvesTarget[];
  witchSkips?: IWerewolvesTarget[];
  hunterKills?: IWerewolvesTarget[];
  psychicWatch?: IWerewolvesTarget[];
  roles: ILinkedWerewolfRoles;
  swapedRoles?: IWerewolvesSwapedRoles[];
  thiefUsers?: Record<string, string[]>;
  couple?: IWerewolvesCouple;
  roleTurn?: string;
  state: IWerewolvesGameState;
  campWin?: IWerewolvesCamp;
  turn: number;
  usersThatPlayed?: IWerewolvesPlayer[];
}

export interface IWerewolvesTarget {
  playerId: string;
  target: string;
  turn: number;
}

export interface IWerewolvesSendTarget {
  roomId: string;
  target: string;
  userId: string;
}

export type IWerewolvesCouple = string[];

export interface IWerewolvesSendCouple {
  roomId: string;
  couple: IWerewolvesCouple;
}

export const defaultWerewolvesGameData: IWerewolvesGameData = { state: 'day', turn: 0, roles: {} };

export const defaultWerewolvesConfig: IWerewolvesConfig = { 
  composition: {
    'wolf': 1,
    'villager': 1,
    'thief': 1,
    'hunter': 1
  }, 
  maxPlayers: 10 
}