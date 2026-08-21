import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  data: T,
  message = "Success",
  status = 200,
) => res.status(status).json({ success: true, message, data });

export const paginatedResponse = <T>(
  res: Response,
  data: T,
  page: number,
  limit: number,
  total: number,
  message = "Success",
) =>
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });

export const errorResponse = (
  res: Response,
  message: string,
  status = 500,
  errors?: any,
) => res.status(status).json({ success: false, message, errors });
