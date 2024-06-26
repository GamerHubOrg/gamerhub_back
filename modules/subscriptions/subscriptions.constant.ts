export const STRIPE_EVENTS = {
  checkout: {
    session: {
      completed: 'checkout.session.completed',
      expired: 'checkout.session.expired'
    }
  },
  invoice: {
    paid: 'invoice.paid',
    payment_failed: 'invoice.payment_failed'
  },
  customer: {
    subscription: {
      deleted: 'customer.subscription.deleted'
    }
  }
}

export const SUBSCRIPTION_FEEDBACKS = [
  'customer_service',
  'low_quality',
  'missing_features',
  'other',
  'switched_service',
  'too_complex',
  'too_expensive',
  'unused',
]