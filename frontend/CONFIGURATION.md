# Environment Configuration Guide

## Overview
This document explains the standardized configuration structure for the Volleyball Cysoing frontend application.

## Environment Variables

### Required Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3026
NEXT_PUBLIC_API_ENDPOINT=/api-supabase

# Environment
NEXT_PUBLIC_APP_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Environment Files
- `.env.local` - Local development (not committed to git)
- `.env.example` - Template for environment variables
- `.env.production` - Production environment (if needed)

## Configuration Structure

### Files Created
1. **Environment Variables**
   - `.env.local` - Development environment variables
   - `.env.example` - Template for copy/paste

2. **Configuration Files**
   - `src/config/api.js` - API endpoints and configuration
   - `src/config/constants.js` - Application constants and environment settings

3. **API Client**
   - `src/lib/api.js` - Centralized API client with error handling

4. **Updated Files**
   - `next.config.js` - Environment-aware Next.js configuration
   - All components using API calls updated to use centralized client

## Usage Examples

### Using the API Client
```javascript
import apiClient from '../lib/api';

// Get matches
const matches = await apiClient.getMatches();

// Get standings
const standings = await apiClient.getStandings();

// Get last scrape info
const lastScrape = await apiClient.getLastScrape();
```

### Using Configuration Constants
```javascript
import { currentConfig, debug } from '../config/constants';

// Debug logging
debug.log('Component mounted', { data });

// Check environment
if (currentConfig.ENVIRONMENT === 'production') {
  // Production-specific code
}
```

## Benefits of Standardization

1. **Single Source of Truth**: All API endpoints managed in one place
2. **Environment Management**: Easy switching between development and production
3. **Error Handling**: Centralized error handling and timeout management
4. **Debug Support**: Built-in debugging capabilities
5. **Maintainability**: Easy to update API endpoints across all components
6. **Type Safety**: Better error handling and validation

## Migration Summary

### Before (Hardcoded URLs)
```javascript
// Multiple files with hardcoded URLs
const response = await fetch('http://localhost:3026/api-supabase/matches');
```

### After (Standardized)
```javascript
// Single import, centralized configuration
import apiClient from '../lib/api';
const data = await apiClient.getMatches();
```

### Files Updated
- ✅ `src/components/RecentMatches.js`
- ✅ `src/pages/matches.js`
- ✅ `src/pages/standings.js`
- ✅ `src/components/StandingsTable.js`
- ✅ `src/components/Statistics.js`
- ✅ `src/components/LastScrapeInfo.js`

### Files Created
- ✅ `.env.local`
- ✅ `.env.example`
- ✅ `src/config/api.js`
- ✅ `src/config/constants.js`
- ✅ `src/lib/api.js`

### Files Modified
- ✅ `next.config.js` - Added environment support

## Next Steps

1. **Test the application** to ensure all API calls work correctly
2. **Create production environment variables** when deploying
3. **Add any additional endpoints** to the API configuration as needed
4. **Consider adding TypeScript** for better type safety
5. **Set up monitoring** for production API calls