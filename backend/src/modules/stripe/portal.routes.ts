
import { Router } from "express";
import * as controller from "./portal.controller.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/portal",
  authMiddleware,
  controller.createBillingPortal
);

export default router;