/**
 * AUTH CONTROLLER
 * Handles login, registration, token refresh, and logout.
 * Uses bcrypt for password hashing and JWT for authentication.
 */
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../core/database/prisma.service.js";
import { env } from "../../config/environment.js";
import {
  successResponse,
  errorResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY },
    );

    const { passwordHash: _, ...userData } = user;

    return successResponse(
      res,
      {
        user: userData,
        token,
      },
      "Login successful",
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, employeeId } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return errorResponse(res, "User already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        employeeId,
        isActive: true,
      },
    });

    const { passwordHash: _, ...userData } = user;
    return successResponse(res, userData, "User created successfully", 201);
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, "Registration failed", 500);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token required", 401);
    }

    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return errorResponse(res, "Invalid refresh token", 401);
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY },
    );

    return successResponse(res, { token: newToken }, "Token refreshed");
  } catch (error) {
    return errorResponse(res, "Invalid refresh token", 401);
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  return successResponse(res, null, "Logged out successfully");
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { employee: true },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const { passwordHash: _, ...userData } = user;
    return successResponse(res, userData, "User profile fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch user", 500);
  }
};
