import usersModel, { IStoredUser } from "./users.model";

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
}

export function create({ username, email, password, stripe }: ICreateUser) {
  return usersModel.create({ username, email, password, stripe })
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

export function updateUserById(_id: string, data: IStoredUser) {

  console.log(data);
  
  return usersModel.findOneAndUpdate({_id}, {$set: data}, {new: true})
}

export function updateUserPassword(_id: string, data: IStoredUser) {
  return usersModel.findOneAndUpdate({_id}, {$set: data}, {upsert: true, new: true})
}