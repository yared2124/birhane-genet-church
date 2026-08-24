/**
 * MAIN SERVER ENTRY POINT
 * Initializes Express and connects all modules.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/environment.js";

// Import routes (barrel exports)
import authRoutes from "./modules/auth/auth.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import financeRoutes from "./modules/finances/finance.routes.js";
import rentalRoutes from "./modules/rentals/rental.routes.js";
import sacramentRoutes from "./modules/sacraments/sacrament.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Birhane Genet Church API",
  });
});

// API Routes
const API_PREFIX = "/api/v1";
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/members`, memberRoutes);
app.use(`${API_PREFIX}/finances`, financeRoutes);
app.use(`${API_PREFIX}/rentals`, rentalRoutes);
app.use(`${API_PREFIX}/sacraments`, sacramentRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
  },
);

// Start Server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📡 API prefix: ${API_PREFIX}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

export { app };
