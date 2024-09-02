import mongoose from "mongoose";

const { Schema } = mongoose;


export interface IUserStripeConfig {
  customerId: string;
  subscriptionId: string;
}

export interface IStoredUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  picture: string;
  refresh_token?: string;
  roles: string[];
  xp: number;
  friends?: IStoredUser[];
  subscribedAt?: Date;
  bannedAt?: Date;
  address?: string;
  stripe: IUserStripeConfig;
}

const UserStripeConfig = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  subscriptionId: {
    type: String,
  }
}, { _id: false });

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
  },
  friends: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  address: {
    type: String,
  },
  subscribedAt: {
    type: Date,
  },
  bannedAt: {
    type: Date,
  },
  stripe: UserStripeConfig,
}, { timestamps: true })

export default mongoose.model('Users', UserSchema);
