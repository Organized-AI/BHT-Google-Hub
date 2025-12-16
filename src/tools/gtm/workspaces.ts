/**
 * GTM Workspace Tools
 * - gtm_list_workspaces: List workspaces in a container
 * - gtm_get_workspace: Get workspace details
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Workspaces
interface GTMWorkspace {
  path: string; // Format: accounts/{accountId}/containers/{containerId}/workspaces/{workspaceId}
  accountId: string;
  containerId: string;
  workspaceId: string;
  name: string;
  description?: string;
  fingerprint?: string;
  tagManagerUrl?: string;
}

interface GTMWorkspacesListResponse {
  workspace?: GTMWorkspace[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmWorkspaceTools = [
  {
    name: 'gtm_list_workspaces',
    description: 'List all workspaces in a GTM container.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        account_id: {
          type: 'string',
          description: 'The GTM account ID.',
        },
        container_id: {
          type: 'string',
          description: 'The GTM container ID.',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination to get the next page of results.',
        },
      },
      required: ['user_id', 'account_id', 'container_id'],
    },
  },
  {
    name: 'gtm_get_workspace',
    description: 'Get detailed information about a specific GTM workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        account_id: {
          type: 'string',
          description: 'The GTM account ID.',
        },
        container_id: {
          type: 'string',
          description: 'The GTM container ID.',
        },
        workspace_id: {
          type: 'string',
          description: 'The GTM workspace ID.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id'],
    },
  },
];

// Helper to build workspace path
function buildWorkspacePath(accountId: string, containerId: string, workspaceId?: string): string {
  let path = `${GTM_API}/accounts/${accountId}/containers/${containerId}/workspaces`;
  if (workspaceId) {
    path += `/${workspaceId}`;
  }
  return path;
}

// Tool Handlers
export async function handleGtmListWorkspaces(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const pageToken = args.page_token as string | undefined;

  if (!accountId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'account_id is required' }) }],
      isError: true,
    };
  }

  if (!containerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'container_id is required' }) }],
      isError: true,
    };
  }

  let url = buildWorkspacePath(accountId, containerId);
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMWorkspacesListResponse>(url);

  const workspaces = (response.workspace || []).map((w) => ({
    workspaceId: w.workspaceId,
    name: w.name,
    description: w.description || null,
    tagManagerUrl: w.tagManagerUrl || null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId,
            containerId,
            count: workspaces.length,
            workspaces,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetWorkspace(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;

  if (!accountId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'account_id is required' }) }],
      isError: true,
    };
  }

  if (!containerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'container_id is required' }) }],
      isError: true,
    };
  }

  if (!workspaceId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'workspace_id is required' }) }],
      isError: true,
    };
  }

  const response = await client.get<GTMWorkspace>(
    buildWorkspacePath(accountId, containerId, workspaceId)
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId: response.accountId,
            containerId: response.containerId,
            workspaceId: response.workspaceId,
            name: response.name,
            description: response.description || null,
            fingerprint: response.fingerprint,
            tagManagerUrl: response.tagManagerUrl || null,
          },
          null,
          2
        ),
      },
    ],
  };
}
