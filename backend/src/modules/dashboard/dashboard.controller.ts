import * as service from "./dashboard.service.js";
import { Request, Response } from "express";

// *DashBoard stats
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const data = await service.getDashboardStats(req.user, req.query);
    res.json({ message: "Dashboard stats retrieved successfully", ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};