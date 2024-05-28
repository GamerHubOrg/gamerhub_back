import { IGameData, IRoomConfig } from "../../types";

export type IUndercoverGameState = 'vote' | 'words';

export interface IUndercoverGameData extends IGameData {
    words?: IUndercoverWords[];
    votes: IUndercoverVote[],
    playerTurn?: string;
    state: IUndercoverGameState;
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
    turn: number;
}

export interface IUndercoverConfig extends IRoomConfig {
    wordsPerTurn: number;
}

export const defaultUndercoverGameData: IUndercoverGameData = { state: 'words', turn: 1, votes: [] };
