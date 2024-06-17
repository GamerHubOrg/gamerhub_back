import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IStoredUser {
  _id: string;
  username: string,
  email: string,
  password: string,
  refresh_token?: string,
  roles: string[],
  xp: number
}

const UserSchema = new Schema<IStoredUser>({
  username:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refresh_token:{
    type: String,
  },
  roles:{
    type: [String],
    default: ["user"],
  },
  xp:{
    type: Number,
    default: 0,
  }
}, { timestamps: true })

export default mongoose.model('Users', UserSchema);