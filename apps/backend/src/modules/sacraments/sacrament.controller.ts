/**
 * SACRAMENTS CONTROLLER
 * Handles Baptism, Marriage, and Burial records.
 */
import type { Response } from "express";
import { prisma } from "../../core/database/prisma.service.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

// Baptisms
export const getBaptisms = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    // Priests only see their own performed baptisms
    if (req.user?.role === "PRIEST") {
      const priest = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });
      if (priest) where.performedByPriestId = priest.id;
    }

    const [baptisms, total] = await Promise.all([
      prisma.baptism.findMany({
        where,
        skip,
        take: Number(limit),
        include: { performedBy: true },
        orderBy: { baptismDate: "desc" },
      }),
      prisma.baptism.count({ where }),
    ]);
    return paginatedResponse(
      res,
      baptisms,
      Number(page),
      Number(limit),
      total,
      "Baptisms fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch baptisms", 500);
  }
};

export const getBaptismById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const baptism = await prisma.baptism.findUnique({
      where: { id },
      include: { performedBy: true },
    });
    if (!baptism) return errorResponse(res, "Baptism not found", 404);
    return successResponse(res, baptism, "Baptism fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch baptism", 500);
  }
};

export const createBaptism = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    // Find priest from user
    const priest = await prisma.employee.findUnique({
      where: { userId: req.user!.id },
    });
    if (!priest) {
      return errorResponse(res, "Priest not found for this user", 404);
    }
    const baptism = await prisma.baptism.create({
      data: {
        ...data,
        performedByPriestId: priest.id,
        baptismDate: new Date(data.baptismDate || Date.now()),
        birthDate: new Date(data.birthDate || Date.now()),
      },
    });
    return successResponse(res, baptism, "Baptism recorded", 201);
  } catch (error) {
    return errorResponse(res, "Failed to record baptism", 500);
  }
};

export const updateBaptism = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const baptism = await prisma.baptism.update({
      where: { id },
      data: req.body,
    });
    return successResponse(res, baptism, "Baptism updated");
  } catch (error) {
    return errorResponse(res, "Failed to update baptism", 500);
  }
};

// Marriages
export const getMarriages = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [marriages, total] = await Promise.all([
      prisma.marriage.findMany({
        skip,
        take: Number(limit),
        include: { performedBy: true },
        orderBy: { marriageDate: "desc" },
      }),
      prisma.marriage.count(),
    ]);
    return paginatedResponse(
      res,
      marriages,
      Number(page),
      Number(limit),
      total,
      "Marriages fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch marriages", 500);
  }
};

export const getMarriageById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const marriage = await prisma.marriage.findUnique({
      where: { id },
      include: { performedBy: true },
    });
    if (!marriage) return errorResponse(res, "Marriage not found", 404);
    return successResponse(res, marriage, "Marriage fetched");
  } catch (error) {
    return errorResponse(res, "Failed to fetch marriage", 500);
  }
};

export const createMarriage = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const priest = await prisma.employee.findUnique({
      where: { userId: req.user!.id },
    });
    if (!priest) {
      return errorResponse(res, "Priest not found for this user", 404);
    }
    const marriage = await prisma.marriage.create({
      data: {
        ...data,
        performedByPriestId: priest.id,
        marriageDate: new Date(data.marriageDate || Date.now()),
      },
    });
    return successResponse(res, marriage, "Marriage recorded", 201);
  } catch (error) {
    return errorResponse(res, "Failed to record marriage", 500);
  }
};

export const updateMarriage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const marriage = await prisma.marriage.update({
      where: { id },
      data: req.body,
    });
    return successResponse(res, marriage, "Marriage updated");
  } catch (error) {
    return errorResponse(res, "Failed to update marriage", 500);
  }
};

// Burials
export const getBurials = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [burials, total] = await Promise.all([
      prisma.deceased.findMany({
        skip,
        take: Number(limit),
        include: { member: true },
        orderBy: { deathDate: "desc" },
      }),
      prisma.deceased.count(),
    ]);
    return paginatedResponse(
      res,
      burials,
      Number(page),
      Number(limit),
      total,
      "Burials fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch burials", 500);
  }
};

export const createBurial = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const burial = await prisma.deceased.create({
      data: {
        ...data,
        deathDate: new Date(data.deathDate || Date.now()),
      },
    });
    // Update member status to DECEASED
    if (data.memberId) {
      await prisma.member.update({
        where: { id: data.memberId },
        data: { memberStatus: "DECEASED", deletedAt: new Date() },
      });
    }
    return successResponse(res, burial, "Burial recorded", 201);
  } catch (error) {
    return errorResponse(res, "Failed to record burial", 500);
  }
};
