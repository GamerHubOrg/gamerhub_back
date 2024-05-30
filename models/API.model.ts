import mongoose, { Schema } from "mongoose";

const APISchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
    },
  },
  { timestamps: true }
);

const APIModel = mongoose.model("API", APISchema);

module.exports = APIModel;
