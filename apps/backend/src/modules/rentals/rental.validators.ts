import { z } from "zod";

export const createHouseSchema = z.object({
  houseNumber: z.string().min(1, "House number is required"),
  houseType: z.enum(["Shop", "Residence", "Hall"]),
  monthlyRent: z.number().positive("Rent must be positive"),
  status: z.enum(["VACANT", "OCCUPIED"]).default("VACANT"),
});

export const createTenantSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  houseId: z.string().min(1, "House ID is required"),
  rentStartDate: z.string().transform((v) => new Date(v)),
  rentEndDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
});

export const createRentPaymentSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  paymentPeriod: z.string().min(1, "Payment period is required"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["PAID", "OVERDUE", "PARTIAL"]).default("PAID"),
});
