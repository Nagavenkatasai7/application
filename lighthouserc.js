module.exports = {
  ci: {
    collect: {
      // URLs to test - adjusted for Vercel preview deployments
      url: [
        process.env.LIGHTHOUSE_URL || 'http://localhost:3000',
        `${process.env.LIGHTHOUSE_URL || 'http://localhost:3000'}/login`,
      ],
      numberOfRuns: 3,
      settings: {
        // Chrome flags for CI environment
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        // Throttle to simulate 4G connection
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      // Performance budgets
      assertions: {
        // Core Web Vitals thresholds
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Category scores (0-1 scale)
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Resource size budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB JS
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }], // 2MB total
      },
    },
    upload: {
      // Use temporary public storage (no LHCI server required)
      target: 'temporary-public-storage',
    },
  },
};
