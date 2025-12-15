// API Configuration
export const API_CONFIG = {
  // Base URL from environment variables
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3026',
  
  // API endpoint paths
  ENDPOINT_PATHS: {
    MATCHES: '/api-supabase/matches',
    STANDINGS: '/api-supabase/standings',
  },
  
  // Next.js proxy endpoints (relative paths)
  PROXY_ENDPOINTS: {
    LAST_SCRAPE: '/api/last-scrape',
  },
  
  // Request configuration
  TIMEOUT: 10000, // 10 seconds
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Environment settings
  ENVIRONMENT: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Debug mode
  DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  
  // Determine if we should use direct URLs or proxy
  USE_PROXY: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
};

// Construct full URLs
export const API_URLS = {
  MATCHES: API_CONFIG.USE_PROXY 
    ? API_CONFIG.ENDPOINT_PATHS.MATCHES 
    : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT_PATHS.MATCHES}`,
  
  STANDINGS: API_CONFIG.USE_PROXY 
    ? API_CONFIG.ENDPOINT_PATHS.STANDINGS 
    : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT_PATHS.STANDINGS}`,
  
  LAST_SCRAPE: API_CONFIG.PROXY_ENDPOINTS.LAST_SCRAPE, // Always uses proxy
};

// Export configuration for debugging
if (API_CONFIG.DEBUG) {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    URLS: API_URLS,
    ENVIRONMENT: API_CONFIG.ENVIRONMENT,
  });
}