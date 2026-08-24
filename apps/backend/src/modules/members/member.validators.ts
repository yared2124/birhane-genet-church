/**
 * MEMBERS VALIDATORS
 * Zod schemas and middleware for validating member-related requests.
 * Ensures data integrity before reaching the controller/service layer.
 *
 * Schemas:
 * - createMemberSchema: Validates new member creation (firstName, lastName, gender, etc.)
 * - updateMemberSchema: Partial version for updates
 * - memberIdSchema: Validates the ID parameter (must be a valid CUID)
 *
 * Middleware: validateCreateMember, validateUpdateMember, validateMemberId
 */
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

// -------------------- Schemas --------------------

/**
 * Schema for creating a new member.
 * All fields are optional except firstName, lastName, and gender.
 */
export const createMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  christianName: z.string().optional(),
  gender: z.enum(["Male", "Female"], {
    message: "Gender must be Male or Female",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  job: z.string().optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED"])
    .optional(),
  childrenCount: z.number().int().min(0).default(0),
  isHeadOfHousehold: z.boolean().default(false),
  familyId: z.string().optional(),
  confessorPriestId: z.string().optional(),
});

/**
 * Schema for updating an existing member.
 * All fields are optional (partial of createMemberSchema).
 */
export const updateMemberSchema = createMemberSchema.partial();

/**
 * Schema for validating member ID in URL parameters.
 * Must be a valid CUID (Prisma's default ID format).
 */
export const memberIdSchema = z.object({
  id: z.string().cuid("Invalid member ID format"),
});

// -------------------- Validation Middleware --------------------

/**
 * Middleware to validate request body for member creation.
 */
export const validateCreateMember = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    createMemberSchema.parse(req.body);
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
 * Middleware to validate request body for member update.
 */
export const validateUpdateMember = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    updateMemberSchema.parse(req.body);
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
 * Middleware to validate the member ID parameter in URL.
 */
export const validateMemberId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    memberIdSchema.parse({ id: req.params.id });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid member ID",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};
