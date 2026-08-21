/**
 * Global validation middleware.
 * Handles Zod validation errors and returns formatted responses.
 */
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { errorResponse } from "../utils/response.handler.js";

/**
 * Factory for validation middleware
 * @param schema - Zod schema to validate against
 * @param source - Where to look for data ('body', 'query', 'params')
 * @returns Express middleware
 */
export const validate = (
  schema: z.ZodSchema,
  source: "body" | "query" | "params" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse(
          res,
          "Validation failed",
          400,
          err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        );
      }
      next(err);
    }
  };
};
