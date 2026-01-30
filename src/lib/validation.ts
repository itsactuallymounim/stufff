import { z } from "zod";

// ============================================
// OWASP Input Sanitization Utilities
// ============================================

// Remove HTML/script tags to prevent XSS
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

// Remove control characters except newlines and tabs
function removeControlChars(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// Sanitize string for safe display (prevent XSS)
export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// General sanitization for user inputs
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  let sanitized = stripHtmlTags(input);
  sanitized = removeControlChars(sanitized);
  sanitized = sanitized.trim().slice(0, maxLength);
  return sanitized;
}

// Check for dangerous patterns (SQL injection, XSS attempts)
function hasDangerousPatterns(value: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /vbscript:/i,
    /expression\s*\(/i,
  ];
  return dangerousPatterns.some((pattern) => pattern.test(value));
}

// ============================================
// Search Query Validation
// ============================================

export const searchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, { message: "Search query cannot be empty" })
    .max(500, { message: "Search query must be less than 500 characters" })
    .refine((val) => !hasDangerousPatterns(val), {
      message: "Invalid characters in query",
    }),
  action: z.enum(["search", "summarize"]),
  context: z
    .string()
    .trim()
    .max(5000, { message: "Context must be less than 5000 characters" })
    .optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Validation result types
export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationError = { success: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Validate and sanitize search input
export function validateSearchInput(
  query: string,
  action: "search" | "summarize",
  context?: string
): ValidationResult<SearchQuery> {
  const result = searchQuerySchema.safeParse({ query, action, context });

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || "Invalid input" };
  }

  return { success: true, data: result.data };
}

// ============================================
// Note Validation
// ============================================

const validNoteSizes = ["small", "medium", "large"] as const;

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be less than 200 characters" })
    .refine((val) => !hasDangerousPatterns(val), {
      message: "Title contains invalid characters",
    })
    .transform((val) => sanitizeUserInput(val, 200)),
  content: z
    .string()
    .trim()
    .max(10000, { message: "Content must be less than 10,000 characters" })
    .refine((val) => !hasDangerousPatterns(val), {
      message: "Content contains invalid characters",
    })
    .transform((val) => sanitizeUserInput(val, 10000)),
  color: z
    .string()
    .min(1, { message: "Color is required" })
    .refine(
      (val) => {
        // Only allow valid HSL color values or our predefined colors
        const hslPattern = /^hsl\(\s*\d+\s+\d+%\s+\d+%\s*\)$/;
        const hslVarPattern = /^hsl\(var\(--[\w-]+\)\)$/;
        return hslPattern.test(val) || hslVarPattern.test(val);
      },
      { message: "Invalid color format" }
    ),
  size: z.enum(validNoteSizes, {
    errorMap: () => ({ message: "Size must be small, medium, or large" }),
  }),
});

export type NoteInput = z.infer<typeof noteSchema>;

export function validateNoteInput(data: {
  title: string;
  content: string;
  color: string;
  size: string;
}): ValidationResult<NoteInput> {
  const result = noteSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || "Invalid input" };
  }

  return { success: true, data: result.data };
}

// ============================================
// URL Validation
// ============================================

export const urlSchema = z
  .string()
  .trim()
  .url({ message: "Invalid URL format" })
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        // Only allow http and https protocols
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" }
  )
  .refine((val) => !hasDangerousPatterns(val), {
    message: "URL contains invalid characters",
  });

export function validateUrl(url: string): ValidationResult<string> {
  const result = urlSchema.safeParse(url);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || "Invalid URL" };
  }

  return { success: true, data: result.data };
}

// ============================================
// Email Validation
// ============================================

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" })
  .refine((val) => !hasDangerousPatterns(val), {
    message: "Email contains invalid characters",
  });

export function validateEmail(email: string): ValidationResult<string> {
  const result = emailSchema.safeParse(email);

  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || "Invalid email" };
  }

  return { success: true, data: result.data };
}
