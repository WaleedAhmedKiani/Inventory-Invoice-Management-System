import { prisma } from "../../config/db.js";
import { stripe } from "../../config/stripe.js";
import { logger } from "../../utils/logger.js";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import Stripe from "stripe";

// Helper function to safely parse dates and prevent "Invalid Date" crashes
const getSafePeriodEnd = (timestamp: any): Date => {
  if (!timestamp || isNaN(timestamp)) {
    // Safe Fallback: Default to exactly 30 days from now if the timestamp is missing
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  return new Date(timestamp * 1000);
};

export const stripeWebhook = async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    logger.error("Missing stripe-signature header");
    return res.status(400).send("Webhook Error: Missing Signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(" STRIPE VERIFICATION CRASHED:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  
  //  CHECKOUT COMPLETED
  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    console.log("CRITICAL WEBHOOK DEBUG:", {
      metadata: session.metadata,
      organizationId: session.metadata?.organizationId,
      customerId: session.customer
    });

    const organizationId = session.metadata?.organizationId;
    let customerId = session.customer || session.customer_details?.id;
    const subscriptionId = session.subscription || (process.env.NODE_ENV === "development" ? "sub_mock_test_12345" : null);

    if (!customerId && process.env.NODE_ENV === "development") {
      customerId = "cus_mock_test_12345"; 
    }

    console.log(" FIXED WEBHOOK EXECUTION:", { organizationId, customerId });

    if (!organizationId) {
      logger.error("Skipping webhook: No organizationId found in session metadata.");
      return res.status(400).json({ error: "Missing organization metadata" });
    }
     
    try { 
      // Link the customer ID to the organization
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          stripeCustomerId: customerId,
          plan: SubscriptionPlan.PRO,
        },
      });

      if (subscriptionId) {
        let status = "ACTIVE";
        let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 

        if (session.subscription) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId as string) as any;
            status = stripeSub.status.toUpperCase();
            periodEnd = getSafePeriodEnd(stripeSub.current_period_end);
          } catch (stripeError) {
            console.warn(" Stripe API fetch skipped or failed, using local test evaluation.");
          }
        }

        // Direct upsert ensures fields are populated every time
        await prisma.subscription.upsert({
          where: { organizationId: organizationId },
          create: {
            organizationId: organizationId,
            plan: SubscriptionPlan.PRO,
            status: status as SubscriptionStatus,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: periodEnd,
          },
          update: {
            plan: SubscriptionPlan.PRO,
            status: status as SubscriptionStatus,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: periodEnd,
          },
        });
        
        console.log(` DATABASE SYNCHRONIZED: Subscription record committed for Org ${organizationId}`);
      }

      return res.json({ received: true });

    } catch (dbError: any) {
      console.error(" Prisma Database Update Failure inside Checkout:", dbError.message);
      return res.status(500).json({ error: "Database update failed" });
    }
  }

  
  //  SUBSCRIPTION CREATED / UPDATED
  
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const subscriptionId = sub.id;

    let orgId: string | undefined = sub.metadata?.organizationId;

    try {
      if (!orgId) {
        const org = await prisma.organization.findFirst({
          where: { stripeCustomerId: customerId },
        });
        orgId = org?.id;
      }

      if (!orgId) {
        logger.error(`Organization not found for customer: ${customerId}. Retrying via checkout session if possible.`);
        return res.json({ received: true });
      }

      //  Bypasses the strict TS property check and uses the safe fallback function
      const currentPeriodEnd = getSafePeriodEnd((sub as any).current_period_end);

      await prisma.subscription.upsert({
        where: { organizationId: orgId },
        update: {
          plan: SubscriptionPlan.PRO,
          status: sub.status.toUpperCase() as SubscriptionStatus,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd,
        },
        create: {
          organizationId: orgId,
          plan: SubscriptionPlan.PRO,
          status: sub.status.toUpperCase() as SubscriptionStatus,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd,
        },
      });

      await prisma.organization.update({
        where: { id: orgId },
        data: {
          plan: SubscriptionPlan.PRO,
        },
      });

      logger.info({ orgId }, "Subscription synced cleanly");
      return res.json({ received: true });

    } catch (subError: any) {
      console.error(" Error syncing created/updated subscription:", subError.message);
      return res.status(500).json({ error: "Subscription event synchronization failed" });
    }
  }

  
  //  SUBSCRIPTION DELETED
  
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    try {
      const org = await prisma.organization.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!org) return res.json({ received: true });

      await prisma.subscription.updateMany({
        where: { organizationId: org.id },
        data: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.CANCELLED,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          plan: SubscriptionPlan.FREE,
        },
      });

      logger.info({ orgId: org.id }, "Subscription cancelled cleanly");
      return res.json({ received: true });

    } catch (cancelError: any) {
      console.error(" Error canceling subscription execution:", cancelError.message);
      return res.status(500).json({ error: "Subscription cancellation failed" });
    }
  }

  // Fallback return for unhandled webhook events
  return res.json({ received: true });
};