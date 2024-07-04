import mongoose from "mongoose";
import {
  ISpeedrundleAnswer,
  ISpeedrundleGameData,
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

const SpeedrundleRecordSchema = new mongoose.Schema<ISpeedrundleGameData>(
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
  },
  { discriminatorKey: "gameName", _id: false }
);

export default SpeedrundleRecordSchema;
