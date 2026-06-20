
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.get(
  "/admin",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);