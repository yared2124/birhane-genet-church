/**
 * REPORTS SERVICE
 * Contains all report generation business logic.
 * Handles financial, member, sacrament, and rental reports.
 * Used by report.controller.ts
 */
import { prisma } from "../../core/database/prisma.service.js";
import * as XLSX from "xlsx";

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export class ReportService {
  /**
   * Generate financial report
   */
  static async getFinancialReport(dateRange: DateRange) {
    const where: any = { deletedAt: null };
    if (dateRange.startDate)
      where.transactionDate = { gte: dateRange.startDate };
    if (dateRange.endDate) {
      where.transactionDate = {
        ...where.transactionDate,
        lte: dateRange.endDate,
      };
    }

    const [income, expense, transactions, byCategory] = await Promise.all([
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
      prisma.transaction.groupBy({
        by: ["category", "type"],
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      summary: {
        totalIncome: income._sum.amount || 0,
        totalExpense: expense._sum.amount || 0,
        netBalance: (income._sum.amount || 0) - (expense._sum.amount || 0),
        incomeCount: income._count || 0,
        expenseCount: expense._count || 0,
      },
      byCategory,
      transactions,
    };
  }

  /**
   * Generate member report
   */
  static async getMemberReport(dateRange: DateRange, status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.memberStatus = status;
    if (dateRange.startDate) where.createdAt = { gte: dateRange.startDate };
    if (dateRange.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: dateRange.endDate,
      };
    }

    const [total, byStatus, byGender, byMaritalStatus, recent] =
      await Promise.all([
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
        prisma.member.groupBy({
          by: ["maritalStatus"],
          where,
          _count: true,
        }),
        prisma.member.findMany({
          where,
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { family: true, confessor: true },
        }),
      ]);

    return {
      total,
      byStatus,
      byGender,
      byMaritalStatus,
      recent,
    };
  }

  /**
   * Generate sacrament report
   */
  static async getSacramentReport(dateRange: DateRange) {
    const dateFilter: any = {};
    if (dateRange.startDate) dateFilter.gte = dateRange.startDate;
    if (dateRange.endDate) dateFilter.lte = dateRange.endDate;

    const whereBaptism =
      Object.keys(dateFilter).length > 0 ? { baptismDate: dateFilter } : {};
    const whereMarriage =
      Object.keys(dateFilter).length > 0 ? { marriageDate: dateFilter } : {};
    const whereBurial =
      Object.keys(dateFilter).length > 0 ? { deathDate: dateFilter } : {};

    const [baptisms, marriages, burials, recentBaptisms, recentMarriages] =
      await Promise.all([
        prisma.baptism.count({ where: whereBaptism }),
        prisma.marriage.count({ where: whereMarriage }),
        prisma.deceased.count({ where: whereBurial }),
        prisma.baptism.findMany({
          where: whereBaptism,
          take: 5,
          orderBy: { baptismDate: "desc" },
          include: { performedBy: true },
        }),
        prisma.marriage.findMany({
          where: whereMarriage,
          take: 5,
          orderBy: { marriageDate: "desc" },
          include: { performedBy: true },
        }),
      ]);

    return {
      totals: { baptisms, marriages, burials },
      recentBaptisms,
      recentMarriages,
      period: {
        startDate: dateRange.startDate || "all",
        endDate: dateRange.endDate || "all",
      },
    };
  }

  /**
   * Generate rental report
   */
  static async getRentalReport() {
    const [
      totalHouses,
      occupied,
      vacant,
      totalRevenue,
      byType,
      recentPayments,
    ] = await Promise.all([
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
      prisma.rentPayment.findMany({
        take: 10,
        orderBy: { paidDate: "desc" },
        include: { tenant: { include: { house: true } } },
      }),
    ]);

    return {
      houses: {
        total: totalHouses,
        occupied,
        vacant,
        byType,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      recentPayments,
    };
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [
      totalMembers,
      occupiedHouses,
      pendingApprovals,
      recentBaptisms,
      weeklyIncome,
      monthlyIncome,
      totalTransactions,
    ] = await Promise.all([
      prisma.member.count({ where: { deletedAt: null } }),
      prisma.rentalHouse.count({ where: { status: "OCCUPIED" } }),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.baptism.findMany({
        take: 5,
        orderBy: { baptismDate: "desc" },
        include: { performedBy: { select: { fullName: true } } },
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: weekAgo },
          status: "PAID",
          type: "INCOME",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: monthAgo },
          status: "PAID",
          type: "INCOME",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalMembers,
      occupiedHouses,
      pendingApprovals,
      recentBaptisms,
      weeklyIncome: weeklyIncome._sum.amount || 0,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      totalTransactions: totalTransactions._sum.amount || 0,
    };
  }

  /**
   * Export financial report to Excel
   */
  static async exportFinancialReport(dateRange: DateRange): Promise<Buffer> {
    const report = await this.getFinancialReport(dateRange);
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Financial Report"],
      [""],
      ["Metric", "Amount"],
      ["Total Income", report.summary.totalIncome],
      ["Total Expense", report.summary.totalExpense],
      ["Net Balance", report.summary.netBalance],
      ["Income Count", report.summary.incomeCount],
      ["Expense Count", report.summary.expenseCount],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // By Category sheet
    const categoryData = [["Category", "Type", "Amount"]];
    report.byCategory.forEach((c: any) => {
      categoryData.push([c.category, c.type, c._sum.amount || 0]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, ws2, "By Category");

    // Transactions sheet
    const txData = [
      ["Date", "Type", "Category", "Amount", "Status", "Description"],
    ];
    report.transactions.forEach((tx: any) => {
      txData.push([
        tx.transactionDate.toLocaleDateString(),
        tx.type,
        tx.category,
        tx.amount,
        tx.status,
        tx.description || "",
      ]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, ws3, "Transactions");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  /**
   * Export member report to Excel
   */
  static async exportMemberReport(
    dateRange: DateRange,
    status?: string,
  ): Promise<Buffer> {
    const report = await this.getMemberReport(dateRange, status);
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Member Report"],
      [""],
      ["Metric", "Count"],
      ["Total Members", report.total],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // By Status sheet
    const statusData = [["Status", "Count"]];
    report.byStatus.forEach((s: any) => {
      statusData.push([s.memberStatus, s._count]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, ws2, "By Status");

    // By Gender sheet
    const genderData = [["Gender", "Count"]];
    report.byGender.forEach((g: any) => {
      genderData.push([g.gender, g._count]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(genderData);
    XLSX.utils.book_append_sheet(wb, ws3, "By Gender");

    // Recent Members
    const recentData = [["Name", "Family", "Status", "Joined Date"]];
    report.recent.forEach((m: any) => {
      recentData.push([
        `${m.firstName} ${m.lastName}`,
        m.family?.familyCode || "N/A",
        m.memberStatus,
        m.createdAt.toLocaleDateString(),
      ]);
    });
    const ws4 = XLSX.utils.aoa_to_sheet(recentData);
    XLSX.utils.book_append_sheet(wb, ws4, "Recent Members");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}
