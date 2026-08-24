/**
 * Centralized Feature Flag Management
 *
 * All feature toggles for the Birhane Genet Church Management System.
 * Syncs between frontend and backend via the shared @repo/config package.
 *
 * To use a feature flag:
 * - Frontend: import { FEATURE_FLAGS } from '@repo/config'
 * - Backend: import { FEATURE_FLAGS } from '../../config/feature-flags.js'
 *
 * Toggle features on/off without redeploying the entire application.
 * New features should be added here with default values.
 */
export const FEATURE_FLAGS = {
  // ============================================================
  // CORE FEATURES (Always On)
  // ============================================================

  /** Authentication and user management */
  ENABLE_AUTH: true,

  /** Member and family management */
  ENABLE_MEMBERS: true,

  /** Financial transactions and approvals */
  ENABLE_FINANCES: true,

  /** Rental property management */
  ENABLE_RENTALS: true,

  /** Baptism, Marriage, and Burial sacraments */
  ENABLE_SACRAMENTS: true,

  /** Certificate requests and PDF generation */
  ENABLE_CERTIFICATES: true,

  /** Church history archives (photos, videos, documents) */
  ENABLE_ARCHIVES: true,

  /** Bulk Excel import/export */
  ENABLE_IMPORTS: true,

  /** Reports and analytics dashboard */
  ENABLE_REPORTS: true,

  // ============================================================
  // FUTURE FEATURES (Ready but Disabled)
  // ============================================================

  /** Mobile app API support (React Native) */
  ENABLE_MOBILE_APP: false,

  /** Telebirr payment gateway integration */
  ENABLE_TELEBIRR: false,

  /** SMS notification system */
  ENABLE_SMS_NOTIFICATIONS: false,

  /** Email broadcast system */
  ENABLE_EMAIL_BROADCAST: false,

  /** Prayer request management */
  ENABLE_PRAYER_REQUESTS: false,

  /** Events calendar and scheduling */
  ENABLE_EVENTS_CALENDAR: false,

  /** Family pastoral care tracking */
  ENABLE_FAMILY_PASTORAL_CARE: false,

  /** Two-factor authentication (2FA) */
  ENABLE_2FA: false,

  /** Real-time WebSocket notifications */
  ENABLE_WEBSOCKET_NOTIFICATIONS: false,

  /** Audit trail and activity logging */
  ENABLE_ADVANCED_AUDIT: false,

  // ============================================================
  // UI ENHANCEMENTS
  // ============================================================

  /** Premium dashboard with advanced analytics */
  ENABLE_PREMIUM_DASHBOARD: true,

  /** Dark mode support */
  ENABLE_DARK_MODE: true,

  /** Advanced analytics with charts and graphs */
  ENABLE_ADVANCED_ANALYTICS: true,

  /** Print-friendly layouts for reports */
  ENABLE_PRINT_LAYOUTS: true,

  /** PDF certificate generation */
  ENABLE_CERTIFICATE_PDF: true,

  /** Bulk operations (mass delete, mass update) */
  ENABLE_BULK_OPERATIONS: false,

  /** User profile customization */
  ENABLE_USER_PROFILE_CUSTOMIZATION: false,

  // ============================================================
  // DEVELOPMENT & TESTING
  // ============================================================

  /** Enable development tools and debugging */
  ENABLE_DEV_TOOLS: process.env.NODE_ENV === "development",

  /** Show mock data for testing (without database) */
  ENABLE_MOCK_DATA: false,

  /** Skip authentication for testing */
  BYPASS_AUTH: false,

  /** Log all database queries */
  ENABLE_QUERY_LOGGING: process.env.NODE_ENV === "development",

  /** Enable API response caching */
  ENABLE_API_CACHING: true,

  /** Enable rate limiting */
  ENABLE_RATE_LIMITING: true,

  /** Enable request compression */
  ENABLE_COMPRESSION: true,

  /** Enable CORS for all origins (development only) */
  ENABLE_DEV_CORS: process.env.NODE_ENV === "development",

  /** Enable file uploads */
  ENABLE_FILE_UPLOADS: true,

  // ============================================================
  // FEATURE-SPECIFIC TOGGLES
  // ============================================================

  /** Enable family head payment verification */
  ENABLE_FAMILY_PAYMENT_VERIFICATION: true,

  /** Enable automatic family creation for head of household */
  ENABLE_AUTO_FAMILY_CREATION: true,

  /** Enable soft delete (archive) instead of hard delete */
  ENABLE_SOFT_DELETE: true,

  /** Enable audit logging */
  ENABLE_AUDIT_LOGS: true,

  /** Enable email notifications for approval workflow */
  ENABLE_APPROVAL_EMAILS: false,

  /** Enable dashboard refresh interval */
  ENABLE_DASHBOARD_REFRESH: true,

  /** Enable export to Excel/CSV */
  ENABLE_EXPORT_TO_EXCEL: true,

  /** Enable export to PDF */
  ENABLE_EXPORT_TO_PDF: true,

  /** Enable member search by Christian name */
  ENABLE_SEARCH_BY_CHRISTIAN_NAME: true,

  /** Enable member search by family code */
  ENABLE_SEARCH_BY_FAMILY_CODE: true,

  /** Enable priest-specific views */
  ENABLE_PRIEST_VIEWS: true,

  /** Enable Sebeka Gubae (finance committee) views */
  ENABLE_SEBEKA_VIEWS: true,

  /** Enable cashier (treasury) views */
  ENABLE_CASHIER_VIEWS: true,

  /** Enable registrar (data entry) views */
  ENABLE_REGISTRAR_VIEWS: true,

  /** Enable youth coordinator views */
  ENABLE_YOUTH_COORDINATOR_VIEWS: true,

  /** Enable member portal (self-service) */
  ENABLE_MEMBER_PORTAL: true,

  /** Enable rental payment reminders */
  ENABLE_RENTAL_REMINDERS: false,

  /** Enable overdue payment tracking */
  ENABLE_OVERDUE_TRACKING: true,

  /** Enable church event announcements */
  ENABLE_EVENT_ANNOUNCEMENTS: false,

  /** Enable member anniversary notifications */
  ENABLE_ANNIVERSARY_NOTIFICATIONS: false,

  /** Enable automatic certificate numbering */
  ENABLE_AUTO_CERTIFICATE_NUMBERING: true,

  /** Enable custom certificate templates */
  ENABLE_CUSTOM_CERTIFICATE_TEMPLATES: false,

  /** Enable church statistics dashboard */
  ENABLE_CHURCH_STATS_DASHBOARD: true,

  /** Enable Sunday school management */
  ENABLE_SUNDAY_SCHOOL: false,

  /** Enable youth group management */
  ENABLE_YOUTH_GROUP: false,

  /** Enable women's group management */
  ENABLE_WOMEN_GROUP: false,

  /** Enable men's group management */
  ENABLE_MEN_GROUP: false,

  /** Enable choir management */
  ENABLE_CHOIR_MANAGEMENT: false,

  /** Enable deacon management */
  ENABLE_DEACON_MANAGEMENT: false,

  /** Enable priest scheduling */
  ENABLE_PRIEST_SCHEDULING: false,

  /** Enable church building management */
  ENABLE_CHURCH_BUILDING_MANAGEMENT: false,

  /** Enable vehicle management */
  ENABLE_VEHICLE_MANAGEMENT: false,

  /** Enable equipment management */
  ENABLE_EQUIPMENT_MANAGEMENT: false,

  /** Enable consumable inventory management */
  ENABLE_INVENTORY_MANAGEMENT: true,

  /** Enable petty cash management */
  ENABLE_PETTY_CASH: true,

  /** Enable bank reconciliation */
  ENABLE_BANK_RECONCILIATION: false,

  /** Enable multi-currency support */
  ENABLE_MULTI_CURRENCY: false,

  /** Enable internationalization (multiple languages) */
  ENABLE_I18N: true,

  /** Enable user profile pictures */
  ENABLE_USER_AVATARS: false,

  /** Enable member photos */
  ENABLE_MEMBER_PHOTOS: false,

  /** Enable document management */
  ENABLE_DOCUMENT_MANAGEMENT: false,

  /** Enable backup and restore functionality */
  ENABLE_BACKUP_RESTORE: false,

  /** Enable data export (GDPR compliance) */
  ENABLE_DATA_EXPORT: false,

  /** Enable data import from external sources */
  ENABLE_DATA_IMPORT: true,
} as const;

/**
 * Type for all feature flag keys
 */
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a specific feature is enabled
 * @param flag - Feature flag key
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag] === true;
};

/**
 * Get a list of all enabled features
 * @returns Array of enabled feature flag keys
 */
export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.keys(FEATURE_FLAGS).filter(
    (key) => FEATURE_FLAGS[key as FeatureFlag] === true,
  ) as FeatureFlag[];
};

/**
 * Get a list of all disabled features
 * @returns Array of disabled feature flag keys
 */
export const getDisabledFeatures = (): FeatureFlag[] => {
  return Object.keys(FEATURE_FLAGS).filter(
    (key) => FEATURE_FLAGS[key as FeatureFlag] === false,
  ) as FeatureFlag[];
};

/**
 * Feature group categories for easier management
 */
export const FEATURE_GROUPS = {
  /** Core application features */
  CORE: ["ENABLE_AUTH", "ENABLE_MEMBERS", "ENABLE_FINANCES"] as FeatureFlag[],

  /** Business module features */
  BUSINESS: [
    "ENABLE_RENTALS",
    "ENABLE_SACRAMENTS",
    "ENABLE_CERTIFICATES",
    "ENABLE_ARCHIVES",
  ] as FeatureFlag[],

  /** Future features (disabled by default) */
  FUTURE: [
    "ENABLE_MOBILE_APP",
    "ENABLE_TELEBIRR",
    "ENABLE_SMS_NOTIFICATIONS",
    "ENABLE_EMAIL_BROADCAST",
    "ENABLE_PRAYER_REQUESTS",
    "ENABLE_EVENTS_CALENDAR",
    "ENABLE_FAMILY_PASTORAL_CARE",
    "ENABLE_2FA",
  ] as FeatureFlag[],

  /** UI/UX enhancements */
  UI: [
    "ENABLE_PREMIUM_DASHBOARD",
    "ENABLE_DARK_MODE",
    "ENABLE_ADVANCED_ANALYTICS",
    "ENABLE_PRINT_LAYOUTS",
  ] as FeatureFlag[],

  /** Development and testing features */
  DEV: [
    "ENABLE_DEV_TOOLS",
    "ENABLE_MOCK_DATA",
    "BYPASS_AUTH",
    "ENABLE_QUERY_LOGGING",
  ] as FeatureFlag[],
} as const;

/**
 * Check if all features in a group are enabled
 * @param group - Feature group name
 * @returns boolean indicating if all features in the group are enabled
 */
export const isGroupEnabled = (group: keyof typeof FEATURE_GROUPS): boolean => {
  return FEATURE_GROUPS[group].every((flag) => FEATURE_FLAGS[flag] === true);
};

/**
 * Environment-specific feature overrides
 * Uncomment and modify for different environments
 */
// const environmentOverrides = {
//   development: {},
//   staging: {},
//   production: {
//     ENABLE_DEV_TOOLS: false,
//     ENABLE_QUERY_LOGGING: false,
//     ENABLE_DEV_CORS: false,
//     BYPASS_AUTH: false,
//   },
// };

/**
 * Get feature flags with environment-specific overrides
 */
// export const getFeatureFlags = (): typeof FEATURE_FLAGS => {
//   const env = process.env.NODE_ENV as keyof typeof environmentOverrides || 'development';
//   const overrides = environmentOverrides[env] || {};
//   return { ...FEATURE_FLAGS, ...overrides };
// };

/**
 * Simple export of feature flags with environment awareness
 */
export const getFeatureFlags = (): typeof FEATURE_FLAGS => {
  const isDev = process.env.NODE_ENV === "development";

  return {
    ...FEATURE_FLAGS,
    ENABLE_DEV_TOOLS: isDev ? true : false,
    ENABLE_QUERY_LOGGING: isDev ? true : false,
    ENABLE_DEV_CORS: isDev ? true : false,
    BYPASS_AUTH: isDev ? false : false,
  };
};

export default FEATURE_FLAGS;
