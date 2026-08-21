/**
 * MEMBERS SERVICE
 * Contains all member-related business logic.
 * Handles CRUD operations, search, pagination, family management.
 * Used by member.controller.ts
 */
import { prisma } from "../../core/database/prisma.service.js";
import type { Member, MemberStatus } from "@repo/types";

export interface MemberFilters {
  search?: string;
  familyId?: string;
  status?: MemberStatus;
  page?: number;
  limit?: number;
  confessorPriestId?: string;
}

export interface MemberWithRelations extends Member {
  family?: { id: string; familyCode: string } | null;
  confessor?: { id: string; fullName: string } | null;
}

export class MemberService {
  /**
   * Get all members with filtering and pagination
   * @param filters - Search, filter, and pagination options
   * @returns { members, total }
   */
  static async getMembers(filters: MemberFilters) {
    const {
      search,
      familyId,
      status,
      page = 1,
      limit = 20,
      confessorPriestId,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (familyId) where.familyId = familyId;
    if (status) where.memberStatus = status;
    if (confessorPriestId) where.confessorPriestId = confessorPriestId;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { christianName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        include: {
          family: { select: { id: true, familyCode: true } },
          confessor: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.member.count({ where }),
    ]);

    return { members, total };
  }

  /**
   * Get a single member by ID
   * @param id - Member ID
   * @returns Member with relations or null
   */
  static async getMemberById(id: string): Promise<MemberWithRelations | null> {
    const member = await prisma.member.findUnique({
      where: { id, deletedAt: null },
      include: {
        family: { select: { id: true, familyCode: true } },
        confessor: { select: { id: true, fullName: true } },
        transactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return member;
  }

  /**
   * Create a new member
   * @param data - Member creation data
   * @returns Created member
   */
  static async createMember(data: any) {
    // Validate family if provided
    if (data.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: data.familyId },
      });
      if (!family) {
        throw new Error("Family not found");
      }
    }

    // Validate confessor priest if provided
    if (data.confessorPriestId) {
      const priest = await prisma.employee.findUnique({
        where: { id: data.confessorPriestId },
      });
      if (!priest || priest.jobTitle !== "Priest") {
        throw new Error("Invalid confessor priest");
      }
    }

    // Auto-create family if head of household
    let familyId = data.familyId;
    if (data.isHeadOfHousehold && !familyId) {
      const family = await prisma.family.create({
        data: {
          familyCode: `FAM-${Date.now()}`,
          headOfHouseholdId: "placeholder",
        },
      });
      familyId = family.id;
    }

    const member = await prisma.member.create({
      data: {
        ...data,
        familyId,
        memberStatus: "ACTIVE",
      },
    });

    // Update family head if needed
    if (data.isHeadOfHousehold && familyId) {
      await prisma.family.update({
        where: { id: familyId },
        data: { headOfHouseholdId: member.id },
      });
    }

    return member;
  }

  /**
   * Update a member
   * @param id - Member ID
   * @param data - Update data
   * @returns Updated member
   */
  static async updateMember(id: string, data: any) {
    const existing = await prisma.member.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new Error("Member not found");
    }

    // Validate family if provided
    if (data.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: data.familyId },
      });
      if (!family) {
        throw new Error("Family not found");
      }
    }

    // Validate confessor priest if provided
    if (data.confessorPriestId) {
      const priest = await prisma.employee.findUnique({
        where: { id: data.confessorPriestId },
      });
      if (!priest || priest.jobTitle !== "Priest") {
        throw new Error("Invalid confessor priest");
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data,
    });

    return member;
  }

  /**
   * Soft delete a member (archive)
   * @param id - Member ID
   * @returns Updated member
   */
  static async softDeleteMember(id: string) {
    const existing = await prisma.member.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new Error("Member not found");
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        memberStatus: "DECEASED",
        deletedAt: new Date(),
      },
    });

    return member;
  }

  /**
   * Get all families with members
   * @returns List of families with their members
   */
  static async getAllFamilies() {
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

    return families;
  }

  /**
   * Verify if a member has paid Sebeka fee (checks family head payment)
   * @param memberId - Member ID
   * @param year - Year to check
   * @returns boolean
   */
  static async verifySebekaPayment(
    memberId: string,
    year: number,
  ): Promise<boolean> {
    const member = await prisma.member.findUnique({
      where: { id: memberId, deletedAt: null },
      select: { familyId: true, isHeadOfHousehold: true },
    });

    if (!member) return false;

    // If member is head of household, check their own payment
    // Otherwise, check the family head's payment
    let familyId = member.familyId;
    if (!familyId) return false;

    // Get family head
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { headOfHouseholdId: true },
    });
    if (!family) return false;

    const headId = family.headOfHouseholdId;

    // Check if head has paid Sebeka fee for this year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const payment = await prisma.transaction.findFirst({
      where: {
        familyId: familyId,
        category: "SEBEKA_PAYMENT",
        status: "PAID",
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return !!payment;
  }
}
