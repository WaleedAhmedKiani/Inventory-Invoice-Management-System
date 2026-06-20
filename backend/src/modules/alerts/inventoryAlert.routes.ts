import { Router } from "express";
import * as alertController from "./inventoryAlert.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/inventory",
  authMiddleware,
  alertController.InventoryAlerts
);

export default router;