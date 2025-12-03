import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DEFAULT_RETRY_CONFIG,
  retryConfigSchema,
  loadRetryConfig,
  getRetryConfig,
  resetRetryConfigCache,
} from "./retry-config";

describe("DEFAULT_RETRY_CONFIG", () => {
  it("should have correct default values", () => {
    expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(2);
    expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(1000);
    expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(10000);
    expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
    expect(DEFAULT_RETRY_CONFIG.jitterFactor).toBe(0.1);
    expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toEqual([429, 500, 502, 503, 529]);
    expect(DEFAULT_RETRY_CONFIG.respectRetryAfterHeader).toBe(true);
  });
});

describe("retryConfigSchema", () => {
  it("should accept valid config", () => {
    const config = {
      maxRetries: 3,
      initialDelayMs: 2000,
      maxDelayMs: 15000,
      backoffMultiplier: 1.5,
      jitterFactor: 0.2,
      retryableStatusCodes: [429, 500],
      respectRetryAfterHeader: false,
    };
    const result = retryConfigSchema.parse(config);
    expect(result).toEqual(config);
  });

  it("should apply defaults for missing fields", () => {
    const result = retryConfigSchema.parse({});
    expect(result.maxRetries).toBe(2);
    expect(result.initialDelayMs).toBe(1000);
    expect(result.maxDelayMs).toBe(10000);
    expect(result.backoffMultiplier).toBe(2);
    expect(result.jitterFactor).toBe(0.1);
    expect(result.retryableStatusCodes).toEqual([429, 500, 502, 503, 529]);
    expect(result.respectRetryAfterHeader).toBe(true);
  });

  it("should reject maxRetries below 0", () => {
    expect(() => retryConfigSchema.parse({ maxRetries: -1 })).toThrow();
  });

  it("should reject maxRetries above 10", () => {
    expect(() => retryConfigSchema.parse({ maxRetries: 11 })).toThrow();
  });

  it("should reject negative initialDelayMs", () => {
    expect(() => retryConfigSchema.parse({ initialDelayMs: -100 })).toThrow();
  });

  it("should reject negative maxDelayMs", () => {
    expect(() => retryConfigSchema.parse({ maxDelayMs: -1000 })).toThrow();
  });

  it("should reject backoffMultiplier below 1", () => {
    expect(() => retryConfigSchema.parse({ backoffMultiplier: 0.5 })).toThrow();
  });

  it("should reject backoffMultiplier above 4", () => {
    expect(() => retryConfigSchema.parse({ backoffMultiplier: 5 })).toThrow();
  });

  it("should reject jitterFactor below 0", () => {
    expect(() => retryConfigSchema.parse({ jitterFactor: -0.1 })).toThrow();
  });

  it("should reject jitterFactor above 1", () => {
    expect(() => retryConfigSchema.parse({ jitterFactor: 1.5 })).toThrow();
  });
});

describe("loadRetryConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load default config when no env vars set", () => {
    const config = loadRetryConfig();
    expect(config.maxRetries).toBe(2);
    expect(config.initialDelayMs).toBe(1000);
    expect(config.maxDelayMs).toBe(10000);
    expect(config.backoffMultiplier).toBe(2);
    expect(config.jitterFactor).toBe(0.1);
  });

  it("should load config from environment variables", () => {
    process.env.AI_RETRY_MAX_ATTEMPTS = "5";
    process.env.AI_RETRY_INITIAL_DELAY_MS = "500";
    process.env.AI_RETRY_MAX_DELAY_MS = "20000";
    process.env.AI_RETRY_BACKOFF_MULTIPLIER = "1.5";
    process.env.AI_RETRY_JITTER_FACTOR = "0.3";

    const config = loadRetryConfig();
    expect(config.maxRetries).toBe(5);
    expect(config.initialDelayMs).toBe(500);
    expect(config.maxDelayMs).toBe(20000);
    expect(config.backoffMultiplier).toBe(1.5);
    expect(config.jitterFactor).toBe(0.3);
  });

  it("should parse custom status codes from env", () => {
    process.env.AI_RETRY_STATUS_CODES = "429,503,529";

    const config = loadRetryConfig();
    expect(config.retryableStatusCodes).toEqual([429, 503, 529]);
  });

  it("should parse status codes with spaces", () => {
    process.env.AI_RETRY_STATUS_CODES = "429, 503, 529";

    const config = loadRetryConfig();
    expect(config.retryableStatusCodes).toEqual([429, 503, 529]);
  });

  it("should respect retry-after header by default", () => {
    const config = loadRetryConfig();
    expect(config.respectRetryAfterHeader).toBe(true);
  });

  it("should disable retry-after header when env set to false", () => {
    process.env.AI_RETRY_RESPECT_RETRY_AFTER = "false";

    const config = loadRetryConfig();
    expect(config.respectRetryAfterHeader).toBe(false);
  });

  it("should keep retry-after header enabled for non-false values", () => {
    process.env.AI_RETRY_RESPECT_RETRY_AFTER = "true";

    const config = loadRetryConfig();
    expect(config.respectRetryAfterHeader).toBe(true);
  });
});

describe("getRetryConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    resetRetryConfigCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetRetryConfigCache();
  });

  it("should return config", () => {
    const config = getRetryConfig();
    expect(config.maxRetries).toBe(2);
  });

  it("should cache config on repeated calls", () => {
    const config1 = getRetryConfig();

    // Change env var - should not affect cached config
    process.env.AI_RETRY_MAX_ATTEMPTS = "10";

    const config2 = getRetryConfig();

    // Should return same cached config
    expect(config2).toBe(config1);
    expect(config2.maxRetries).toBe(2); // Original value, not 10
  });
});

describe("resetRetryConfigCache", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetRetryConfigCache();
  });

  it("should reset cache and reload config", () => {
    // Load initial config
    const config1 = getRetryConfig();
    expect(config1.maxRetries).toBe(2);

    // Change env var
    process.env.AI_RETRY_MAX_ATTEMPTS = "7";

    // Reset cache and reload
    resetRetryConfigCache();
    const config2 = getRetryConfig();

    // Should have new value
    expect(config2.maxRetries).toBe(7);
  });

  it("should allow multiple cache resets", () => {
    getRetryConfig();
    resetRetryConfigCache();
    resetRetryConfigCache();
    const config = getRetryConfig();
    expect(config.maxRetries).toBe(2);
  });
});
