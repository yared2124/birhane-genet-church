/**
 * SACRAMENTS MODULE - ROUTES
 * Manages Baptisms, Marriages, and Burials.
 */
import { Router } from "express";
import {
  getBaptisms,
  getBaptismById,
  createBaptism,
  updateBaptism,
  getMarriages,
  getMarriageById,
  createMarriage,
  updateMarriage,
  getBurials,
  createBurial,
} from "./sacrament.controller.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRoles } from "../../core/middleware/rbac.middleware.js";

const router = Router();
router.use(authenticate);

// Baptisms
router.get(
  "/baptisms",
  requireRoles(["SUPER_ADMIN", "PRIEST", "REGISTRAR"]),
  getBaptisms,
);
router.get(
  "/baptisms/:id",
  requireRoles(["SUPER_ADMIN", "PRIEST", "REGISTRAR"]),
  getBaptismById,
);
router.post(
  "/baptisms",
  requireRoles(["SUPER_ADMIN", "PRIEST"]),
  createBaptism,
);
router.put(
  "/baptisms/:id",
  requireRoles(["SUPER_ADMIN", "PRIEST"]),
  updateBaptism,
);

// Marriages
router.get(
  "/marriages",
  requireRoles(["SUPER_ADMIN", "PRIEST", "REGISTRAR"]),
  getMarriages,
);
router.get(
  "/marriages/:id",
  requireRoles(["SUPER_ADMIN", "PRIEST", "REGISTRAR"]),
  getMarriageById,
);
router.post(
  "/marriages",
  requireRoles(["SUPER_ADMIN", "PRIEST"]),
  createMarriage,
);
router.put(
  "/marriages/:id",
  requireRoles(["SUPER_ADMIN", "PRIEST"]),
  updateMarriage,
);

// Burials
router.get(
  "/burials",
  requireRoles(["SUPER_ADMIN", "PRIEST", "REGISTRAR"]),
  getBurials,
);
router.post("/burials", requireRoles(["SUPER_ADMIN", "PRIEST"]), createBurial);

export default router;
