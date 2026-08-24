/**
 * RENTALS SERVICE
 * Contains all rental business logic.
 * Handles houses, tenants, and rent payments.
 * Used by rental.controller.ts
 */
import { prisma } from "../../core/database/prisma.service.js";

export interface HouseFilters {
  status?: string;
  houseType?: string;
  page?: number;
  limit?: number;
}

export class RentalService {
  /**
   * Get all rental houses with filtering and pagination
   */
  static async getHouses(filters: HouseFilters) {
    const { status, houseType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (houseType) where.houseType = houseType;

    const [houses, total] = await Promise.all([
      prisma.rentalHouse.findMany({
        where,
        skip,
        take: limit,
        include: { tenant: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rentalHouse.count({ where }),
    ]);

    return { houses, total };
  }

  /**
   * Get a single house by ID
   */
  static async getHouseById(id: string) {
    const house = await prisma.rentalHouse.findUnique({
      where: { id },
      include: { tenant: true, rentPayments: true },
    });
    return house;
  }

  /**
   * Create a new rental house
   */
  static async createHouse(data: any) {
    const house = await prisma.rentalHouse.create({
      data: {
        ...data,
        status: data.status || "VACANT",
      },
    });
    return house;
  }

  /**
   * Update a rental house
   */
  static async updateHouse(id: string, data: any) {
    const house = await prisma.rentalHouse.update({
      where: { id },
      data,
    });
    return house;
  }

  /**
   * Delete a rental house (hard delete)
   */
  static async deleteHouse(id: string) {
    await prisma.rentalHouse.delete({ where: { id } });
    return true;
  }

  /**
   * Get all tenants with pagination
   */
  static async getTenants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        skip,
        take: limit,
        include: { house: true, rentPayments: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenant.count(),
    ]);
    return { tenants, total };
  }

  /**
   * Get a single tenant by ID
   */
  static async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { house: true, rentPayments: true },
    });
    return tenant;
  }

  /**
   * Create a new tenant
   */
  static async createTenant(data: any) {
    // Check if house is available
    const house = await prisma.rentalHouse.findUnique({
      where: { id: data.houseId },
    });
    if (!house) {
      throw new Error("House not found");
    }
    if (house.status === "OCCUPIED") {
      throw new Error("House is already occupied");
    }

    const tenant = await prisma.tenant.create({
      data: {
        ...data,
        rentStartDate: new Date(data.rentStartDate),
        rentEndDate: data.rentEndDate ? new Date(data.rentEndDate) : undefined,
      },
    });

    // Update house status
    await prisma.rentalHouse.update({
      where: { id: data.houseId },
      data: { status: "OCCUPIED", tenantId: tenant.id },
    });

    return tenant;
  }

  /**
   * Update a tenant
   */
  static async updateTenant(id: string, data: any) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data,
    });
    return tenant;
  }

  /**
   * Get rent payments for a tenant
   */
  static async getRentPayments(tenantId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [payments, total] = await Promise.all([
      prisma.rentPayment.findMany({
        where,
        skip,
        take: limit,
        include: { tenant: { include: { house: true } } },
        orderBy: { paidDate: "desc" },
      }),
      prisma.rentPayment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Record a rent payment
   */
  static async createRentPayment(data: any) {
    const payment = await prisma.rentPayment.create({
      data: {
        ...data,
        paidDate: new Date(),
      },
    });
    return payment;
  }

  /**
   * Calculate overdue payments for a tenant
   */
  static async getOverdueBalance(tenantId: string): Promise<number> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { house: true },
    });
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const monthlyRent = tenant.house.monthlyRent;

    // Find all payments for this tenant
    const payments = await prisma.rentPayment.findMany({
      where: { tenantId },
      orderBy: { paidDate: "asc" },
    });

    // Calculate expected payments based on rent start date and current date
    const startDate = new Date(tenant.rentStartDate);
    const now = new Date();
    const monthsSinceStart =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());

    const expectedPayments = Math.floor(monthsSinceStart);
    const actualPayments = payments.length;

    if (actualPayments >= expectedPayments) {
      return 0;
    }

    const missingMonths = expectedPayments - actualPayments;
    return missingMonths * monthlyRent;
  }
}
