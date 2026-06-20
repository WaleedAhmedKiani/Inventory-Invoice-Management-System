import { Request, Response } from "express";
import { getSubscriptionAlerts } from "./subscriptionAlert.service.js";

export const subscriptionAlerts = async (req: Request, res: Response) => {
  try {
    const result = await getSubscriptionAlerts(req.user);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};