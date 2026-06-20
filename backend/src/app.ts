import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import invoiceRoutes from "./modules/invoices/invoice.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import subscriptionRoutes from "./modules/stripe/subscription.routes.js";
import usageRoutes from "./modules/stripe/usage.routes.js";
import portalRoutes from "./modules/stripe/portal.routes.js";
import proRoutes from "./modules/stripe/proPlan.routes.js";
import InventoryAlertRoutes from "./modules/alerts/inventoryAlert.routes.js";
import InvoiceAlertRoutes from "./modules/alerts/invoiceAlert.routes.js";
import CustomerAlertRoutes from "./modules/alerts/customerAlert.routes.js";
import subscriptionAlertRoutes from "./modules/alerts/subscriptionAlert.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import { stripeWebhook } from "./modules/stripe/webhook.controller.js";
import { globalLimiter, loginLimiter } from "./middlewares/rateLimit.js";
import { httpLogger } from "./utils/logger.js";




const app = express();
app.use(httpLogger); // ^Logging middleware (pino-http)

app.set("trust proxy", 1); // ^trust first proxy
app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.post(
  "/api/webhook",
  express.raw({ 
    type: "application/json",
    verify: (req: any, res, buf) => {
      req.rawBody = buf; // Force assign the exact raw buffer to req.rawBody
    }
  }),
  stripeWebhook
);

app.use(express.json());
app.use(helmet());

app.use("/api", process.env.NODE_ENV === "development" ? (req, res, next) => next() : globalLimiter); // ^rate limiter


//  Auth Routes Logic with Conditional loginLimiter
if (process.env.NODE_ENV === "development") {
  console.log(" Dev Mode: Skipping login rate limiter");
  app.use("/api/auth", authRoutes); 
} else {
  // Production: Apply loginLimiter ONLY to the auth routes
  app.use("/api/auth", loginLimiter, authRoutes);
}

//  API Routes Logic
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/limits", subscriptionAlertRoutes);
app.use("/api", proRoutes);
app.use("/api/billing", portalRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/alerts", InventoryAlertRoutes);
app.use("/api/alerts", InvoiceAlertRoutes);
app.use("/api/alerts", CustomerAlertRoutes);
app.use("/api/audit-logs", auditRoutes);



// health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;