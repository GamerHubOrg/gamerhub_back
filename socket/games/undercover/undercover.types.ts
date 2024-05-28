import { IGameData, IRoomConfig, IRoomData, SocketUser } from "../../types";

export type IUndercoverGameState = 'vote' | 'words';

export type IUndercoverCamp = 'undercover' | 'civilian'; 

export interface IUndercoverPlayer extends SocketUser {
    isEliminated?: boolean
}

export interface IUndercoverRoomData extends IRoomData {
    users: IUndercoverPlayer[];
    config?: IUndercoverConfig;
    gameData?: IUndercoverGameData;
}

export interface IUndercoverGameData extends IGameData {
    words?: IUndercoverWords[];
    votes: IUndercoverVote[],
    playerTurn?: string;
    state: IUndercoverGameState;
    civilianWord?: string;
    spyWord?: string;
    undercoverPlayerIds?: string[];
    campWin?: IUndercoverCamp;
    turn: number;
}

export interface IUndercoverSendWord {
    roomId: string,
    userId: string,
    word: string,
}

export interface IUndercoverWords {
    playerId: string;
    word: string;
}

export interface IUndercoverSendVote {
    roomId: string,
    vote: string;
    userId: string,
}

export interface IUndercoverVote {
    playerId: string;
    vote: string;
}

export interface IUndercoverConfig extends IRoomConfig {
    wordsPerTurn: number;
}

export const defaultUndercoverGameData: IUndercoverGameData = { state: 'words', votes: [], turn: 1 };
