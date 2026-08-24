/**
 * REPORTS MODULE - ROUTES
 * 
 * All report endpoints for the church management system.
 * Generates financial, member, sacrament, rental, and dashboard reports.
 * 
 * Routes:
 * - GET /financial - Financial report with income/expense summary
 * - GET /members - Member demographics and statistics report
 * - GET /sacraments - Baptism, Marriage, Burial statistics
 * - GET /rentals - Rental property and payment report
 * - GET /dashboard - Quick dashboard statistics
 * - GET /export/financial - Export financial report as Excel
 * - GET /export/members - Export member report as Excel
 * 
 * Access: SUPER_ADMIN and SEBEKA_GUBAE only
 */
import { Router } from 'express';
import {
  getFinancialReport,
  getMemberReport,
  getSacramentReport,
  getRentalReport,
  getDashboardStats,
  exportFinancialReport,
  exportMemberReport,
} from './report.controller.js';
import {
  validateFinancialReport,
  validateMemberReport,
  validateSacramentReport,
  validateRentalReport,
  validateDateRange,
} from './report.validators.js';
import { authenticate } from '../../core/middleware/auth.middleware.js';
import { requireRoles } from '../../core/middleware/rbac.middleware.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// -------------------- Report Endpoints --------------------

/**
 * GET /reports/financial
 * Generates financial report with income/expense summary.
 * Query params: startDate, endDate (optional)
 */
router.get(
  '/financial',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateFinancialReport,
  getFinancialReport
);

/**
 * GET /reports/members
 * Generates member demographics and statistics report.
 * Query params: startDate, endDate, status, gender (optional)
 */
router.get(
  '/members',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateMemberReport,
  getMemberReport
);

/**
 * GET /reports/sacraments
 * Generates baptism, marriage, and burial statistics.
 * Query params: startDate, endDate, type (optional)
 */
router.get(
  '/sacraments',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateSacramentReport,
  getSacramentReport
);

/**
 * GET /reports/rentals
 * Generates rental property and payment report.
 * Query params: status, houseType (optional)
 */
router.get(
  '/rentals',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateRentalReport,
  getRentalReport
);

/**
 * GET /reports/dashboard
 * Quick dashboard statistics for the overview page.
 * No query params required.
 */
router.get(
  '/dashboard',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  getDashboardStats
);

// -------------------- Export Endpoints --------------------

/**
 * GET /reports/export/financial
 * Exports financial report as Excel (.xlsx) file.
 * Query params: startDate, endDate (optional)
 */
router.get(
  '/export/financial',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateDateRange,
  exportFinancialReport
);

/**
 * GET /reports/export/members
 * Exports member report as Excel (.xlsx) file.
 * Query params: startDate, endDate, status (optional)
 */
router.get(
  '/export/members',
  requireRoles(['SUPER_ADMIN', 'SEBEKA_GUBAE']),
  validateMemberReport,
  exportMemberReport
);

// ✅ IMPORTANT: This is the default export that was missing
export default router;