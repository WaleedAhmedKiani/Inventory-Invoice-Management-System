
import { Request, Response } from "express";
import { getCustomerAlerts } from "../alerts/customerAlert.service.js"; 


export const CustomerAlerts = async (
  req: Request,
  res: Response
) => {
  try {

    // verify auth middleware populated user session data
    if (!req.user || !req.user.organizationId) {
       res.status(401).json({
        success: false,
        error: "Unauthorized: Missing organization context",
      });
      return;
    }

    const result = await getCustomerAlerts(req.user);
    res.status(200).json(result);
    
  } catch (error: any) {
    console.error(`[CUSTOMER_ALERTS_ERROR]: ${error.message || error}`);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error while computing customer insights",
    });
  }
};