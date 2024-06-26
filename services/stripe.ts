import Stripe from "stripe"
import config from "../config"

export default new Stripe(config.subscriptions.stripeSecretKey as string, {
  // @ts-ignore
  apiVersion: "2023-10-16",
})