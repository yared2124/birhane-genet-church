/**
 * SACRAMENTS SERVICE
 * Contains all sacrament business logic.
 * Handles Baptisms, Marriages, and Burials.
 * Used by sacrament.controller.ts
 */
import { prisma } from "../../core/database/prisma.service.js";

export interface SacramentFilters {
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class SacramentService {
  // -------------------- Baptisms --------------------
  static async getBaptisms(filters: SacramentFilters & { priestId?: string }) {
    const { startDate, endDate, priestId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (startDate) where.baptismDate = { gte: startDate };
    if (endDate) {
      where.baptismDate = {
        ...where.baptismDate,
        lte: endDate,
      };
    }
    if (priestId) where.performedByPriestId = priestId;

    const [baptisms, total] = await Promise.all([
      prisma.baptism.findMany({
        where,
        skip,
        take: limit,
        include: { performedBy: true },
        orderBy: { baptismDate: "desc" },
      }),
      prisma.baptism.count({ where }),
    ]);

    return { baptisms, total };
  }

  static async getBaptismById(id: string) {
    const baptism = await prisma.baptism.findUnique({
      where: { id },
      include: { performedBy: true },
    });
    return baptism;
  }

  static async createBaptism(data: any, priestId: string) {
    const baptism = await prisma.baptism.create({
      data: {
        ...data,
        performedByPriestId: priestId,
        baptismDate: new Date(data.baptismDate || Date.now()),
        birthDate: new Date(data.birthDate || Date.now()),
      },
    });
    return baptism;
  }

  static async updateBaptism(id: string, data: any) {
    const baptism = await prisma.baptism.update({
      where: { id },
      data,
    });
    return baptism;
  }

  // -------------------- Marriages --------------------
  static async getMarriages(filters: SacramentFilters & { priestId?: string }) {
    const { startDate, endDate, priestId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (startDate) where.marriageDate = { gte: startDate };
    if (endDate) {
      where.marriageDate = {
        ...where.marriageDate,
        lte: endDate,
      };
    }
    if (priestId) where.performedByPriestId = priestId;

    const [marriages, total] = await Promise.all([
      prisma.marriage.findMany({
        where,
        skip,
        take: limit,
        include: { performedBy: true },
        orderBy: { marriageDate: "desc" },
      }),
      prisma.marriage.count({ where }),
    ]);

    return { marriages, total };
  }

  static async getMarriageById(id: string) {
    const marriage = await prisma.marriage.findUnique({
      where: { id },
      include: { performedBy: true },
    });
    return marriage;
  }

  static async createMarriage(data: any, priestId: string) {
    const marriage = await prisma.marriage.create({
      data: {
        ...data,
        performedByPriestId: priestId,
        marriageDate: new Date(data.marriageDate || Date.now()),
      },
    });
    return marriage;
  }

  static async updateMarriage(id: string, data: any) {
    const marriage = await prisma.marriage.update({
      where: { id },
      data,
    });
    return marriage;
  }

  // -------------------- Burials --------------------
  static async getBurials(filters: SacramentFilters) {
    const { startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (startDate) where.deathDate = { gte: startDate };
    if (endDate) {
      where.deathDate = {
        ...where.deathDate,
        lte: endDate,
      };
    }

    const [burials, total] = await Promise.all([
      prisma.deceased.findMany({
        where,
        skip,
        take: limit,
        include: { member: true },
        orderBy: { deathDate: "desc" },
      }),
      prisma.deceased.count({ where }),
    ]);

    return { burials, total };
  }

  static async createBurial(data: any) {
    // Validate member exists
    if (data.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: data.memberId },
      });
      if (!member) {
        throw new Error("Member not found");
      }
    }

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

    return burial;
  }

  // -------------------- Statistics --------------------
  static async getSacramentStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const filter = Object.keys(dateFilter).length > 0 ? dateFilter : {};

    const [baptisms, marriages, burials] = await Promise.all([
      prisma.baptism.count({ where: { baptismDate: filter } }),
      prisma.marriage.count({ where: { marriageDate: filter } }),
      prisma.deceased.count({ where: { deathDate: filter } }),
    ]);

    return { baptisms, marriages, burials };
  }
}
