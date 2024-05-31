import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IGameConfigProperties {
    maxPlayers: number;
    mode: string;
    theme: string;
    spyCount: number;
    wordsPerTurn: number;
    anonymousMode: boolean;
    roundsNumber: number;
}

export interface IStoredGameConfig {
    game: string;
    upvotes: number;
    options: Partial<IGameConfigProperties>
}

const ConfigSchema = new Schema<IStoredGameConfig>({
    game: {
        type: String,
        required: true,
    },
    upvotes: {
        type: Number,
        default: 0
    },
    options: {
        type: Array,
        required: true,
    }
})