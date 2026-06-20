import { Router } from "express";
import * as alertController from "./invoiceAlert.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/invoices",
  authMiddleware,
  alertController.InvoiceAlerts
);

export default router;