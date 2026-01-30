import { z } from "zod";

// Search query validation schema
export const searchQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, { message: "Search query cannot be empty" })
    .max(500, { message: "Search query must be less than 500 characters" })
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      { message: "Invalid characters in query" }
    ),
  action: z.enum(["search", "summarize"]),
  context: z
    .string()
    .trim()
    .max(5000, { message: "Context must be less than 5000 characters" })
    .optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Sanitize string for display (prevent XSS)
export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Validation result types
export type ValidationSuccess = { success: true; data: SearchQuery };
export type ValidationError = { success: false; error: string };
export type ValidationResult = ValidationSuccess | ValidationError;

// Validate and sanitize search input
export function validateSearchInput(
  query: string,
  action: "search" | "summarize",
  context?: string
): ValidationResult {
  const result = searchQuerySchema.safeParse({ query, action, context });
  
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || "Invalid input" };
  }
  
  return { success: true, data: result.data };
}
