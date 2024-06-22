import mongoose, { Schema } from "mongoose";
import LolSchema from "./lol-characters.model";

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

export const LolCharacterModel = CharacterModel.discriminator("Lol", LolSchema);

export default CharacterModel;
