import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IStoredUser {
  _id: string;
  username: string,
  email: string,
  password: string,
  picture: string,
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
  picture: {
    type: String,
    default: "https://www.repol.copl.ulaval.ca/wp-content/uploads/2019/01/default-user-icon.jpg",
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