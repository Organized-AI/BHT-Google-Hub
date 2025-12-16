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

import { TokenManager, TokenError } from './lib/token-manager';
import { GoogleApiClient, ApiError, createGoogleApiClient } from './lib/google-api-client';

// GCP Tools
import {
  GCP_TOOLS,
  handleGcpListProjects,
  handleGcpGetProject,
  handleGcpListServiceAccounts,
  handleGcpGetServiceAccount,
  handleGcpListEnabledApis,
  handleGcpEnableApi,
  handleGcpGetBillingInfo,
  handleGcpListBillingAccounts,
} from './tools/gcp';

// GA4 Tools
import {
  GA4_TOOLS,
  handleGa4ListProperties,
  handleGa4GetProperty,
  handleGa4ListDataStreams,
  handleGa4GetDataStream,
  handleGa4RunReport,
  handleGa4RunRealtimeReport,
  handleGa4GetMetadata,
  handleGa4ListAudiences,
  handleGa4GetAudience,
  handleGa4ListConversionEvents,
  handleGa4GetConversionEvent,
} from './tools/ga4';

// GTM Tools
import {
  GTM_TOOLS,
  handleGtmListAccounts,
  handleGtmGetAccount,
  handleGtmListContainers,
  handleGtmGetContainer,
  handleGtmListWorkspaces,
  handleGtmGetWorkspace,
  handleGtmListTags,
  handleGtmGetTag,
  handleGtmCreateTag,
  handleGtmUpdateTag,
  handleGtmListTriggers,
  handleGtmGetTrigger,
  handleGtmCreateTrigger,
  handleGtmListVariables,
  handleGtmGetVariable,
  handleGtmCreateVariable,
  handleGtmListVersions,
  handleGtmCreateVersion,
  handleGtmPublishVersion,
} from './tools/gtm';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ENVIRONMENT: string;
  MCP_SERVER_NAME: string;
  MCP_SERVER_VERSION: string;
}

// Google OAuth scopes required for all APIs
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/tagmanager.readonly',
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
  'https://www.googleapis.com/auth/tagmanager.publish',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics.edit',
  'https://www.googleapis.com/auth/cloud-platform.read-only',
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/cloud-billing.readonly',
].join(' ');

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

// Auth tools (Phase 1)
const AUTH_TOOLS: Tool[] = [
  {
    name: 'ghub_auth_init',
    description: 'Initialize OAuth flow and get authorization URL. Returns a URL the user must visit to authorize access.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'Optional user identifier. If not provided, a new ghub_xxx token ID will be generated.',
        },
      },
      required: [],
    },
  },
  {
    name: 'ghub_auth_status',
    description: 'Check authentication status for a user. Returns token info if authenticated.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The user ID (ghub_xxx token) to check status for.',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'ghub_auth_revoke',
    description: 'Revoke authentication for a user. Removes all stored tokens.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The user ID (ghub_xxx token) to revoke.',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'ghub_auth_list',
    description: 'List all authenticated users/tokens (admin only).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// All tools (will be expanded in each phase)
const TOOLS: Tool[] = [...AUTH_TOOLS, ...GCP_TOOLS, ...GA4_TOOLS, ...GTM_TOOLS];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-MCP-Token, Authorization',
    };

    // Handle OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize TokenManager
    const tokenManager = new TokenManager({
      DB: env.DB,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    });

    try {
      switch (url.pathname) {
        case '/health':
          return new Response(
            JSON.stringify({
              status: 'ok',
              server: env.MCP_SERVER_NAME,
              version: env.MCP_SERVER_VERSION,
              environment: env.ENVIRONMENT,
              tools_count: TOOLS.length,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );

        case '/sse':
          return handleSSE(request, env, tokenManager, corsHeaders);

        case '/message':
          return handleMessage(request, env, tokenManager, corsHeaders);

        case '/oauth/authorize':
          return handleOAuthAuthorize(request, env, corsHeaders);

        case '/oauth/callback':
          return handleOAuthCallback(request, env, tokenManager, corsHeaders);

        default:
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

// SSE endpoint for MCP connection
function handleSSE(
  request: Request,
  env: Env,
  tokenManager: TokenManager,
  corsHeaders: Record<string, string>
): Response {
  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Generate unique session ID
  const sessionId = crypto.randomUUID();

  // Send initial connection message
  const sendEvent = async (event: string, data: unknown) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Start SSE session
  (async () => {
    try {
      // Send endpoint info for client to use for messages
      await sendEvent('endpoint', {
        url: `${new URL(request.url).origin}/message`,
        sessionId,
      });

      // Keep connection alive with periodic pings
      const pingInterval = setInterval(async () => {
        try {
          await sendEvent('ping', { timestamp: Date.now() });
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Store session in KV for message routing
      await env.KV.put(
        `session:${sessionId}`,
        JSON.stringify({ created: Date.now() }),
        { expirationTtl: 3600 }
      );
    } catch (error) {
      console.error('SSE error:', error);
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Message endpoint for JSON-RPC
async function handleMessage(
  request: Request,
  env: Env,
  tokenManager: TokenManager,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = (await request.json()) as {
    method: string;
    id: number;
    params?: { name?: string; arguments?: Record<string, unknown> };
  };
  const { method, id, params } = body;

  // Handle MCP methods
  switch (method) {
    case 'initialize':
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: env.MCP_SERVER_NAME,
              version: env.MCP_SERVER_VERSION,
            },
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'tools/list':
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'tools/call':
      return handleToolCall(request, env, tokenManager, id, params, corsHeaders);

    default:
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method ${method} not found`,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

// Handle tool calls
async function handleToolCall(
  request: Request,
  env: Env,
  tokenManager: TokenManager,
  id: number,
  params: { name?: string; arguments?: Record<string, unknown> } | undefined,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const toolName = params?.name;
  const args = params?.arguments || {};

  if (!toolName) {
    return jsonRpcError(id, -32602, 'Missing tool name', corsHeaders);
  }

  try {
    let result: MCPResponse;

    // Route to appropriate tool handler
    switch (toolName) {
      // Auth tools
      case 'ghub_auth_init':
        result = await handleAuthInit(request, env, args);
        break;
      case 'ghub_auth_status':
        result = await handleAuthStatus(tokenManager, args);
        break;
      case 'ghub_auth_revoke':
        result = await handleAuthRevoke(tokenManager, args);
        break;
      case 'ghub_auth_list':
        result = await handleAuthList(tokenManager);
        break;

      // GCP tools - require user_id for authentication
      case 'gcp_list_projects':
      case 'gcp_get_project':
      case 'gcp_list_service_accounts':
      case 'gcp_get_service_account':
      case 'gcp_list_enabled_apis':
      case 'gcp_enable_api':
      case 'gcp_get_billing_info':
      case 'gcp_list_billing_accounts': {
        const userId = args.user_id as string;
        if (!userId) {
          return jsonRpcError(id, -32602, 'user_id is required for GCP tools', corsHeaders);
        }
        const client = createGoogleApiClient(tokenManager, userId);

        switch (toolName) {
          case 'gcp_list_projects':
            result = await handleGcpListProjects(client, args);
            break;
          case 'gcp_get_project':
            result = await handleGcpGetProject(client, args);
            break;
          case 'gcp_list_service_accounts':
            result = await handleGcpListServiceAccounts(client, args);
            break;
          case 'gcp_get_service_account':
            result = await handleGcpGetServiceAccount(client, args);
            break;
          case 'gcp_list_enabled_apis':
            result = await handleGcpListEnabledApis(client, args);
            break;
          case 'gcp_enable_api':
            result = await handleGcpEnableApi(client, args);
            break;
          case 'gcp_get_billing_info':
            result = await handleGcpGetBillingInfo(client, args);
            break;
          case 'gcp_list_billing_accounts':
            result = await handleGcpListBillingAccounts(client, args);
            break;
        }
        break;
      }

      // GA4 tools - require user_id for authentication
      case 'ga4_list_properties':
      case 'ga4_get_property':
      case 'ga4_list_data_streams':
      case 'ga4_get_data_stream':
      case 'ga4_run_report':
      case 'ga4_run_realtime_report':
      case 'ga4_get_metadata':
      case 'ga4_list_audiences':
      case 'ga4_get_audience':
      case 'ga4_list_conversion_events':
      case 'ga4_get_conversion_event': {
        const userId = args.user_id as string;
        if (!userId) {
          return jsonRpcError(id, -32602, 'user_id is required for GA4 tools', corsHeaders);
        }
        const client = createGoogleApiClient(tokenManager, userId);

        switch (toolName) {
          case 'ga4_list_properties':
            result = await handleGa4ListProperties(client, args);
            break;
          case 'ga4_get_property':
            result = await handleGa4GetProperty(client, args);
            break;
          case 'ga4_list_data_streams':
            result = await handleGa4ListDataStreams(client, args);
            break;
          case 'ga4_get_data_stream':
            result = await handleGa4GetDataStream(client, args);
            break;
          case 'ga4_run_report':
            result = await handleGa4RunReport(client, args);
            break;
          case 'ga4_run_realtime_report':
            result = await handleGa4RunRealtimeReport(client, args);
            break;
          case 'ga4_get_metadata':
            result = await handleGa4GetMetadata(client, args);
            break;
          case 'ga4_list_audiences':
            result = await handleGa4ListAudiences(client, args);
            break;
          case 'ga4_get_audience':
            result = await handleGa4GetAudience(client, args);
            break;
          case 'ga4_list_conversion_events':
            result = await handleGa4ListConversionEvents(client, args);
            break;
          case 'ga4_get_conversion_event':
            result = await handleGa4GetConversionEvent(client, args);
            break;
        }
        break;
      }

      // GTM tools - require user_id for authentication
      case 'gtm_list_accounts':
      case 'gtm_get_account':
      case 'gtm_list_containers':
      case 'gtm_get_container':
      case 'gtm_list_workspaces':
      case 'gtm_get_workspace':
      case 'gtm_list_tags':
      case 'gtm_get_tag':
      case 'gtm_create_tag':
      case 'gtm_update_tag':
      case 'gtm_list_triggers':
      case 'gtm_get_trigger':
      case 'gtm_create_trigger':
      case 'gtm_list_variables':
      case 'gtm_get_variable':
      case 'gtm_create_variable':
      case 'gtm_list_versions':
      case 'gtm_create_version':
      case 'gtm_publish_version': {
        const userId = args.user_id as string;
        if (!userId) {
          return jsonRpcError(id, -32602, 'user_id is required for GTM tools', corsHeaders);
        }
        const client = createGoogleApiClient(tokenManager, userId);

        switch (toolName) {
          case 'gtm_list_accounts':
            result = await handleGtmListAccounts(client, args);
            break;
          case 'gtm_get_account':
            result = await handleGtmGetAccount(client, args);
            break;
          case 'gtm_list_containers':
            result = await handleGtmListContainers(client, args);
            break;
          case 'gtm_get_container':
            result = await handleGtmGetContainer(client, args);
            break;
          case 'gtm_list_workspaces':
            result = await handleGtmListWorkspaces(client, args);
            break;
          case 'gtm_get_workspace':
            result = await handleGtmGetWorkspace(client, args);
            break;
          case 'gtm_list_tags':
            result = await handleGtmListTags(client, args);
            break;
          case 'gtm_get_tag':
            result = await handleGtmGetTag(client, args);
            break;
          case 'gtm_create_tag':
            result = await handleGtmCreateTag(client, args);
            break;
          case 'gtm_update_tag':
            result = await handleGtmUpdateTag(client, args);
            break;
          case 'gtm_list_triggers':
            result = await handleGtmListTriggers(client, args);
            break;
          case 'gtm_get_trigger':
            result = await handleGtmGetTrigger(client, args);
            break;
          case 'gtm_create_trigger':
            result = await handleGtmCreateTrigger(client, args);
            break;
          case 'gtm_list_variables':
            result = await handleGtmListVariables(client, args);
            break;
          case 'gtm_get_variable':
            result = await handleGtmGetVariable(client, args);
            break;
          case 'gtm_create_variable':
            result = await handleGtmCreateVariable(client, args);
            break;
          case 'gtm_list_versions':
            result = await handleGtmListVersions(client, args);
            break;
          case 'gtm_create_version':
            result = await handleGtmCreateVersion(client, args);
            break;
          case 'gtm_publish_version':
            result = await handleGtmPublishVersion(client, args);
            break;
        }
        break;
      }

      default:
        return jsonRpcError(id, -32601, `Tool ${toolName} not found`, corsHeaders);
    }

    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id,
        result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof TokenError) {
      return jsonRpcError(id, error.mcpErrorCode, error.message, corsHeaders);
    }
    if (error instanceof ApiError) {
      return jsonRpcError(id, error.mcpErrorCode, error.message, corsHeaders);
    }
    return jsonRpcError(
      id,
      -32000,
      error instanceof Error ? error.message : 'Unknown error',
      corsHeaders
    );
  }
}

// Helper to create JSON-RPC error response
function jsonRpcError(
  id: number,
  code: number,
  message: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code, message },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================================
// Auth Tool Handlers
// ============================================================================

async function handleAuthInit(
  request: Request,
  env: Env,
  args: Record<string, unknown>
): Promise<MCPResponse> {
  const userId = (args.user_id as string) || TokenManager.generateTokenId();
  const baseUrl = new URL(request.url).origin;
  const redirectUri = `${baseUrl}/oauth/callback`;

  // Store state in KV for CSRF protection
  const state = crypto.randomUUID();
  await env.KV.put(
    `oauth_state:${state}`,
    JSON.stringify({ userId, created: Date.now() }),
    { expirationTtl: 600 } // 10 minutes
  );

  // Build Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            user_id: userId,
            auth_url: authUrl.toString(),
            instructions:
              'Visit the auth_url in a browser to authorize. After authorization, you will be redirected back and can use the user_id for API calls.',
          },
          null,
          2
        ),
      },
    ],
  };
}

async function handleAuthStatus(
  tokenManager: TokenManager,
  args: Record<string, unknown>
): Promise<MCPResponse> {
  const userId = args.user_id as string;
  if (!userId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'user_id is required' }) }],
      isError: true,
    };
  }

  const token = await tokenManager.getToken(userId);
  if (!token) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            authenticated: false,
            user_id: userId,
            message: 'No token found. Use ghub_auth_init to start authentication.',
          }),
        },
      ],
    };
  }

  const isExpired = tokenManager.isTokenExpired(token);
  const expiresIn = token.expires_at - Math.floor(Date.now() / 1000);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            authenticated: true,
            user_id: userId,
            scopes: token.scopes.split(' '),
            expires_in_seconds: expiresIn,
            is_expired: isExpired,
            created_at: new Date(token.created_at * 1000).toISOString(),
            updated_at: new Date(token.updated_at * 1000).toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

async function handleAuthRevoke(
  tokenManager: TokenManager,
  args: Record<string, unknown>
): Promise<MCPResponse> {
  const userId = args.user_id as string;
  if (!userId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'user_id is required' }) }],
      isError: true,
    };
  }

  await tokenManager.revokeToken(userId);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          user_id: userId,
          message: 'Token revoked successfully.',
        }),
      },
    ],
  };
}

async function handleAuthList(tokenManager: TokenManager): Promise<MCPResponse> {
  const tokens = await tokenManager.listTokens();

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: tokens.length,
            tokens: tokens.map((t) => ({
              user_id: t.user_id,
              scopes: t.scopes.split(' '),
              expires_at: new Date(t.expires_at * 1000).toISOString(),
            })),
          },
          null,
          2
        ),
      },
    ],
  };
}

// ============================================================================
// OAuth Handlers
// ============================================================================

function handleOAuthAuthorize(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Response {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id') || TokenManager.generateTokenId();
  const baseUrl = url.origin;
  const redirectUri = `${baseUrl}/oauth/callback`;

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Build Google OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SCOPES);
  authUrl.searchParams.set('state', `${state}:${userId}`);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  // Redirect to Google
  return Response.redirect(authUrl.toString(), 302);
}

async function handleOAuthCallback(
  request: Request,
  env: Env,
  tokenManager: TokenManager,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return new Response(
      htmlResponse('Authorization Failed', `Error: ${error}`, false),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }

  if (!code || !state) {
    return new Response(
      htmlResponse('Authorization Failed', 'Missing code or state parameter', false),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }

  // Parse state to get user ID
  const [, userId] = state.split(':');
  if (!userId) {
    return new Response(
      htmlResponse('Authorization Failed', 'Invalid state parameter', false),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }

  // Exchange code for tokens
  const baseUrl = url.origin;
  const redirectUri = `${baseUrl}/oauth/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = (await tokenResponse.json()) as { error_description?: string };
      return new Response(
        htmlResponse(
          'Authorization Failed',
          `Token exchange failed: ${errorData.error_description || 'Unknown error'}`,
          false
        ),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        }
      );
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };

    // Store token in database
    await tokenManager.storeToken(
      userId,
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in,
      tokenData.scope
    );

    return new Response(
      htmlResponse(
        'Authorization Successful!',
        `Your token ID is: <code>${userId}</code><br><br>You can now use this token ID with the Google Marketing Hub MCP tools.`,
        true
      ),
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  } catch (err) {
    return new Response(
      htmlResponse(
        'Authorization Failed',
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        false
      ),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }
}

// Helper to generate HTML response
function htmlResponse(title: string, message: string, success: boolean): string {
  const color = success ? '#10b981' : '#ef4444';
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      max-width: 500px;
    }
    h1 { color: ${color}; margin-bottom: 20px; }
    p { line-height: 1.6; color: #e0e0e0; }
    code {
      background: rgba(255,255,255,0.1);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      display: inline-block;
      margin: 10px 0;
      word-break: break-all;
    }
    .icon { font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${success ? '✅' : '❌'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
