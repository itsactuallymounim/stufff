import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateSearchInput } from "@/lib/validation";
import { toast } from "sonner";

interface AISearchResult {
  result: string;
  action: "search" | "summarize";
}

interface UseAISearchReturn {
  search: (query: string, context?: string) => Promise<void>;
  summarize: (query: string, context: string) => Promise<void>;
  result: string | null;
  isLoading: boolean;
  error: string | null;
  clearResult: () => void;
}

export function useAISearch(): UseAISearchReturn {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(
    async (query: string, action: "search" | "summarize", context?: string) => {
      // Client-side validation
      const validation = validateSearchInput(query, action, context);
      if (validation.success === false) {
        setError(validation.error);
        toast.error(validation.error);
        return;
      }

      const validatedData = validation.data;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke<AISearchResult>(
          "ai-search",
          {
            body: {
              query: validatedData.query,
              action: validatedData.action,
              context: validatedData.context,
            },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || "Failed to process request");
        }

        if (data?.result) {
          setResult(data.result);
        } else {
          throw new Error("No response received");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        
        // Handle rate limiting
        if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
          setError("Too many requests. Please wait a moment and try again.");
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else {
          setError(message);
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const search = useCallback(
    (query: string, context?: string) => executeQuery(query, "search", context),
    [executeQuery]
  );

  const summarize = useCallback(
    (query: string, context: string) => executeQuery(query, "summarize", context),
    [executeQuery]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    search,
    summarize,
    result,
    isLoading,
    error,
    clearResult,
  };
}
