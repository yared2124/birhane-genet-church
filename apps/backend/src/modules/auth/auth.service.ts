/**
 * AUTH SERVICE
 * Contains all authentication business logic.
 * Handles user lookup, password verification, and JWT operations.
 * Used by auth.controller.ts
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../core/database/prisma.service.js";
import { env } from "../../config/environment.js";
import type { User, Role } from "@repo/types";

export interface LoginResult {
  user: Omit<User, "passwordHash">;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: Role;
  employeeId?: string;
}

export class AuthService {
  /**
   * Authenticate a user by email and password
   * @param email - User's email
   * @param password - User's password
   * @returns { user, token } or null if invalid
   */
  static async login(
    email: string,
    password: string,
  ): Promise<LoginResult | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
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
    return { user: userData, token };
  }

  /**
   * Register a new user (Admin only)
   * @param data - Registration data
   * @returns Created user
   */
  static async register(
    data: RegisterData,
  ): Promise<Omit<User, "passwordHash"> | null> {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return null;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        employeeId: data.employeeId,
        isActive: true,
      },
    });

    const { passwordHash: _, ...userData } = user;
    return userData;
  }

  /**
   * Refresh JWT token
   * @param refreshToken - Refresh token string
   * @returns New JWT token or null if invalid
   */
  static async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as {
        id: string;
      };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        return null;
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

      return newToken;
    } catch {
      return null;
    }
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User object or null
   */
  static async getUserById(
    userId: string,
  ): Promise<Omit<User, "passwordHash"> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userData } = user;
    return userData;
  }

  /**
   * Check if user has a specific role
   * @param userId - User ID
   * @param roles - Array of allowed roles
   * @returns boolean
   */
  static async hasRole(userId: string, roles: Role[]): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return false;
    return roles.includes(user.role);
  }
}
