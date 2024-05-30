import mongoose, { Schema } from "mongoose";
import LolSchema from "./Lol.model";

const options = { discriminatorKey: "dataType", _id: false };

const CharacterSchema = new Schema(
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

const CharacterModel = mongoose.model("Character", CharacterSchema);

CharacterModel.discriminator("Lol", new Schema(LolSchema, options));

export default CharacterModel;
