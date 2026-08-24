/**
 * FINANCES CONTROLLER
 * Handles all transaction operations with approval workflow:
 * - Cashier creates transactions (DRAFT → PENDING)
 * - Sebeka Gubae approves/rejects (PENDING → APPROVED/REJECTED)
 * - Full financial summary with income/expense breakdown
 * - Date-range filtering for reports
 */
import type { Response } from "express";
import { prisma } from "../../core/database/prisma.service.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../../core/utils/response.handler.js";
import type { AuthRequest } from "../../core/middleware/auth.middleware.js";

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      category,
      status,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { deletedAt: null };

    if (type) where.type = String(type);
    if (category) where.category = String(category);
    if (status) where.status = String(status);
    if (startDate) where.transactionDate = { gte: new Date(String(startDate)) };
    if (endDate) {
      where.transactionDate = {
        ...where.transactionDate,
        lte: new Date(String(endDate)),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          family: { select: { id: true, familyCode: true } },
          member: { select: { id: true, firstName: true, lastName: true } },
          preparedBy: { select: { id: true, email: true, role: true } },
          approvedBy: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return paginatedResponse(
      res,
      transactions,
      Number(page),
      Number(limit),
      total,
      "Transactions fetched successfully",
    );
  } catch (error) {
    console.error("Get transactions error:", error);
    return errorResponse(res, "Failed to fetch transactions", 500);
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id, deletedAt: null },
      include: {
        family: { select: { id: true, familyCode: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
        preparedBy: { select: { id: true, email: true, role: true } },
        approvedBy: { select: { id: true, email: true, role: true } },
      },
    });

    if (!transaction) {
      return errorResponse(res, "Transaction not found", 404);
    }

    return successResponse(
      res,
      transaction,
      "Transaction fetched successfully",
    );
  } catch (error) {
    console.error("Get transaction error:", error);
    return errorResponse(res, "Failed to fetch transaction", 500);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
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

    // Validate member if provided
    if (data.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: data.memberId, deletedAt: null },
      });
      if (!member) {
        return errorResponse(res, "Member not found", 404);
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        preparedById: req.user!.id,
        status: "DRAFT",
        transactionDate: new Date(),
      },
    });

    return successResponse(
      res,
      transaction,
      "Transaction created successfully",
      201,
    );
  } catch (error) {
    console.error("Create transaction error:", error);
    return errorResponse(res, "Failed to create transaction", 500);
  }
};

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: "PENDING",
        deletedAt: null,
      },
      include: {
        family: { select: { id: true, familyCode: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
        preparedBy: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(res, transactions, "Pending approvals fetched");
  } catch (error) {
    console.error("Get pending approvals error:", error);
    return errorResponse(res, "Failed to fetch pending approvals", 500);
  }
};

export const approveTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse(res, "Transaction not found", 404);
    }

    if (existing.status !== "PENDING") {
      return errorResponse(res, "Transaction is not pending approval", 400);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: req.user!.id,
        approvedAt: new Date(),
      },
    });

    return successResponse(
      res,
      transaction,
      "Transaction approved successfully",
    );
  } catch (error) {
    console.error("Approve transaction error:", error);
    return errorResponse(res, "Failed to approve transaction", 500);
  }
};

export const rejectTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await prisma.transaction.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return errorResponse(res, "Transaction not found", 404);
    }

    if (existing.status !== "PENDING") {
      return errorResponse(res, "Transaction is not pending approval", 400);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        status: "REJECTED",
        description: existing.description
          ? `${existing.description} | Rejected: ${reason || "No reason provided"}`
          : `Rejected: ${reason || "No reason provided"}`,
      },
    });

    return successResponse(
      res,
      transaction,
      "Transaction rejected successfully",
    );
  } catch (error) {
    console.error("Reject transaction error:", error);
    return errorResponse(res, "Failed to reject transaction", 500);
  }
};

export const updateTransactionStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    return successResponse(res, transaction, "Transaction status updated");
  } catch (error) {
    console.error("Update status error:", error);
    return errorResponse(res, "Failed to update status", 500);
  }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = { deletedAt: null };
    if (startDate) {
      dateFilter.transactionDate = { gte: new Date(String(startDate)) };
    }
    if (endDate) {
      dateFilter.transactionDate = {
        ...dateFilter.transactionDate,
        lte: new Date(String(endDate)),
      };
    }

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    // Recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        preparedBy: { select: { id: true, email: true } },
        approvedBy: { select: { id: true, email: true } },
      },
    });

    return successResponse(
      res,
      {
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
          totalIncomeFormatted: `ETB ${totalIncome.toLocaleString()}`,
          totalExpenseFormatted: `ETB ${totalExpense.toLocaleString()}`,
          netBalanceFormatted: `ETB ${netBalance.toLocaleString()}`,
        },
        recentTransactions,
      },
      "Financial summary fetched",
    );
  } catch (error) {
    console.error("Get financial summary error:", error);
    return errorResponse(res, "Failed to fetch financial summary", 500);
  }
};
