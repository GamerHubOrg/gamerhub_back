import usersModel from "./users.model";

export function findByEmail(email: string) {
  return usersModel.findOne({ email })
}

export function findById(id: string) {
  return usersModel.findOne({ _id: id })
}

export function getOneByCustomerId(customerId: string) {
  return usersModel.findOne({ 'customerId': customerId });
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

      return usersModel.updateOne(
        { _id: userId },
        { ...updatePayload }
      )
    },
  }
}