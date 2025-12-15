/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3026',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3026';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/api-supabase/:path*',
        destination: `${apiBaseUrl}/api-supabase/:path*`,
      },
    ];
  },
  // Environment-specific settings
  env: {
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  // Build optimizations
  compress: true,
  poweredByHeader: false,
  // Development vs Production settings
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

module.exports = nextConfig;