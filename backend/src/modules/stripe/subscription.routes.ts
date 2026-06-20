
import { Router } from "express";
import * as controller from "./subscription.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/checkout",
    authMiddleware,
    controller.createCheckout
);

router.get(
  "/current",
  authMiddleware,
  controller.getCurrentSubscription
);

export default router;