import User from "../models/user.model";
import {IUserSchema} from "../shared/types/user";

const findOneUserById = (_id: string) => {
    return User.findOne({_id});
}

const findAllUsers = () => {
    return User.find()
}

const createUser = (rawData: Partial<IUserSchema>) => {
    const toSave = new User(rawData)
    return toSave.save()
}

const updateUserById = (_id: string, data: Partial<IUserSchema>) => {
    return User.findOneAndUpdate({_id}, {$set: data}, {upsert: true, new: true})
}

const deleteUser = (_id: string) => {
    return User.findOneAndDelete({_id});
}


const userService = {findOneUserById, createUser, findAllUsers, updateUserById, deleteUser}

export default userService
