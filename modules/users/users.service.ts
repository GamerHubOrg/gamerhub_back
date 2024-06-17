import usersModel from "./users.model";

export function findByEmail(email: string) {
  return usersModel.findOne({ email })
}

export function findById(id: string) {
  return usersModel.findOne({ _id: id })
}

interface ICreateUser {
  username: string;
  email: string;
  password: string;
}

export function create({ username, email, password }: ICreateUser) {
  return usersModel.create({ username, email, password })
}

export function fromUserId(userId: string) {
  return {
    setRefreshToken(refresh_token?: string) {
      return usersModel.updateOne({ _id: userId }, { $set: { refresh_token } });
    }
  }
}