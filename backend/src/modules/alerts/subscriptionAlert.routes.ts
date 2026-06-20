import { Router } from "express";
import * as subscriptionAlertController from "./subscriptionAlert.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();


router.get(
  "/alerts",
  authMiddleware,
  subscriptionAlertController.subscriptionAlerts
);

export default router;