import { Router } from "express";
import * as controller from "./customer.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.getCustomers
);

router.post(
  "/",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  controller.CreateCustomer
);

router.put(
  "/:id",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  controller.updateCustomer
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("OWNER"),
  controller.deleteCustomer
);

export default router;