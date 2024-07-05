import mongoose from "mongoose";
import SpeedrundleRecordSchema from "./speedrundleRecords.model";

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
  "gameName",
  SpeedrundleRecordSchema
);
export default GameRecordModel;
