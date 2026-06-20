import { Router } from "express";
import * as controller from "./invoice.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/rbac.middleware.js";
import { checkInvoiceLimit } from "../../middlewares/invoice.middleware.js";


const router = Router();

// ^Create invoice with limit check for Free users and role-based access control
router.post(
  "/",
  authMiddleware,
  checkInvoiceLimit,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.createInvoice
);


// ^Get all invoices for the organization with role-based access control
router.get(
  "/",
  authMiddleware,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.getInvoices
);

// ^Get invoice by id with role-based access control
router.get(
  "/:id",
  authMiddleware,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.getInvoiceById
);

// ^Download invoice PDF with role-based access control
router.get(
  "/:id/pdf",
  authMiddleware,
  authorize("OWNER", "ADMIN", "STAFF"),
  controller.downloadInvoicePdf
);

// ^Cancel invoice with role-based access control
router.patch(
  "/:id/cancel",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  controller.cancelInvoice
);

// ^Delete invoice (dev only) with role-based access control
router.delete(
  "/:id",
  authMiddleware,
  authorize("OWNER", "ADMIN"), 
  controller.deleteInvoice
);

// ^Mark invoice as paid with role-based access control
router.patch(
  "/:id/pay",
  authMiddleware,
  authorize("OWNER", "ADMIN"),
  controller.markInvoicePaid
);

export default router;