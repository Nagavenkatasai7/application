import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Make env vars available at runtime
  // These are read from the environment at build time and embedded
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_TIMEOUT: process.env.AI_TIMEOUT,
    APIFY_API_KEY: process.env.APIFY_API_KEY,
  },

  // Enable production optimizations
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: "standalone",

  // External packages that should not be bundled by Turbopack
  // This allows native Node.js modules to work properly
  serverExternalPackages: ["better-sqlite3"],

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS for production
    optimizeCss: true,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Note: 'unsafe-inline' required for Next.js hydration scripts
              // 'unsafe-eval' only needed in development for hot reload
              process.env.NODE_ENV === "development"
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'", // Required for Next.js inline styles
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.anthropic.com https://api.openai.com https://*.vercel.app",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'", // Prevent plugin exploitation
              "upgrade-insecure-requests", // Force HTTPS
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Powered by header removal for security
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Production source maps (can be disabled for better performance)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
