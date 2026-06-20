import { Router } from "express";
import * as controller from "./product.controller.js";
import { upload } from "../../middlewares/upload.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { checkProductLimit } from "../../middlewares/featureLimit.middleware.js";

const router = Router();

// ^GET → everyone
router.get(
  "/",
  authMiddleware,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.getProducts
);

// ^CREATE → admin+
router.post(
  "/",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  checkProductLimit,
  upload.single("image"),
  controller.createProduct
);

// ^UPDATE → admin+
router.put(
  "/:id",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  controller.updateProduct
);

// ^DELETE → owner only
router.delete(
  "/:id",
  authMiddleware,
  authorize("OWNER"),
  controller.deleteProduct
);

export default router;