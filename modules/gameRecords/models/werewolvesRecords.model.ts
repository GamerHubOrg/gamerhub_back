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

const WerewolvesTargetSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    target: { type: String, required: true },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const WerewolvesSwapRoleSchema = new Schema(
  {
    playerId: { type: String, ref : "Users", required: true },
    roles: {
      type: Map,
      of: Schema.Types.Mixed
    },
    turn: { type: Number, required: true },
  },
  { _id: false }
);

const WerewolvesRecordSchema = new Schema(
  {
    wolfVotes: [WerewolvesTargetSchema],
    villageVotes: [WerewolvesTargetSchema],
    witchSaves: [WerewolvesTargetSchema],
    witchKills: [WerewolvesTargetSchema],
    hunterKills: [WerewolvesTargetSchema],
    psychicWatch: [WerewolvesTargetSchema],
    roles: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
    swapedRoles: {
      type: [WerewolvesSwapRoleSchema],
    },
    thiefUsers: {
      type: Object,
      default: {}
    },
    playersTurn: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
    },
    couple: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
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
