/**
 * Centralized feature flag management.
 * Toggle features on/off without redeploying.
 */
export const FEATURE_FLAGS = {
  // Core features (always on)
  ENABLE_AUTH: true,
  ENABLE_MEMBERS: true,
  ENABLE_FINANCES: true,
  ENABLE_RENTALS: true,
  ENABLE_SACRAMENTS: true,
  ENABLE_CERTIFICATES: true,
  ENABLE_ARCHIVES: true,

  // Future features (ready but disabled)
  ENABLE_MOBILE_APP: false,
  ENABLE_TELEBIRR: false,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_EMAIL_BROADCAST: false,
  ENABLE_PRAYER_REQUESTS: false,
  ENABLE_EVENTS_CALENDAR: false,

  // UI enhancements
  ENABLE_PREMIUM_DASHBOARD: true,
  ENABLE_DARK_MODE: true,
  ENABLE_ADVANCED_ANALYTICS: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
