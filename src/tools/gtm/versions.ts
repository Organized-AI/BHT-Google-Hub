/**
 * GTM Version Control Tools
 * - gtm_list_versions: List container versions
 * - gtm_create_version: Create a version from workspace
 * - gtm_publish_version: Publish a version to live
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Versions
interface GTMContainerVersion {
  path: string;
  accountId: string;
  containerId: string;
  containerVersionId: string;
  name?: string;
  deleted?: boolean;
  description?: string;
  fingerprint?: string;
  tagManagerUrl?: string;
  tag?: Array<{
    tagId: string;
    name: string;
    type: string;
  }>;
  trigger?: Array<{
    triggerId: string;
    name: string;
    type: string;
  }>;
  variable?: Array<{
    variableId: string;
    name: string;
    type: string;
  }>;
  folder?: Array<{
    folderId: string;
    name: string;
  }>;
  builtInVariable?: Array<{
    type: string;
    name: string;
  }>;
  container?: {
    containerId: string;
    name: string;
    publicId: string;
  };
}

interface GTMContainerVersionHeader {
  path: string;
  accountId: string;
  containerId: string;
  containerVersionId: string;
  name?: string;
  numTags?: string;
  numTriggers?: string;
  numVariables?: string;
  numMacros?: string;
  numRules?: string;
  numZones?: string;
  numCustomTemplates?: string;
  deleted?: boolean;
}

interface GTMVersionsListResponse {
  containerVersionHeader?: GTMContainerVersionHeader[];
  nextPageToken?: string;
}

interface GTMCreateVersionResponse {
  containerVersion?: GTMContainerVersion;
  syncStatus?: {
    mergeConflict?: boolean;
    syncError?: boolean;
  };
  compilerError?: boolean;
  newWorkspacePath?: string;
}

interface GTMPublishVersionResponse {
  containerVersion?: GTMContainerVersion;
  compilerError?: boolean;
}

// Tool Definitions
export const gtmVersionTools = [
  {
    name: 'gtm_list_versions',
    description: 'List all versions of a GTM container.',
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
        include_deleted: {
          type: 'boolean',
          description: 'Include deleted versions (default: false).',
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
    name: 'gtm_create_version',
    description:
      'Create a new container version from a workspace. This captures all workspace changes into a version.',
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
          description: 'The GTM workspace ID to create the version from.',
        },
        name: {
          type: 'string',
          description: 'The version name.',
        },
        notes: {
          type: 'string',
          description: 'Notes/description for the version.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id'],
    },
  },
  {
    name: 'gtm_publish_version',
    description: 'Publish a container version to make it live. This will serve the version to all users.',
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
        version_id: {
          type: 'string',
          description: 'The version ID to publish.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'version_id'],
    },
  },
];

// Tool Handlers
export async function handleGtmListVersions(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const includeDeleted = args.include_deleted as boolean | undefined;
  const pageToken = args.page_token as string | undefined;

  if (!accountId || !containerId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'account_id and container_id are required' }),
        },
      ],
      isError: true,
    };
  }

  const params: string[] = [];
  if (includeDeleted) params.push('includeDeleted=true');
  if (pageToken) params.push(`pageToken=${encodeURIComponent(pageToken)}`);

  let url = `${GTM_API}/accounts/${accountId}/containers/${containerId}/version_headers`;
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const response = await client.get<GTMVersionsListResponse>(url);

  const versions = (response.containerVersionHeader || []).map((v) => ({
    versionId: v.containerVersionId,
    name: v.name || `Version ${v.containerVersionId}`,
    numTags: parseInt(v.numTags || '0', 10),
    numTriggers: parseInt(v.numTriggers || '0', 10),
    numVariables: parseInt(v.numVariables || '0', 10),
    deleted: v.deleted || false,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId,
            containerId,
            count: versions.length,
            versions,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmCreateVersion(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const name = args.name as string | undefined;
  const notes = args.notes as string | undefined;

  if (!accountId || !containerId || !workspaceId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, and workspace_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const requestBody: { name?: string; notes?: string } = {};
  if (name) requestBody.name = name;
  if (notes) requestBody.notes = notes;

  const url = `${GTM_API}/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:create_version`;

  const response = await client.post<GTMCreateVersionResponse>(url, requestBody);

  if (response.compilerError) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Compiler error occurred while creating version',
            syncStatus: response.syncStatus,
          }),
        },
      ],
      isError: true,
    };
  }

  const version = response.containerVersion;
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Version created successfully',
            accountId,
            containerId,
            versionId: version?.containerVersionId,
            name: version?.name || null,
            description: version?.description || null,
            tagCount: version?.tag?.length || 0,
            triggerCount: version?.trigger?.length || 0,
            variableCount: version?.variable?.length || 0,
            tagManagerUrl: version?.tagManagerUrl || null,
            syncStatus: response.syncStatus,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmPublishVersion(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const versionId = args.version_id as string;

  if (!accountId || !containerId || !versionId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, and version_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const url = `${GTM_API}/accounts/${accountId}/containers/${containerId}/versions/${versionId}:publish`;

  const response = await client.post<GTMPublishVersionResponse>(url, {});

  if (response.compilerError) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Compiler error occurred while publishing version',
          }),
        },
      ],
      isError: true,
    };
  }

  const version = response.containerVersion;
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Version published successfully - now live!',
            accountId,
            containerId,
            versionId: version?.containerVersionId,
            name: version?.name || null,
            description: version?.description || null,
            tagCount: version?.tag?.length || 0,
            triggerCount: version?.trigger?.length || 0,
            variableCount: version?.variable?.length || 0,
            tagManagerUrl: version?.tagManagerUrl || null,
          },
          null,
          2
        ),
      },
    ],
  };
}
