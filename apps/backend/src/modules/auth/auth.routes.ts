/**
 * AUTHENTICATION ROUTES
 * Public: login, refresh token
 * Protected: logout, get current user
 * Admin only: register new users
 *
 * All routes use Zod validation middleware.
 */
import { Router } from "express";
import type { Request, Response } from "express";
import {
  login,
  register,
  refreshToken,
  logout,
  getMe,
} from "./auth.controller.js";
import {
  validateLogin,
  validateRegister,
  validateRefreshToken,
} from "./auth.validators.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRoles } from "../../core/middleware/rbac.middleware.js";

const router = Router();

// Public routes
router.post("/login", validateLogin, login);
router.post("/refresh", validateRefreshToken, refreshToken);

// Protected routes (require authentication)
router.use(authenticate);
router.post("/logout", logout);
router.get("/me", getMe);

// Admin-only routes
router.post(
  "/register",
  requireRoles(["SUPER_ADMIN"]),
  validateRegister,
  register,
);

export default router;
