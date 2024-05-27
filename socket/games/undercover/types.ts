import { IGameData } from "../../types";

export interface IUndercoverGameData extends IGameData {
    words?: IUndercoverWords[]; 
    playerTurn?: string;
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

export interface IUndercoverConfig {
    wordsPerTurn: number,
}