import mongoose from 'mongoose';
import {IUserSchema} from "../shared/types/user";

const {Schema} = mongoose;

const userSchema = new Schema<IUserSchema>({
        keycloakId: {type: String, unique: true, immutable: true, required: true},
        userName: {type: String},
        email: {type: String, required: true, unique: true},
        roles: {type: String, enum: ['user', 'admin'], default: 'user'},
        xp: {type: Number, default: 0},
    },
    {timestamps: true}
);

const userModel = mongoose.model('users', userSchema)

export default userModel
