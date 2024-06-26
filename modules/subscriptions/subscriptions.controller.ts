import { Response } from 'express';
import stripe from '../../services/stripe';
import { CustomRequest } from '../../shared/types/express';
import * as usersService from '../users/users.service';
import { IStripeWebhookData } from './subscriptions.types';

export async function handleCheckoutSessionCompleted(data: IStripeWebhookData) {
  const { customer } = data;

  console.log("handleCheckoutSessionCompleted event received")
  const user = await usersService.getOneByCustomerId(customer);

  if (!user) throw Error('User not found');

  await usersService
    .fromUserId(user._id)
    .setSubscribed(true)

  await usersService
    .fromUserId(user._id)
    .setSubscription({ subscriptionId: data.subscription })
}

export async function handleCheckoutSessionExpired(data: IStripeWebhookData) {
  const { customer } = data;

  console.log("handleCheckoutSessionExpired event received")
  const user = await usersService.getOneByCustomerId(customer);

  if (!user) throw Error('User not found');

  await usersService
    .fromUserId(user._id)
    .setSubscribed(false)
}

export async function handleInvoicePaid(data: IStripeWebhookData) {
  const { customer } = data;

  console.log("handleInvoicePaid event received")
  const user = await usersService.getOneByCustomerId(customer);

  if (!user) throw Error('User not found');

  await usersService
    .fromUserId(user._id)
    .setSubscribed(true)
}

export async function handleInvoicePaymentFailed(data: IStripeWebhookData) {
  const { customer } = data;

  console.log("handleInvoicePaymentFailed event received")
  const user = await usersService.getOneByCustomerId(customer);

  if (!user) throw Error('User not found');

  await usersService
    .fromUserId(user._id)
    .setSubscribed(false)
}

export async function handleCustomerSubscriptionDeleted(data: IStripeWebhookData) {
  const { customer } = data;

  console.log("handleCustomerSubscriptionDeleted event received")
  const user = await usersService.getOneByCustomerId(customer);

  if (!user) throw Error('User not found');

  await usersService
    .fromUserId(user._id)
    .setSubscription({ subscriptionId: undefined })
}

export const cancelSubscription = async (req: CustomRequest, res: Response) => {
  const { user } = req;

  try {
    if (!user?.stripe.subscriptionId) {
      res.status(400).send('User dont have any subscriptions');
      return;
    }

    await stripe.subscriptions.cancel(user?.stripe.subscriptionId);

    res.sendStatus(200);
  } catch(err) {
    res.send(err);
  }
}