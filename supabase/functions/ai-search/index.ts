import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(clientIP: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// Input validation and sanitization
function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }
  
  // Remove any HTML/script tags
  let sanitized = input.replace(/<[^>]*>/g, "");
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, 2000);
  
  if (sanitized.length === 0) {
    throw new Error("Input cannot be empty");
  }
  
  return sanitized;
}

function validateAction(action: unknown): "search" | "summarize" {
  if (action !== "search" && action !== "summarize") {
    throw new Error("Action must be 'search' or 'summarize'");
  }
  return action;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          retryAfter: rateCheck.retryAfter 
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter),
          },
        }
      );
    }

    // Get API key from environment (never hardcoded)
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { query, action, context } = body as Record<string, unknown>;

    // Validate and sanitize inputs
    let sanitizedQuery: string;
    let validatedAction: "search" | "summarize";
    let sanitizedContext: string | undefined;

    try {
      sanitizedQuery = sanitizeInput(query);
      validatedAction = validateAction(action);
      if (context !== undefined) {
        sanitizedContext = sanitizeInput(context);
      }
    } catch (validationError) {
      return new Response(
        JSON.stringify({ 
          error: validationError instanceof Error ? validationError.message : "Validation failed" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build system prompt based on action
    const systemPrompt = validatedAction === "search"
      ? `You are a helpful search assistant for Stufff, a notes app. Help users find and understand information based on their queries. Be concise, accurate, and helpful. If asked about notes or content, provide relevant insights and suggestions.`
      : `You are a summarization assistant for Stufff, a notes app. Create clear, concise summaries of the provided content. Focus on key points and main ideas. Keep summaries brief but comprehensive.`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
    ];

    if (validatedAction === "summarize" && sanitizedContext) {
      messages.push({ 
        role: "user", 
        content: `Please summarize the following content:\n\n${sanitizedContext}\n\nUser's specific request: ${sanitizedQuery}` 
      });
    } else {
      messages.push({ role: "user", content: sanitizedQuery });
    }

    console.log(`Processing ${validatedAction} request from ${clientIP}`);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        result: content,
        action: validatedAction,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
