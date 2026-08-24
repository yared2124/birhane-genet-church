/**
 * MEMBERS CONTROLLER
 * Handles all member CRUD operations with:
 * - Search by name, phone, Christian name
 * - Filter by family, status
 * - Pagination
 * - Soft delete (archiving)
 * - Automatic family creation for heads of household
 * - Priest role restriction (only sees own confession members)
 */
import type { Response } from "express";
import { prisma } from "../../core/database/prisma.service.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, familyId, status, page = "1", limit = "20" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { deletedAt: null };

    if (familyId) {
      where.familyId = String(familyId);
    }

    if (status) {
      where.memberStatus = String(status);
    }

    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: "insensitive" } },
        { lastName: { contains: String(search), mode: "insensitive" } },
        { christianName: { contains: String(search), mode: "insensitive" } },
        { phone: { contains: String(search) } },
      ];
    }

    // Priests can only see their own confession members
    if (req.user?.role === "PRIEST") {
      const priest = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });
      if (priest) {
        where.confessorPriestId = priest.id;
      }
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          family: true,
          confessor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.member.count({ where }),
    ]);

    return paginatedResponse(
      res,
      members,
      Number(page),
      Number(limit),
      total,
      "Members fetched successfully",
    );
  } catch (error) {
    console.error("Get members error:", error);
    return errorResponse(res, "Failed to fetch members", 500);
  }
};

export const getMemberById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id, deletedAt: null },
      include: {
        family: true,
        confessor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!member) {
      return errorResponse(res, "Member not found", 404);
    }

    return successResponse(res, member, "Member fetched successfully");
  } catch (error) {
    console.error("Get member by ID error:", error);
    return errorResponse(res, "Failed to fetch member", 500);
  }
};

export const createMember = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    // Validate family if provided
    if (data.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: data.familyId },
      });
      if (!family) {
        return errorResponse(res, "Family not found", 404);
      }
    }

    // Validate confessor priest if provided
    if (data.confessorPriestId) {
      const priest = await prisma.employee.findUnique({
        where: { id: data.confessorPriestId },
      });
      if (!priest || priest.jobTitle !== "Priest") {
        return errorResponse(res, "Invalid confessor priest", 404);
      }
    }

    // If member is head of household, create a new family automatically
    if (data.isHeadOfHousehold && !data.familyId) {
      const family = await prisma.family.create({
        data: {
          familyCode: `FAM-${Date.now()}`,
          headOfHouseholdId: "placeholder",
        },
      });
      data.familyId = family.id;
    }

    const member = await prisma.member.create({
      data: {
        ...data,
        memberStatus: "ACTIVE",
      },
    });

    // Update family with the actual member ID as head
    if (data.isHeadOfHousehold && member.familyId) {
      await prisma.family.update({
        where: { id: member.familyId },
        data: { headOfHouseholdId: member.id },
      });
    }

    return successResponse(res, member, "Member created successfully", 201);
  } catch (error) {
    console.error("Create member error:", error);
    return errorResponse(res, "Failed to create member", 500);
  }
};

export const updateMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.member.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse(res, "Member not found", 404);
    }

    // Validate family if provided
    if (data.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: data.familyId },
      });
      if (!family) {
        return errorResponse(res, "Family not found", 404);
      }
    }

    // Validate confessor priest if provided
    if (data.confessorPriestId) {
      const priest = await prisma.employee.findUnique({
        where: { id: data.confessorPriestId },
      });
      if (!priest || priest.jobTitle !== "Priest") {
        return errorResponse(res, "Invalid confessor priest", 404);
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data,
    });

    return successResponse(res, member, "Member updated successfully");
  } catch (error) {
    console.error("Update member error:", error);
    return errorResponse(res, "Failed to update member", 500);
  }
};

export const softDeleteMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.member.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse(res, "Member not found", 404);
    }

    // Soft delete: mark as DECEASED and set deletedAt
    const member = await prisma.member.update({
      where: { id },
      data: {
        memberStatus: "DECEASED",
        deletedAt: new Date(),
      },
    });

    return successResponse(res, member, "Member archived successfully");
  } catch (error) {
    console.error("Delete member error:", error);
    return errorResponse(res, "Failed to delete member", 500);
  }
};

export const getMemberFamilies = async (req: AuthRequest, res: Response) => {
  try {
    const families = await prisma.family.findMany({
      include: {
        head: true,
        members: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            christianName: true,
            isHeadOfHousehold: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, families, "Families fetched successfully");
  } catch (error) {
    console.error("Get families error:", error);
    return errorResponse(res, "Failed to fetch families", 500);
  }
};
