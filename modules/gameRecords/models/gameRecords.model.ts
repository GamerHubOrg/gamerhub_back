import mongoose from "mongoose";
import SpeedrundleRecordSchema from "./speedrundleRecords.model";
import UndercoverRecordSchema from "./undercoverRecords.model";
import WerewolvesRecordSchema from "./werewolvesRecords.model";

const GameRecordSchema = new mongoose.Schema(
  {
    gameName: {
      type: "string",
      enum: ["speedrundle", "undercover", "werewolves"],
      required: true,
    },
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    ],
  },
  { timestamps: true }
);

const GameRecordModel = mongoose.model("GameRecords", GameRecordSchema);

export const SpeedrundleRecordModel = GameRecordModel.discriminator(
  "speedrundle",
  SpeedrundleRecordSchema
);
export const UndercoverRecordModel = GameRecordModel.discriminator(
  "undercover",
  UndercoverRecordSchema
);
export const WerewolvesRecordModel = GameRecordModel.discriminator(
  "werewolves",
  WerewolvesRecordSchema
);
export default GameRecordModel;
