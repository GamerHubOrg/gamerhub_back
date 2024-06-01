import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IStoredUser {
  keycloakId: string,
  userName: string,
  email: string,
  roles: string,
  xp: number
}

const UserSchema = new Schema<IStoredUser>({
  keycloakId: {
    type: String,
    required: true,
  },
  userName:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  roles:{
    type: String,
    default: "user",
  },
  xp:{
    type: Number,
    default: 0,
  }
}, { timestamps: true })

export default mongoose.model('Users', UserSchema);