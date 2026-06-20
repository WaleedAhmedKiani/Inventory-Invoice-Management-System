import { stripe } from "../../config/stripe.js";
import { prisma } from "../../config/db.js";

export const createBillingPortal = async (req: any, res: any) => {
  const organizationId = req.user.organizationId;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org?.stripeCustomerId) {
    return res.status(400).json({
      message: "Stripe customer not found",
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: "http://localhost:5173/settings/billing",
  });

  return res.json({ url: session.url });
};