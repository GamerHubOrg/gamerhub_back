import mongoose, { Schema } from "mongoose";
import LolSchema from "./Lol.model";

const options = { discriminatorKey: "dataType", _id: false };

const WordSchema = new Schema(
  {
    name: { type: String, required: true },
    lang: {
      type: String,
      required: true,
    },
    apiId: {
      type: String,
      unique: true,
      immutable: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const WordModel = mongoose.model("Word", WordSchema);

WordModel.discriminator("Lol", new Schema(LolSchema, options));

export default WordModel;
