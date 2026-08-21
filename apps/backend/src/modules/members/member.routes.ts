/**
 * MEMBERS ROUTES
 * CRUD operations for church members and families.
 * - GET /: List with search, filter, pagination
 * - GET /:id: Single member details
 * - POST /: Create new member
 * - PUT /:id: Update member
 * - DELETE /:id: Soft delete (archive)
 *
 * Access controlled by roles: SUPER_ADMIN, REGISTRAR, PRIEST, etc.
 */
import { Router } from "express";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  softDeleteMember,
  getMemberFamilies,
} from "./member.controller.js";
import {
  validateCreateMember,
  validateUpdateMember,
  validateMemberId,
} from "./member.validators.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRoles } from "../../core/middleware/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// List with search, filter, pagination
router.get(
  "/",
  requireRoles([
    "SUPER_ADMIN",
    "SEBEKA_GUBAE",
    "PRIEST",
    "REGISTRAR",
    "YOUTH_COORDINATOR",
  ]),
  getMembers,
);

// Get families list
router.get(
  "/families",
  requireRoles(["SUPER_ADMIN", "REGISTRAR"]),
  getMemberFamilies,
);

// Get single member
router.get("/:id", validateMemberId, getMemberById);

// Create new member
router.post(
  "/",
  requireRoles(["SUPER_ADMIN", "REGISTRAR"]),
  validateCreateMember,
  createMember,
);

// Update member
router.put(
  "/:id",
  requireRoles(["SUPER_ADMIN", "REGISTRAR"]),
  validateMemberId,
  validateUpdateMember,
  updateMember,
);

// Soft delete (archive)
router.delete(
  "/:id",
  requireRoles(["SUPER_ADMIN"]),
  validateMemberId,
  softDeleteMember,
);

export default router;
