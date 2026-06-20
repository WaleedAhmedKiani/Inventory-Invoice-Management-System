import { Request, Response } from "express";
import { getInvoiceAlerts } from "../alerts/invoiceAlerts.service.js";

export const InvoiceAlerts = async (
    req: Request,
    res: Response
) => {
    try {
        const alerts = await getInvoiceAlerts(req.user);

        return res.status(200).json(alerts);
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch invoice alerts",
        });
    }
};