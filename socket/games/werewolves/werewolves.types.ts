import { IGameData, IRoomData, SocketUser } from "../../types";

export type IWerewolvesGameState = 'night' | 'vote';

export type IWerewolvesCamp = 'wolve' | 'villager' | 'solo';

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

export interface IWerewolvesGameData extends IGameData {
  votes: IWerewolvesVote[],
  playerTurn?: string;
  state: IWerewolvesGameState;
  campWin?: IWerewolvesCamp;
  turn: number;
}

export interface IWerewolvesVote {
  playerId: string;
  vote: string;
  turn: number;
}

export const defaultWerewolvesGameData = {}