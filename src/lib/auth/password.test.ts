/**
 * Password Utilities Tests
 *
 * Tests for password hashing, verification, and token generation.
 */

import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateVerificationToken,
  generateSecurityCode,
  getTokenExpiration,
  getSecurityCodeExpiration,
  isTokenExpired,
} from "./password";

describe("password utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const result = await hashPassword("testPassword123");
      expect(result).toBeTruthy();
      expect(result.startsWith("$2")).toBe(true);
    });

    it("should return a bcrypt hash format", async () => {
      const result = await hashPassword("anyPassword");
      expect(result).toMatch(/^\$2[aby]\$\d{2}\$/);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hash = await hashPassword("testPassword");
      const result = await verifyPassword("testPassword", hash);
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await hashPassword("correctPassword");
      const result = await verifyPassword("wrongPassword", hash);
      expect(result).toBe(false);
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate a token without hyphens", () => {
      const token = generateVerificationToken();
      expect(token).not.toContain("-");
    });

    it("should generate a unique token each time", () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate a token of expected length (64 chars)", () => {
      const token = generateVerificationToken();
      expect(token.length).toBe(64);
    });
  });

  describe("generateSecurityCode", () => {
    it("should generate a 6-digit code", () => {
      const code = generateSecurityCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should generate codes in valid range (100000-999999)", () => {
      for (let i = 0; i < 10; i++) {
        const code = generateSecurityCode();
        const num = parseInt(code, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe("getTokenExpiration", () => {
    it("should return a date in the future", () => {
      const expiration = getTokenExpiration(1);
      expect(expiration.getTime()).toBeGreaterThan(Date.now());
    });

    it("should default to 1 hour expiration", () => {
      const expiration = getTokenExpiration();
      const expectedTime = new Date();
      expectedTime.setHours(expectedTime.getHours() + 1);

      // Allow 1 second tolerance
      expect(Math.abs(expiration.getTime() - expectedTime.getTime())).toBeLessThan(1000);
    });

    it("should respect custom hours parameter", () => {
      const expiration = getTokenExpiration(24);
      const expectedTime = new Date();
      expectedTime.setHours(expectedTime.getHours() + 24);

      // Allow 1 second tolerance
      expect(Math.abs(expiration.getTime() - expectedTime.getTime())).toBeLessThan(1000);
    });
  });

  describe("getSecurityCodeExpiration", () => {
    it("should return a date 10 minutes in the future", () => {
      const expiration = getSecurityCodeExpiration();
      const expectedTime = new Date();
      expectedTime.setMinutes(expectedTime.getMinutes() + 10);

      // Allow 1 second tolerance
      expect(Math.abs(expiration.getTime() - expectedTime.getTime())).toBeLessThan(1000);
    });
  });

  describe("isTokenExpired", () => {
    it("should return true for null expiration", () => {
      expect(isTokenExpired(null)).toBe(true);
    });

    it("should return true for past dates", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      expect(isTokenExpired(futureDate)).toBe(false);
    });
  });
});
