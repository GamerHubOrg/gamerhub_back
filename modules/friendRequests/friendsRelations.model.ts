import mongoose from "mongoose";
import UserSchema, {IStoredUser} from "../users/users.model";

const { Schema } = mongoose;

export interface IStoredRelation {
  _id: string;
  requester : IStoredUser;
  receiver : IStoredUser;
  status : string;
}

const FriendsRelation = new Schema<IStoredRelation>({
  requester:{
    type: UserSchema,
    required: true,
  },
  receiver: {
    type: UserSchema,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
}, { timestamps: true })

export default mongoose.model('Users', FriendsRelation);
