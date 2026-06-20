import express from "express";
import * as controller from "./dashboard.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, controller.getDashboard);

export default router;