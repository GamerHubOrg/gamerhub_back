import { User } from "../shared/types/express";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type IoType = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;
export type SocketType = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export interface SocketUser extends User {
  username: string;
  socket_id: string;
  isOwner?: boolean;
}

export type GameState = "lobby" | "started" | "results";

export interface IRoomLog {
  date: Date;
  message: string;
}

export interface IRoomData {
  users: SocketUser[];
  config?: IRoomConfig;
  logs: IRoomLog[];
  gameState: GameState;
  gameData?: IGameData;
}

export interface IRoomConfig {
  maxPlayers: number;
}

export interface IGameData {}

export interface IPlayerData {
  playerId: number;
  answer: any;
  points: number;
}

export interface ITestGameData extends IGameData {
  rounds?: number[];
  playersData?: IPlayerData[];
}
