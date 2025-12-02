import bcrypt from "bcryptjs";

// bcrypt cost factor 12 provides good security with ~50-100ms hashing time
const BCRYPT_COST = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plaintext password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Verify a password against a hash
 * @param password - Plaintext password to verify
 * @param hashedPassword - bcrypt hashed password
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a cryptographically secure 6-digit security code for password reset
 * Uses crypto.getRandomValues() instead of Math.random() for security
 * @returns 6-digit string code
 */
export function generateSecurityCode(): string {
  // Generate a cryptographically secure random 6-digit code (100000-999999)
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Use modulo to get a number in range 0-899999, then add 100000
  const code = 100000 + (array[0] % 900000);
  return code.toString();
}

/**
 * Generate a secure verification/reset token
 * Uses crypto.randomUUID() for cryptographically secure randomness
 * @returns 64-character hex token
 */
export function generateVerificationToken(): string {
  // Combine two UUIDs and remove hyphens for a 64-char token
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
}

/**
 * Get token expiration date (default 1 hour from now)
 * @param hours - Number of hours until expiration (default 1)
 * @returns Expiration date
 */
export function getTokenExpiration(hours: number = 1): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

/**
 * Get security code expiration (10 minutes from now)
 * Shorter expiration for security codes as they're easier to brute force
 * @returns Expiration date
 */
export function getSecurityCodeExpiration(): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 10);
  return expiration;
}

/**
 * Check if a token/code has expired
 * @param expirationDate - The expiration date to check
 * @returns True if expired
 */
export function isTokenExpired(expirationDate: Date | null): boolean {
  if (!expirationDate) return true;
  return new Date() > expirationDate;
}
