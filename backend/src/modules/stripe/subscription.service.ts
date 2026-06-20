import { stripe } from "../../config/stripe.js";
import { prisma } from "../../config/db.js";

export const createCheckoutSession = async (email: string, organizationId: string) => {
  // Use a fallback URL if the environment variable isn't set yet
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",

    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],

    //  URLs now dynamically adapt to Local or Production environments
    success_url: `${frontendUrl}/settings/billing?success=true`,
    cancel_url: `${frontendUrl}/settings/billing?canceled=true`,

    customer_email: email,

    metadata: {
      organizationId: organizationId,
    },

    subscription_data: {
      metadata: {
        organizationId: organizationId,
      },
    },

    allow_promotion_codes: true,
  });

  return session.url;
};

export const getCurrentSubscription = async (organizationId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      organizationId,
    },
  });

  return subscription;
};