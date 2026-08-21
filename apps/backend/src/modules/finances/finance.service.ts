/**
 * FINANCES SERVICE
 * Contains all financial transaction business logic.
 * Handles transaction creation, approval workflow, and financial summaries.
 * Used by finance.controller.ts
 */
import { prisma } from "../../core/database/prisma.service.js";
import { TransactionStatus } from "@repo/types";

export interface TransactionFilters {
  type?: string;
  category?: string;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  recentTransactions: any[];
}

export class FinanceService {
  /**
   * Get all transactions with filtering and pagination
   */
  static async getTransactions(filters: TransactionFilters) {
    const {
      type,
      category,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (startDate) where.transactionDate = { gte: startDate };
    if (endDate) {
      where.transactionDate = {
        ...where.transactionDate,
        lte: endDate,
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
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

    return { transactions, total };
  }

  /**
   * Get a single transaction by ID
   */
  static async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id, deletedAt: null },
      include: {
        family: { select: { id: true, familyCode: true } },
        member: { select: { id: true, firstName: true, lastName: true } },
        preparedBy: { select: { id: true, email: true, role: true } },
        approvedBy: { select: { id: true, email: true, role: true } },
      },
    });

    return transaction;
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(data: any, userId: string) {
    // Validate family if provided
    if (data.familyId) {
      const family = await prisma.family.findUnique({
        where: { id: data.familyId },
      });
      if (!family) {
        throw new Error("Family not found");
      }
    }

    // Validate member if provided
    if (data.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: data.memberId, deletedAt: null },
      });
      if (!member) {
        throw new Error("Member not found");
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        preparedById: userId,
        status: "DRAFT",
        transactionDate: new Date(),
      },
    });

    return transaction;
  }

  /**
   * Get all pending approvals
   */
  static async getPendingApprovals() {
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

    return transactions;
  }

  /**
   * Approve a transaction
   */
  static async approveTransaction(transactionId: string, approverId: string) {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId, deletedAt: null },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    if (existing.status !== "PENDING") {
      throw new Error("Transaction is not pending approval");
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedAt: new Date(),
      },
    });

    return transaction;
  }

  /**
   * Reject a transaction
   */
  static async rejectTransaction(transactionId: string, reason?: string) {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId, deletedAt: null },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    if (existing.status !== "PENDING") {
      throw new Error("Transaction is not pending approval");
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "REJECTED",
        description: existing.description
          ? `${existing.description} | Rejected: ${reason || "No reason provided"}`
          : `Rejected: ${reason || "No reason provided"}`,
      },
    });

    return transaction;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
  ) {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    return transaction;
  }

  /**
   * Get financial summary with income, expense, and net balance
   */
  static async getFinancialSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<FinancialSummary> {
    const dateFilter: any = { deletedAt: null };
    if (startDate) dateFilter.transactionDate = { gte: startDate };
    if (endDate) {
      dateFilter.transactionDate = {
        ...dateFilter.transactionDate,
        lte: endDate,
      };
    }

    const [income, expense, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...dateFilter, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          preparedBy: { select: { id: true, email: true } },
          approvedBy: { select: { id: true, email: true } },
        },
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      recentTransactions,
    };
  }

  /**
   * Get financial summary by category
   */
  static async getSummaryByCategory(type: "INCOME" | "EXPENSE", year?: number) {
    const yearFilter: any = {};
    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      yearFilter.transactionDate = { gte: start, lte: end };
    }

    const results = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        ...yearFilter,
        type,
        status: "PAID",
        deletedAt: null,
      },
      _sum: { amount: true },
    });

    return results.map((r) => ({
      category: r.category,
      total: r._sum.amount || 0,
    }));
  }
}
