import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireProPlan } from "../../middlewares/Proplan.middleware.js";

const router = Router();

router.get(
  "/pro-user",
  authMiddleware,
  requireProPlan,
  (req, res) => {
    res.json({
      message: "Welcome PRO user ",
    });
  }
);

export default router;