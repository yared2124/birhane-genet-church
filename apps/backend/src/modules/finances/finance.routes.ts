/**
 * FINANCES ROUTES
 * Transaction management with approval workflow:
 * - GET /transactions: List all transactions (search, filter, paginate)
 * - POST /transactions: Create new transaction (Cashier only)
 * - GET /approvals/pending: List pending approvals (Sebeka only)
 * - PUT /approvals/:id/approve: Approve a transaction (Sebeka only)
 * - PUT /approvals/:id/reject: Reject a transaction (Sebeka only)
 * - GET /summary: Financial summary dashboard
 */
import { Router } from "express";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  getPendingApprovals,
  approveTransaction,
  rejectTransaction,
  getFinancialSummary,
  updateTransactionStatus,
} from "./finance.controller.js";
import {
  validateCreateTransaction,
  validateUpdateStatus,
} from "./finance.validators.js";
import { authenticate } from "../../core/middleware/auth.middleware.js";
import { requireRoles } from "../../core/middleware/rbac.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Transactions
router.get(
  "/transactions",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE", "CASHIER"]),
  getTransactions,
);

router.get(
  "/transactions/:id",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE", "CASHIER"]),
  getTransactionById,
);

router.post(
  "/transactions",
  requireRoles(["SUPER_ADMIN", "CASHIER"]),
  validateCreateTransaction,
  createTransaction,
);

// Approvals (Sebeka Gubae only)
router.get(
  "/approvals/pending",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE"]),
  getPendingApprovals,
);

router.put(
  "/approvals/:id/approve",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE"]),
  validateUpdateStatus,
  approveTransaction,
);

router.put(
  "/approvals/:id/reject",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE"]),
  validateUpdateStatus,
  rejectTransaction,
);

// Reports & Summary
router.get(
  "/summary",
  requireRoles(["SUPER_ADMIN", "SEBEKA_GUBAE"]),
  getFinancialSummary,
);

export default router;
