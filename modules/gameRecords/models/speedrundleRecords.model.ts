import mongoose from "mongoose";
import {
  ISpeedrundleAnswer,
  ISpeedrundleConfig,
  ISpeedrundleRoundData,
} from "../../../socket/games/speedrundle/speedrundle.types";

const ColumnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "comparison"],
    },
    isIcon: Boolean,
  },
  { _id: false }
);

const SpeedrundleRoundDataSchema = new mongoose.Schema<ISpeedrundleRoundData>(
  {
    guesses: { type: [String], required: true },
    score: { type: Number, required: true },
    hasFound: { type: Boolean, required: true },
    startDate: { type: Date, required: true },
  },
  { _id: false }
);

const SpeedrundleAnswerSchema = new mongoose.Schema<ISpeedrundleAnswer>(
  {
    playerId: { type: String, required: true },
    currentRound: { type: Number, required: true },
    roundsData: { type: [SpeedrundleRoundDataSchema], required: true },
    state: { type: String, enum: ["playing", "finished"], required: true },
  },
  { _id: false }
);

const SpeedrundleConfigSchema = new mongoose.Schema<ISpeedrundleConfig>(
  {
    maxPlayers: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    nbRounds: {
      type: Number,
      required: true,
    },
    theme: {
      type: String,
      enum: ["league_of_legends", "pokemon"],
      required: true,
    },
    selectedGenerations: {
      type: [Number],
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    selectedColumns: [String],
  },
  { _id: false }
);

const SpeedrundleRecordSchema = new mongoose.Schema(
  {
    columns: {
      type: [ColumnSchema],
      required: true,
    },
    charactersToGuess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Character",
        required: true,
      },
    ],
    usersAnswers: {
      type: [SpeedrundleAnswerSchema],
      required: true,
    },
    config: {
      type: SpeedrundleConfigSchema,
      required: true,
    },
  },
  { discriminatorKey: "gameName", _id: false }
);

export default SpeedrundleRecordSchema;
