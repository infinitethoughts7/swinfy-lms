import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
async redirects() {
  return [
    {
      source: '/dashboard/knowledge_partner_admin',
      destination: '/dashboard/kp',
      permanent: true, // Changed to permanent
    },
    {
      source: '/dashboard/knowledge_partner_admin/:path*',
      destination: '/dashboard/kp/:path*',  
      permanent: true, // Changed to permanent
    },
  ];
},
  // Ensure proper handling of dynamic routes in production
  trailingSlash: false,
  // Enable static optimization
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'urchin-app-3xb5n.ondigitalocean.app',
        pathname: '/media/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Only optimize remote images, not local static assets
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Ensure static assets are properly handled
  trailingSlash: false,
};

export default nextConfig;