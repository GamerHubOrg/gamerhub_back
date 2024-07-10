import usersModel, { IStoredUser } from "./users.model";

export async function getAll({ limit = 30, offset = 0 }: { limit?: number, offset?: number }) {
  const list = await usersModel.find().skip(offset).limit(limit);
  const count = await usersModel.countDocuments();
  return {
    list,
    total: count,
  }
}

export function findByEmail(email: string) {
  return usersModel.findOne({ email })
}

export function findById(id: string) {
  return usersModel.findOne({ _id: id })
}

export function getOneByCustomerId(customerId: string) {
  return usersModel.findOne({ 'stripe.customerId': customerId });
}

interface ICreateUser {
  username: string;
  email: string;
  password: string;
  stripe: {
    customerId: string;
  };
  address?: string;
}

export function create({ username, email, password, stripe }: ICreateUser) {
  return usersModel.create({ username, email, password, stripe })
}

export function fromUserId(userId: string) {
  return {
    setRefreshToken(refresh_token?: string) {
      return usersModel.updateOne({ _id: userId }, { $set: { refresh_token } });
    },
    setIpAddress(address?: string) {
      return usersModel.updateOne({ _id: userId }, { $set: { address } });
    },
    setBanned(isBanned: boolean) {
      const updatePayload = isBanned ? { $set: { bannedAt: new Date() } } : { $unset: { bannedAt: '' } };

      return usersModel.findOneAndUpdate(
        { _id: userId },
        { ...updatePayload },
        { new: true }
      )
    },
    setSubscribed(isSubscribed: boolean) {
      const updatePayload = isSubscribed ? { $set: { subscribedAt: new Date() } } : { $unset: { subscribedAt: '' } };

      return usersModel.findOneAndUpdate(
        { _id: userId },
        { ...updatePayload },
        { new: true }
      )
    },
    setSubscription({ subscriptionId }: { subscriptionId?: string }) {
      const updatePayload = subscriptionId ? { $set: { 'stripe.subscriptionId': subscriptionId } } : { $unset: { 'stripe.subscriptionId': '' } };

      return usersModel.findOneAndUpdate(
        { _id: userId },
        { ...updatePayload },
        { new: true }
      )
    },
    setCustomerId({ customerId }: { customerId?: string }) {
      const updatePayload = customerId ? { $set: { 'stripe.customerId': customerId } } : { $unset: { 'stripe.customerId': '' } };

      return usersModel.findOneAndUpdate(
        { _id: userId },
        { ...updatePayload },
        { new: true }
      )
    }
  }
}

export function updateUserById(_id: string, data: Partial<IStoredUser>) {
  return usersModel.findOneAndUpdate({_id}, {$set: data}, {new: true})
}

export function updateUserPasswordById(_id: string, data: string) {
  return usersModel.findOneAndUpdate({_id}, {password: data}, {new: true})
}

export function deleteUser(_id: string) {
  return usersModel.deleteOne({_id})
}