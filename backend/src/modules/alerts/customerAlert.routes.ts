import {Router } from "express";
import * as alertController from "./customerAlert.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();
 router.get(
  "/customers",
  authMiddleware,
  alertController.CustomerAlerts
);

export default router;