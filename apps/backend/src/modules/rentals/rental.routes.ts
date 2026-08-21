/**
 * RENTALS MODULE - ROUTES
 * Manages rental houses and tenants.
 * Property Manager can create, update, and view rentals.
 */
import { Router } from "express";
import {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  getRentPayments,
  createRentPayment,
} from "./rental.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRoles } from "../../core/middleware/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Houses
router.get(
  "/houses",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  getHouses,
);
router.get(
  "/houses/:id",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  getHouseById,
);
router.post(
  "/houses",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  createHouse,
);
router.put(
  "/houses/:id",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  updateHouse,
);
router.delete("/houses/:id", requireRoles(["SUPER_ADMIN"]), deleteHouse);

// Tenants
router.get(
  "/tenants",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  getTenants,
);
router.get(
  "/tenants/:id",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  getTenantById,
);
router.post(
  "/tenants",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  createTenant,
);
router.put(
  "/tenants/:id",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  updateTenant,
);

// Rent Payments
router.get(
  "/payments",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  getRentPayments,
);
router.post(
  "/payments",
  requireRoles(["SUPER_ADMIN", "PROPERTY_MANAGER"]),
  createRentPayment,
);

export default router;
