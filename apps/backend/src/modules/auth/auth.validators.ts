/**
 * AUTH VALIDATORS
 * Zod schemas and middleware for validating authentication requests.
 * Validates email format, password length, and role enum.
 */
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum([
      "SUPER_ADMIN",
      "SEBEKA_GUBAE",
      "PRIEST",
      "CASHIER",
      "PROPERTY_MANAGER",
      "REGISTRAR",
      "YOUTH_COORDINATOR",
      "MEMBER",
    ])
    .default("MEMBER"),
  employeeId: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

export const validateRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    refreshTokenSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }
    next(err);
  }
};
