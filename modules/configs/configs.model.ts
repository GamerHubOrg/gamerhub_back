import mongoose, { ObjectId } from "mongoose";

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
    name: string;
    upvotes: number;
    options: Partial<IGameConfigProperties>,
    userId: ObjectId;
}

export interface IStoredConfigUpvote {
    userId: string;
    configId: string;
}

const ConfigUpvoteSchema = new Schema<IStoredConfigUpvote>({
    userId: {
        type: String,
        required: true,
    },
    configId: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export const configUpvoteModel = mongoose.model('ConfigUpvote', ConfigUpvoteSchema);

const ConfigSchema = new Schema<IStoredGameConfig>({
    game: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    upvotes: {
        type: Number,
        default: 0
    },
    options: {
        type: Object,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true })

export default mongoose.model('Configs', ConfigSchema);