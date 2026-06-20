import { Request, Response } from "express";
import * as alertService from "./inventoryAlert.service.js";

export const InventoryAlerts = async (
  req: Request,
  res: Response
) => {
  try {
    const alerts = await alertService.getInventoryAlerts(
      req.user
    );

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};