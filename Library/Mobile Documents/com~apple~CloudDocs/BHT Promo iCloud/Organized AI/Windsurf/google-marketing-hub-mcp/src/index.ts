/**
 * Google Marketing Hub MCP Server
 * Remote MCP Server on Cloudflare Workers
 *
 * Endpoints:
 * - GET /sse - SSE connection for MCP
 * - POST /message - JSON-RPC message handling
 * - GET /oauth/authorize - Start OAuth flow
 * - GET /oauth/callback - OAuth callback
 * - GET /health - Health check
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ENVIRONMENT: string;
  MCP_SERVER_NAME: string;
  MCP_SERVER_VERSION: string;
}

// MCP Response types
interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// Tool definition type
interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Basic tools list (will be expanded in each phase)
const TOOLS: Tool[] = [
  // Phase 0: Health check only
  // Phases 1-5 will add tools here
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-MCP-Token",
    };

    // Handle OPTIONS (preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (url.pathname) {
        case "/health":
          return new Response(
            JSON.stringify({
              status: "ok",
              server: env.MCP_SERVER_NAME,
              version: env.MCP_SERVER_VERSION,
              environment: env.ENVIRONMENT,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );

        case "/sse":
          return handleSSE(request, env, corsHeaders);

        case "/message":
          return handleMessage(request, env, corsHeaders);

        case "/oauth/authorize":
          return handleOAuthAuthorize(request, env, corsHeaders);

        case "/oauth/callback":
          return handleOAuthCallback(request, env, corsHeaders);

        default:
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
      }
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};

// SSE endpoint for MCP connection
function handleSSE(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Response {
  // TODO: Implement in Phase 1
  return new Response("SSE endpoint - implement in Phase 1", {
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}

// Message endpoint for JSON-RPC
async function handleMessage(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await request.json() as { method: string; id: number; params?: { name?: string; arguments?: Record<string, unknown> } };
  const { method, id, params } = body;

  // Handle MCP methods
  switch (method) {
    case "initialize":
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: env.MCP_SERVER_NAME,
              version: env.MCP_SERVER_VERSION,
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    case "tools/list":
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          result: { tools: TOOLS },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    case "tools/call":
      // TODO: Implement tool routing in Phase 1+
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Tool ${params?.name} not implemented yet`,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    default:
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Method ${method} not found`,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }
}

// OAuth authorize endpoint
function handleOAuthAuthorize(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Response {
  // TODO: Implement in Phase 1
  return new Response("OAuth authorize - implement in Phase 1", {
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}

// OAuth callback endpoint
async function handleOAuthCallback(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // TODO: Implement in Phase 1
  return new Response("OAuth callback - implement in Phase 1", {
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}
