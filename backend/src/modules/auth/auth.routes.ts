import { Router } from "express";
import { register, login, getProfile, logout } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { loginLimiter } from "../../middlewares/rateLimit.js";

const router = Router();

router.post("/register", loginLimiter, register);
router.post("/login", loginLimiter, login);

router.get("/profile", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logout);

export default router;