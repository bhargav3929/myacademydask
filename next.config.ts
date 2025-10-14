
import createNextPWA from '@ducanh2912/next-pwa';
import type {NextConfig} from 'next';

const withPWA = createNextPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: '/',
    runtimeCaching: [
      {
        urlPattern: ({url, request}) => {
          if (request.method !== 'GET') {
            return false;
          }
          const globalLocation = (
            globalThis as typeof globalThis & {location?: Location}
          ).location;
          const isSameOrigin =
            !globalLocation || url.origin === globalLocation.origin;
          return isSameOrigin && url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'mad-api-cache',
          networkTimeoutSeconds: 10,
          cacheableResponse: {statuses: [0, 200]},
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60,
          },
        },
      },
      {
        urlPattern: ({request}) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'mad-pages-cache',
          networkTimeoutSeconds: 10,
          cacheableResponse: {statuses: [0, 200]},
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({request}) => request.destination === 'image',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'mad-image-cache',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: ({request}) =>
          request.destination === 'style' || request.destination === 'script',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'mad-static-resources',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance and SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Modern image formats for better performance
    formats: ['image/avif', 'image/webp'],
    // Image optimization settings
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for better SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default withPWA(nextConfig);
