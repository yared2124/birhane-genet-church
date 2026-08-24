/**
 * REPORTS CONTROLLER
 * Generates various reports for the church.
 */
import type { Response } from "express";
import { prisma } from "../../core/database/prisma.service.js";
import {
  successResponse,
  errorResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

export const getFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { deletedAt: null };
    if (startDate) where.transactionDate = { gte: new Date(String(startDate)) };
    if (endDate) {
      where.transactionDate = {
        ...where.transactionDate,
        lte: new Date(String(endDate)),
      };
    }

    const [income, expense, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.findMany({
        where,
        include: {
          preparedBy: { select: { email: true } },
          approvedBy: { select: { email: true } },
        },
        orderBy: { transactionDate: "desc" },
        take: 100,
      }),
    ]);

    return successResponse(
      res,
      {
        summary: {
          totalIncome: income._sum.amount || 0,
          totalExpense: expense._sum.amount || 0,
          netBalance: (income._sum.amount || 0) - (expense._sum.amount || 0),
          incomeCount: income._count || 0,
          expenseCount: expense._count || 0,
        },
        transactions,
      },
      "Financial report generated",
    );
  } catch (error) {
    return errorResponse(res, "Failed to generate financial report", 500);
  }
};

export const getMemberReport = async (req: AuthRequest, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where: any = { deletedAt: null };
    if (status) where.memberStatus = String(status);
    if (startDate) where.createdAt = { gte: new Date(String(startDate)) };
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(String(endDate)),
      };
    }

    const [total, byStatus, byGender, recent] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.groupBy({
        by: ["memberStatus"],
        where,
        _count: true,
      }),
      prisma.member.groupBy({
        by: ["gender"],
        where,
        _count: true,
      }),
      prisma.member.findMany({
        where,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { family: true },
      }),
    ]);

    return successResponse(
      res,
      {
        total,
        byStatus,
        byGender,
        recent,
      },
      "Member report generated",
    );
  } catch (error) {
    return errorResponse(res, "Failed to generate member report", 500);
  }
};

export const getSacramentReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(String(startDate));
    }
    if (endDate) {
      dateFilter.lte = new Date(String(endDate));
    }

    const [baptisms, marriages, burials] = await Promise.all([
      prisma.baptism.count({
        where:
          dateFilter.gte || dateFilter.lte ? { baptismDate: dateFilter } : {},
      }),
      prisma.marriage.count({
        where:
          dateFilter.gte || dateFilter.lte ? { marriageDate: dateFilter } : {},
      }),
      prisma.deceased.count({
        where:
          dateFilter.gte || dateFilter.lte ? { deathDate: dateFilter } : {},
      }),
    ]);

    return successResponse(
      res,
      {
        baptisms,
        marriages,
        burials,
        period: { startDate: startDate || "all", endDate: endDate || "all" },
      },
      "Sacrament report generated",
    );
  } catch (error) {
    return errorResponse(res, "Failed to generate sacrament report", 500);
  }
};

export const getRentalReport = async (req: AuthRequest, res: Response) => {
  try {
    const [totalHouses, occupied, vacant, totalRevenue, byType] =
      await Promise.all([
        prisma.rentalHouse.count(),
        prisma.rentalHouse.count({ where: { status: "OCCUPIED" } }),
        prisma.rentalHouse.count({ where: { status: "VACANT" } }),
        prisma.rentPayment.aggregate({
          _sum: { amount: true },
        }),
        prisma.rentalHouse.groupBy({
          by: ["houseType"],
          _count: true,
        }),
      ]);

    return successResponse(
      res,
      {
        totalHouses,
        occupied,
        vacant,
        totalRevenue: totalRevenue._sum.amount || 0,
        byType,
      },
      "Rental report generated",
    );
  } catch (error) {
    return errorResponse(res, "Failed to generate rental report", 500);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalMembers, totalHouses, pendingApprovals, recentBaptisms] =
      await Promise.all([
        prisma.member.count({ where: { deletedAt: null } }),
        prisma.rentalHouse.count({ where: { status: "OCCUPIED" } }),
        prisma.transaction.count({ where: { status: "PENDING" } }),
        prisma.baptism.findMany({
          take: 5,
          orderBy: { baptismDate: "desc" },
          include: { performedBy: { select: { fullName: true } } },
        }),
      ]);

    // Weekly summary (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyTransactions = await prisma.transaction.aggregate({
      where: {
        createdAt: { gte: weekAgo },
        status: "PAID",
      },
      _sum: { amount: true },
    });

    return successResponse(
      res,
      {
        totalMembers,
        occupiedHouses: totalHouses,
        pendingApprovals,
        recentBaptisms,
        weeklyIncome: weeklyTransactions._sum.amount || 0,
      },
      "Dashboard stats fetched",
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch dashboard stats", 500);
  }
};

export const exportFinancialReport = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    // This would generate an Excel file
    // For now, return a placeholder
    return successResponse(
      res,
      {
        message: "Export functionality will generate Excel file",
        endpoint: "/reports/export/financial",
      },
      "Export endpoint",
    );
  } catch (error) {
    return errorResponse(res, "Failed to export report", 500);
  }
};

export const exportMemberReport = async (req: AuthRequest, res: Response) => {
  try {
    return successResponse(
      res,
      {
        message: "Export functionality will generate Excel file",
        endpoint: "/reports/export/members",
      },
      "Export endpoint",
    );
  } catch (error) {
    return errorResponse(res, "Failed to export report", 500);
  }
};
