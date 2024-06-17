import { isValidObjectId } from "mongoose";
import usersModel, { IStoredUser } from "./users.model";

export function createUser({ 
  keycloakId, userName, email, roles, xp
}: IStoredUser) {
  return usersModel.create({
    keycloakId, 
    userName, 
    email, 
    roles, 
    xp
  })
}

export function updateUser(userId: string, data: Partial<IStoredUser>) {
  const isObjectId = isValidObjectId(userId);
  return usersModel.updateOne(
    { $or: isObjectId ? [{ _id: userId }] : [{ keycloakId: userId }] },
    { $set: { ...data } }
  )
}

export function findById(userId: string) {
  const isObjectId = isValidObjectId(userId);
  return usersModel.findOne(
    { $or: isObjectId ? [{ _id: userId }] : [{ keycloakId: userId }] },
  )
}