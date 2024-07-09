import { Schema } from "mongoose";
import { IUndercoverConfig } from "../../../socket/games/undercover/undercover.types";

const UndercoverWordsSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    word: { type: String, required: true },
  },
  { _id: false }
);

const UndercoverVoteSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    vote: { type: String, required: true },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const UndercoverConfigSchema = new Schema<IUndercoverConfig>(
  {
    maxPlayers: { type: Number, required: true },
    mode: {
      type: String,
      enum: ["words", "images"],
      required: true,
    },
    theme: {
      type: String,
      enum: ["classic"],
      required: true,
    },
    spyCount: { type: Number, required: true },
    wordsPerTurn: { type: Number, required: true },
    anonymousMode: { type: Boolean, required: true },
  },
  { _id: false }
);

const UndercoverRecordSchema = new Schema(
  {
    words: { type: [UndercoverWordsSchema], required: true },
    votes: { type: [UndercoverVoteSchema], required: true },
    civilianWord: { type: String, required: true },
    spyWord: { type: String, required: true },
    undercoverPlayerIds: [
      { type: Schema.Types.ObjectId, ref: "Users", required: true },
    ],
    campWin: { type: String, required: true },
    config: {
      type: UndercoverConfigSchema,
      required: true,
    },
  },
  { discriminatorKey: "gameName", _id: false }
);

export default UndercoverRecordSchema;
