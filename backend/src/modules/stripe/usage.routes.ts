import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getUsage } from "./usage.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getUsage
);

export default router;