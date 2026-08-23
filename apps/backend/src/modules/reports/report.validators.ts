/**
 * REPORTS VALIDATORS
 * Zod schemas for validating report query parameters.
 *
 * Schemas:
 * - dateRangeSchema: Validates startDate and endDate query params
 * - reportFiltersSchema: Validates report filters (status, type, etc.)
 */
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// -------------------- Schemas --------------------

/**
 * Schema for date range query parameters.
 * Both startDate and endDate are optional but must be valid dates if provided.
 */
export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => (val ? !isNaN(Date.parse(val)) : true), {
      message: "Invalid startDate format",
    })
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .refine((val) => (val ? !isNaN(Date.parse(val)) : true), {
      message: "Invalid endDate format",
    })
    .transform((val) => (val ? new Date(val) : undefined)),
});

/**
 * Schema for financial report filters.
 */
export const financialReportSchema = dateRangeSchema.extend({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
});

/**
 * Schema for member report filters.
 */
export const memberReportSchema = dateRangeSchema.extend({
  status: z
    .enum(["ACTIVE", "DECEASED", "TRANSFERRED", "EXCOMMUNICATED"])
    .optional(),
  gender: z.enum(["Male", "Female"]).optional(),
});

/**
 * Schema for sacrament report filters.
 */
export const sacramentReportSchema = dateRangeSchema.extend({
  type: z.enum(["BAPTISM", "MARRIAGE", "BURIAL"]).optional(),
});

/**
 * Schema for rental report filters.
 */
export const rentalReportSchema = z.object({
  status: z.enum(["VACANT", "OCCUPIED"]).optional(),
  houseType: z.enum(["Shop", "Residence", "Hall"]).optional(),
});

// -------------------- Validation Middleware --------------------

/**
 * Middleware to validate financial report query parameters.
 */
export const validateFinancialReport = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    financialReportSchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

/**
 * Middleware to validate member report query parameters.
 */
export const validateMemberReport = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    memberReportSchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

/**
 * Middleware to validate sacrament report query parameters.
 */
export const validateSacramentReport = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    sacramentReportSchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

/**
 * Middleware to validate rental report query parameters.
 */
export const validateRentalReport = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    rentalReportSchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

/**
 * Middleware to validate general date range for reports.
 */
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    dateRangeSchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};
