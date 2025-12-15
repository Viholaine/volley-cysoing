// Application constants and environment-specific settings

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
};

export const APP_CONFIG = {
  // Environment detection
  ENVIRONMENT: process.env.NEXT_PUBLIC_APP_ENV || ENVIRONMENTS.DEVELOPMENT,
  
  // Application metadata
  APP_NAME: 'Volleyball Cysoing',
  APP_DESCRIPTION: 'Visualisation des scores et classements du volley-ball Cysoing',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    ANALYTICS: process.env.NEXT_PUBLIC_APP_ENV === ENVIRONMENTS.PRODUCTION,
    ERROR_REPORTING: process.env.NEXT_PUBLIC_APP_ENV === ENVIRONMENTS.PRODUCTION,
  },
  
  // UI Configuration
  UI: {
    REFRESH_INTERVAL: 30000, // 30 seconds for auto-refresh
    TOAST_DURATION: 5000, // 5 seconds for toast notifications
    LOADING_TIMEOUT: 10000, // 10 seconds before showing timeout error
  },
  
  // Cache settings
  CACHE: {
    MATCHES_TTL: 5 * 60 * 1000, // 5 minutes
    STANDINGS_TTL: 10 * 60 * 1000, // 10 minutes
    LAST_SCRAPE_TTL: 30 * 1000, // 30 seconds
  },
};

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    LOG_LEVEL: 'debug',
    ENABLE_HOT_RELOAD: true,
    API_TIMEOUT: 10000,
  },
  [ENVIRONMENTS.PRODUCTION]: {
    LOG_LEVEL: 'error',
    ENABLE_HOT_RELOAD: false,
    API_TIMEOUT: 8000,
  },
  [ENVIRONMENTS.STAGING]: {
    LOG_LEVEL: 'warn',
    ENABLE_HOT_RELOAD: false,
    API_TIMEOUT: 8000,
  },
};

// Get current environment config
export const getCurrentEnvironmentConfig = () => {
  return ENVIRONMENT_CONFIG[APP_CONFIG.ENVIRONMENT] || ENVIRONMENT_CONFIG[ENVIRONMENTS.DEVELOPMENT];
};

// Debug utilities
export const debug = {
  log: (...args) => {
    if (APP_CONFIG.FEATURES.DEBUG) {
      console.log(`[${APP_CONFIG.APP_NAME}]`, ...args);
    }
  },
  error: (...args) => {
    console.error(`[${APP_CONFIG.APP_NAME}]`, ...args);
  },
  warn: (...args) => {
    if (APP_CONFIG.FEATURES.DEBUG || APP_CONFIG.ENVIRONMENT !== ENVIRONMENTS.PRODUCTION) {
      console.warn(`[${APP_CONFIG.APP_NAME}]`, ...args);
    }
  },
};

// Export current configuration
export const currentConfig = {
  ...APP_CONFIG,
  ...getCurrentEnvironmentConfig(),
};