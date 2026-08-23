/**
 * FINANCES VALIDATORS
 * Zod schemas for transaction creation and status updates.
 * Validates type, category, amount, and optional fields.
 */
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  familyId: z.string().optional(),
  memberId: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "PAID"]),
});

export const validateCreateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    createTransactionSchema.parse(req.body);
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

export const validateUpdateStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    updateStatusSchema.parse(req.body);
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
