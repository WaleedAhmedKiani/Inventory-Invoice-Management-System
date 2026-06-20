import { Router } from "express";
import { getAuditLogsController } from "./audit.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAuditLogsController);

export default router;