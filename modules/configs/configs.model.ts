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
    }
}, { timestamps: true })

export default mongoose.model('Configs', ConfigSchema);