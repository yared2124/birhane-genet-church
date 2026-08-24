/**
 * RENTALS CONTROLLER
 * Handles CRUD for rental houses, tenants, and payments.
 */
import type { Response } from "express";
import { prisma } from "../../core/database/prisma.service.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

export const getHouses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = String(status);

    const [houses, total] = await Promise.all([
      prisma.rentalHouse.findMany({
        where,
        skip,
        take: Number(limit),
        include: { tenant: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rentalHouse.count({ where }),
    ]);

    return paginatedResponse(
      res,
      houses,
      Number(page),
      Number(limit),
      total,
      "Houses fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch houses", 500);
  }
};

export const getHouseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const house = await prisma.rentalHouse.findUnique({
      where: { id },
      include: { tenant: true, rentPayments: true },
    });
    if (!house) return errorResponse(res, "House not found", 404);
    return successResponse(res, house, "House fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch house", 500);
  }
};

export const createHouse = async (req: AuthRequest, res: Response) => {
  try {
    const house = await prisma.rentalHouse.create({ data: req.body });
    return successResponse(res, house, "House created", 201);
  } catch (error) {
    return errorResponse(res, "Failed to create house", 500);
  }
};

export const updateHouse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const house = await prisma.rentalHouse.update({
      where: { id },
      data: req.body,
    });
    return successResponse(res, house, "House updated");
  } catch (error) {
    return errorResponse(res, "Failed to update house", 500);
  }
};

export const deleteHouse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.rentalHouse.delete({ where: { id } });
    return successResponse(res, null, "House deleted", 204);
  } catch (error) {
    return errorResponse(res, "Failed to delete house", 500);
  }
};

// Tenants
export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        skip,
        take: Number(limit),
        include: { house: true, rentPayments: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenant.count(),
    ]);
    return paginatedResponse(
      res,
      tenants,
      Number(page),
      Number(limit),
      total,
      "Tenants fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch tenants", 500);
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { house: true, rentPayments: true },
    });
    if (!tenant) return errorResponse(res, "Tenant not found", 404);
    return successResponse(res, tenant, "Tenant fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch tenant", 500);
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const tenant = await prisma.tenant.create({ data: req.body });
    // Update house status to OCCUPIED
    if (tenant.houseId) {
      await prisma.rentalHouse.update({
        where: { id: tenant.houseId },
        data: { status: "OCCUPIED", tenantId: tenant.id },
      });
    }
    return successResponse(res, tenant, "Tenant created", 201);
  } catch (error) {
    return errorResponse(res, "Failed to create tenant", 500);
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.update({
      where: { id },
      data: req.body,
    });
    return successResponse(res, tenant, "Tenant updated");
  } catch (error) {
    return errorResponse(res, "Failed to update tenant", 500);
  }
};

// Rent Payments
export const getRentPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (tenantId) where.tenantId = String(tenantId);

    const [payments, total] = await Promise.all([
      prisma.rentPayment.findMany({
        where,
        skip,
        take: Number(limit),
        include: { tenant: { include: { house: true } } },
        orderBy: { paidDate: "desc" },
      }),
      prisma.rentPayment.count({ where }),
    ]);
    return paginatedResponse(
      res,
      payments,
      Number(page),
      Number(limit),
      total,
      "Payments fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch payments", 500);
  }
};

export const createRentPayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await prisma.rentPayment.create({
      data: { ...req.body, paidDate: new Date() },
    });
    return successResponse(res, payment, "Payment recorded", 201);
  } catch (error) {
    return errorResponse(res, "Failed to record payment", 500);
  }
};
