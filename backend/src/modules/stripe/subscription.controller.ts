import { Request, Response } from "express";
import * as service from "./subscription.service.js";

// ^Create checkout session
export const createCheckout = async (req: Request, res: Response) => {
  try {
    // 🔍 1. Debug Log: See exactly what your auth middleware is giving you
    console.log("--- STRIPE CHECKOUT ROUTE TRIGGERED ---");
    console.log("User object from Auth Middleware:", req.user);

    const email = req.user?.email;
    
    // Fallback in case your token payload uses 'orgId' instead of 'organizationId'
    const organizationId = req.user?.organizationId || (req.user as any)?.orgId;

    //  Safety Guard: Stop the request if data is missing before pinging Stripe
    if (!email || !organizationId) {
      console.error(" Checkout Failed: Missing email or organizationId in req.user");
      return res.status(400).json({ 
        message: "Authentication context is missing required billing parameters." 
      });
    }

    //  Pass clean, explicit string variables to your service
    const url = await service.createCheckoutSession(email, organizationId);
    
    return res.json({ url });
  } catch (error: any) {
    console.error(" Controller Checkout Error:", error.message);
    return res.status(500).json({ message: "Failed to generate checkout portal" });
  }
};

// ^Get current subscription
export const getCurrentSubscription = async (
  req: Request,
  res: Response
) => {
  // Safe fallback guard check
  const organizationId = req.user?.organizationId || (req.user as any)?.orgId;

  if (!organizationId) {
    return res.status(401).json({ message: "Unauthorized: No organization context found" });
  }

  try {
    const subscription = await service.getCurrentSubscription(organizationId);

    // No subscription yet → Default to FREE PLAN structure
    if (!subscription) {
      return res.json({
        subscription: {
          plan: "FREE",
          status: "ACTIVE",
          currentPeriodEnd: null,
        },
      });
    }

    return res.json({
      subscription,
    });
  } catch (error: any) {
    console.error(" Error fetching current subscription:", error.message);
    return res.status(500).json({ message: "Internal server error fetching billing data" });
  }
};