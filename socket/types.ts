import { User } from "shared/types/express";
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
    socket_id: string;
    isOwner?: boolean;
}

export interface IRoomData {
    users: SocketUser[];
    config?: IRoomConfig;
}

export interface IRoomConfig {
    maxPlayers: number;
}