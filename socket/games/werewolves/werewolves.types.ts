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

export interface IWerewolvesGameData extends IGameData {
  wolfVotes?: IWerewolvesVote[];
  villageVotes?: IWerewolvesVote[];
  tmpVotes?: Partial<IWerewolvesVote>[];
  witchSaves?: IWerewolvesSave[];
  witchKills?: IWerewolvesKill[];
  hunterKills?: IWerewolvesKill[];
  psychicWatch?: IWerewolvesWatchRole[];
  roles: ILinkedWerewolfRoles;
  swapedRoles?: ILinkedWerewolfRoles;
  thiefUsers?: IWerewolvesPlayer[];
  couple?: IWerewolvesCouple;
  roleTurn?: string;
  state: IWerewolvesGameState;
  campWin?: IWerewolvesCamp;
  turn: number;
  usersThatPlayed?: IWerewolvesPlayer[];
}

export interface IWerewolvesVote {
  playerId: string;
  vote: string;
  turn: number;
}

export interface IWerewolvesSave {
  playerId: string;
  save: string;
  turn: number;
}

export interface IWerewolvesKill {
  playerId: string;
  kill: string;
  turn: number;
}

export interface IWerewolvesSendVote {
  roomId: string;
  vote: string;
  userId: string;
}

export interface IWerewolvesSendSave {
  roomId: string;
  save: string;
  userId: string;
}

export interface IWerewolvesSendKill {
  roomId: string;
  kill: string;
  userId: string;
}

export interface IWerewolvesSendWatchRole {
  roomId: string;
  userId: string;
  watch: string;
}

export interface IWerewolvesWatchRole {
  playerId: string;
  turn: number;
  watch: string;
}

export type IWerewolvesCouple = string[];

export interface IWerewolvesSendCouple {
  roomId: string;
  couple: IWerewolvesCouple;
}

export interface IWerewolvesChooseRole {
  roomId: string;
  userId: string;
  swap: string;
}

export const defaultWerewolvesGameData: IWerewolvesGameData = { state: 'day', turn: 1, roles: {} };

export const defaultWerewolvesConfig: IWerewolvesConfig = { 
  composition: {
    'wolf': 1,
    'villager': 1,
    'thief': 1,
    'hunter': 1
  }, 
  maxPlayers: 10 
}