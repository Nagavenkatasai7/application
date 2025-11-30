/**
 * Calculate delay with exponential backoff and jitter
 *
 * Formula: min(maxDelay, initialDelay * (multiplier ^ attempt) * (1 + random * jitter))
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param initialDelayMs - Initial delay in milliseconds
 * @param maxDelayMs - Maximum delay cap in milliseconds
 * @param backoffMultiplier - Exponential backoff multiplier (e.g., 2 for doubling)
 * @param jitterFactor - Jitter factor 0-1 (e.g., 0.1 for 10% randomization)
 * @returns Delay in milliseconds (rounded to nearest integer)
 */
export function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  jitterFactor: number
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);

  // Cap at maximum delay
  const cappedDelay = Math.min(maxDelayMs, exponentialDelay);

  // Add jitter (0 to jitterFactor of the delay)
  // This helps prevent thundering herd problems when many requests retry simultaneously
  const jitter = cappedDelay * jitterFactor * Math.random();

  return Math.round(cappedDelay + jitter);
}

/**
 * Create a delay promise that can be cancelled via AbortSignal
 *
 * @param ms - Delay in milliseconds
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise that resolves after the delay or rejects if aborted
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already aborted, reject immediately
    if (signal?.aborted) {
      reject(new Error("Request cancelled"));
      return;
    }

    const timeoutId = setTimeout(resolve, ms);

    // Set up abort listener if signal provided
    if (signal) {
      const abortHandler = () => {
        clearTimeout(timeoutId);
        reject(new Error("Request cancelled"));
      };

      signal.addEventListener("abort", abortHandler, { once: true });

      // Clean up abort listener when timeout completes
      const originalResolve = resolve;
      resolve = () => {
        signal.removeEventListener("abort", abortHandler);
        originalResolve();
      };
    }
  });
}
