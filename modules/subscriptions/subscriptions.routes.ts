import { Router } from "express";
import { Request, Response } from "express";
import { STRIPE_EVENTS } from "./subscriptions.constant";
import * as subscriptionsController from './subscriptions.controller';

const router = Router();

export async function handleStripWebhook(req: Request, res: Response) {
  const { type, data } = req.body;

  try {
    if (type === STRIPE_EVENTS.checkout.session.completed) {
      await subscriptionsController.handleCheckoutSessionCompleted(data.object);
      res.sendStatus(200);
      return;
    }
  
    if (type === STRIPE_EVENTS.checkout.session.expired) {
      await subscriptionsController.handleCheckoutSessionExpired(data.object);
      res.sendStatus(200);
      return;
    }
  
    if (type === STRIPE_EVENTS.invoice.paid) {
      await subscriptionsController.handleInvoicePaid(data.object);
      res.sendStatus(200);
      return;
    }
  
    if (type === STRIPE_EVENTS.invoice.payment_failed) {
      await subscriptionsController.handleInvoicePaymentFailed(data.object);
      res.sendStatus(200);
      return;
    }
  
    if (type === STRIPE_EVENTS.customer.subscription.deleted) {
      await subscriptionsController.handleCustomerSubscriptionDeleted(data.object);
      res.sendStatus(200);
      return;
    }
  
    res.sendStatus(501);
  } catch(err) {
    res.sendStatus(400);
  }
}

router.post('/stripe/webhook', handleStripWebhook);

export default router;