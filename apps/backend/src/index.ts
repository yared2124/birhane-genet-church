import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import route modules
import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/members.routes";
import familyRoutes from "./routes/families.routes";
import financeRoutes from "./routes/finances.routes";
import rentalRoutes from "./routes/rentals.routes";
import certificateRoutes from "./routes/certificates.routes";
import reportRoutes from "./routes/reports.routes";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(morgan("dev")); // Logging

// -------------------- Health Check --------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// -------------------- API Routes --------------------
const API_PREFIX = "/api/v1";
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/members`, memberRoutes);
app.use(`${API_PREFIX}/families`, familyRoutes);
app.use(`${API_PREFIX}/finances`, financeRoutes);
app.use(`${API_PREFIX}/rentals`, rentalRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);

// -------------------- Error Handling Middleware --------------------
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  },
);

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API prefix: ${API_PREFIX}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
