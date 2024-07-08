import { Schema } from "mongoose";
import { IWerewolvesConfig } from "../../../socket/games/werewolves/werewolves.types";

const WerewolvesConfigSchema = new Schema<IWerewolvesConfig>(
  {
    maxPlayers: { type: Number, required: true },
    composition: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { _id: false }
);

const WerewolvesVoteSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    vote: { type: String, required: true },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const WerewolvesSaveSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    save: { type: String, required: true },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const WerewolvesKillSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    kill: { type: String, required: true },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const WerewolvesWatchRoleSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    turn: { type: Number, required: true },
    watch: { type: String, required: true },
  },
  { _id: false }
);

const WerewolvesRecordSchema = new Schema(
  {
    wolfVotes: [WerewolvesVoteSchema],
    villageVotes: [WerewolvesVoteSchema],
    witchSaves: [WerewolvesSaveSchema],
    witchKills: [WerewolvesKillSchema],
    hunterKills: [WerewolvesKillSchema],
    psychicWatch: [WerewolvesWatchRoleSchema],
    roles: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
    swapedRoles: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    thiefUsers: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
    },
    couple: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
    },
    campWin: {
      type: String,
      enum: ["wolves", "village", "solo"],
    },
    usersThatPlayed: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
    },
    config: {
      type: WerewolvesConfigSchema,
      required: true,
    },
  },
  { discriminatorKey: "gameName", _id: false }
);

export default WerewolvesRecordSchema;
