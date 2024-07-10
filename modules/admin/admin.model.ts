import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IBanishment {
  _id: string;
  email: string;
  ip: string;
  message: string;
}

const BanishmentSchema = new Schema<IBanishment>({
  email: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
}, { timestamps: true })

export const banishmentsModel = mongoose.model('Banishments', BanishmentSchema);