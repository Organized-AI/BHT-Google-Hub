/**
 * GTM Container Tools
 * - gtm_list_containers: List containers in an account
 * - gtm_get_container: Get container details
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Containers
interface GTMContainer {
  path: string; // Format: accounts/{accountId}/containers/{containerId}
  accountId: string;
  containerId: string;
  name: string;
  domainName?: string[];
  publicId?: string;
  notes?: string;
  usageContext?: string[];
  fingerprint?: string;
  tagManagerUrl?: string;
  tagIds?: string[];
  features?: {
    supportUserPermissions?: boolean;
    supportEnvironments?: boolean;
    supportWorkspaces?: boolean;
    supportGtagConfigs?: boolean;
    supportBuiltInVariables?: boolean;
    supportClients?: boolean;
    supportFolders?: boolean;
    supportTags?: boolean;
    supportTemplates?: boolean;
    supportTriggers?: boolean;
    supportVariables?: boolean;
    supportVersions?: boolean;
    supportZones?: boolean;
    supportTransformations?: boolean;
  };
}

interface GTMContainersListResponse {
  container?: GTMContainer[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmContainerTools = [
  {
    name: 'gtm_list_containers',
    description: 'List all containers in a GTM account.',
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
        page_token: {
          type: 'string',
          description: 'Token for pagination to get the next page of results.',
        },
      },
      required: ['user_id', 'account_id'],
    },
  },
  {
    name: 'gtm_get_container',
    description: 'Get detailed information about a specific GTM container.',
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
      },
      required: ['user_id', 'account_id', 'container_id'],
    },
  },
];

// Tool Handlers
export async function handleGtmListContainers(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const pageToken = args.page_token as string | undefined;

  if (!accountId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'account_id is required' }) }],
      isError: true,
    };
  }

  let url = `${GTM_API}/accounts/${accountId}/containers`;
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMContainersListResponse>(url);

  const containers = (response.container || []).map((c) => ({
    containerId: c.containerId,
    name: c.name,
    publicId: c.publicId || null,
    domainName: c.domainName || [],
    usageContext: c.usageContext || [],
    notes: c.notes || null,
    tagManagerUrl: c.tagManagerUrl || null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId,
            count: containers.length,
            containers,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetContainer(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;

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

  const response = await client.get<GTMContainer>(
    `${GTM_API}/accounts/${accountId}/containers/${containerId}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId: response.accountId,
            containerId: response.containerId,
            name: response.name,
            publicId: response.publicId || null,
            domainName: response.domainName || [],
            usageContext: response.usageContext || [],
            notes: response.notes || null,
            fingerprint: response.fingerprint,
            tagManagerUrl: response.tagManagerUrl || null,
            tagIds: response.tagIds || [],
            features: response.features || {},
          },
          null,
          2
        ),
      },
    ],
  };
}
