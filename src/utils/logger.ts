/**
 * Recursively redacts sensitive keys from an object or array to prevent credential/PII leakage in logs.
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  if (typeof data === "object") {
    // If it's a standard Error object, extract message and name safely
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack ? "[STACK TRACE REDACTED]" : undefined,
      };
    }

    const obj = data as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "confirmpassword",
      "token",
      "secret",
      "key",
      "cvc",
      "cvv",
      "stripe_customer_id"
    ];

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (value instanceof Error) {
        sanitized[key] = {
          name: value.name,
          message: value.message,
          stack: value.stack ? "[STACK TRACE REDACTED]" : undefined,
        };
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeLogData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Standardized logging utility that ensures any metadata is sanitized before console output.
 */
export function safeLog(message: string, meta?: unknown): void {
  if (meta !== undefined) {
    console.log(message, JSON.stringify(sanitizeLogData(meta), null, 2));
  } else {
    console.log(message);
  }
}

/**
 * Standardized error logging utility that ensures error details are sanitized before console output.
 */
export function safeError(message: string, error?: unknown): void {
  if (error !== undefined) {
    console.error(message, JSON.stringify(sanitizeLogData(error), null, 2));
  } else {
    console.error(message);
  }
}
