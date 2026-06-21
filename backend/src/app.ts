import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Route imports (preserving your exact ES Module paths)
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

// Middlewares and utilities
import { stripeWebhook } from "./modules/stripe/webhook.controller.js";
import { globalLimiter, loginLimiter } from "./middlewares/rateLimit.js";
import { httpLogger } from "./utils/logger.js";

const app = express();

// HTTP Request Loggerclear
app.use(httpLogger);


app.get('/ping', (req: Request, res: Response) => {
res.status(200).send('OK');
});

// Trust first proxy (necessary for rate limiting on Render/Vercel)
app.set("trust proxy", 1);
app.use(cookieParser());

// CORS configuration supporting both production and local environment variables
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

// Stripe Webhook Endpoint (MUST use raw parser verification with explicit types)
app.post(
    "/api/webhook",
    express.raw({ 
        type: "application/json",
        verify: (req: Request, res: Response, buf: Buffer) => {
            // Safely assign the raw body buffer to satisfy Stripe verification
            (req as any).rawBody = buf;
        }
    }),
    stripeWebhook
);

// Standard JSON parser registered AFTER Stripe webhook
app.use(express.json());
app.use(helmet());

// Global Rate Limiter applied only in production with explicit middleware types
app.use(
    "/api", 
    process.env.NODE_ENV === "development" 
        ? (req: Request, res: Response, next: NextFunction) => next() 
        : globalLimiter
);

// Auth Routes with conditional Rate Limiter based on Environment
if (process.env.NODE_ENV === "development") {
    console.log("Dev Mode: Skipping login rate limiter");
    app.use("/api/auth", authRoutes); 
} else {
    // Production: Apply login rate limits
    app.use("/api/auth", loginLimiter, authRoutes);
}

// Application API Routes
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

// Server Root Health Check
app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});

export default app;