/**
 * GTM Tag Tools
 * - gtm_list_tags: List tags in a workspace
 * - gtm_get_tag: Get tag details
 * - gtm_create_tag: Create a new tag
 * - gtm_update_tag: Update an existing tag
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Tags
interface GTMParameter {
  type: string;
  key: string;
  value?: string;
  list?: GTMParameter[];
  map?: GTMParameter[];
}

interface GTMTag {
  path: string;
  accountId: string;
  containerId: string;
  workspaceId: string;
  tagId: string;
  name: string;
  type: string;
  parameter?: GTMParameter[];
  fingerprint?: string;
  firingTriggerId?: string[];
  blockingTriggerId?: string[];
  liveOnly?: boolean;
  priority?: { value?: string };
  notes?: string;
  scheduleStartMs?: string;
  scheduleEndMs?: string;
  setupTag?: Array<{ tagName?: string; stopOnSetupFailure?: boolean }>;
  teardownTag?: Array<{ tagName?: string; stopTeardownOnFailure?: boolean }>;
  paused?: boolean;
  tagManagerUrl?: string;
  parentFolderId?: string;
  monitoringMetadata?: { type?: string };
  consentSettings?: { consentStatus?: string };
}

interface GTMTagsListResponse {
  tag?: GTMTag[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmTagTools = [
  {
    name: 'gtm_list_tags',
    description: 'List all tags in a GTM workspace.',
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
        page_token: {
          type: 'string',
          description: 'Token for pagination to get the next page of results.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id'],
    },
  },
  {
    name: 'gtm_get_tag',
    description: 'Get detailed information about a specific GTM tag.',
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
        tag_id: {
          type: 'string',
          description: 'The GTM tag ID.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'tag_id'],
    },
  },
  {
    name: 'gtm_create_tag',
    description: 'Create a new tag in a GTM workspace.',
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
        name: {
          type: 'string',
          description: 'The tag name.',
        },
        type: {
          type: 'string',
          description: 'The tag type (e.g., "gaawe" for GA4 Event, "html" for Custom HTML).',
        },
        parameter: {
          type: 'array',
          description: 'Tag parameters as array of {type, key, value} objects.',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Parameter type (e.g., "template", "boolean")' },
              key: { type: 'string', description: 'Parameter key' },
              value: { type: 'string', description: 'Parameter value' },
            },
          },
        },
        firing_trigger_id: {
          type: 'array',
          description: 'Array of trigger IDs that fire this tag.',
          items: { type: 'string' },
        },
        blocking_trigger_id: {
          type: 'array',
          description: 'Array of trigger IDs that block this tag.',
          items: { type: 'string' },
        },
        paused: {
          type: 'boolean',
          description: 'Whether the tag is paused.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'name', 'type'],
    },
  },
  {
    name: 'gtm_update_tag',
    description: 'Update an existing tag in a GTM workspace.',
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
        tag_id: {
          type: 'string',
          description: 'The GTM tag ID to update.',
        },
        name: {
          type: 'string',
          description: 'The new tag name.',
        },
        parameter: {
          type: 'array',
          description: 'Updated tag parameters.',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
        firing_trigger_id: {
          type: 'array',
          description: 'Updated array of trigger IDs that fire this tag.',
          items: { type: 'string' },
        },
        blocking_trigger_id: {
          type: 'array',
          description: 'Updated array of trigger IDs that block this tag.',
          items: { type: 'string' },
        },
        paused: {
          type: 'boolean',
          description: 'Whether the tag is paused.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'tag_id'],
    },
  },
];

// Helper to build tags path
function buildTagsPath(
  accountId: string,
  containerId: string,
  workspaceId: string,
  tagId?: string
): string {
  let path = `${GTM_API}/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`;
  if (tagId) {
    path += `/${tagId}`;
  }
  return path;
}

// Helper to format tag for response
function formatTag(tag: GTMTag) {
  return {
    tagId: tag.tagId,
    name: tag.name,
    type: tag.type,
    firingTriggerId: tag.firingTriggerId || [],
    blockingTriggerId: tag.blockingTriggerId || [],
    paused: tag.paused || false,
    parameter: tag.parameter || [],
    notes: tag.notes || null,
    fingerprint: tag.fingerprint,
    tagManagerUrl: tag.tagManagerUrl || null,
  };
}

// Tool Handlers
export async function handleGtmListTags(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const pageToken = args.page_token as string | undefined;

  if (!accountId || !containerId || !workspaceId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'account_id, container_id, and workspace_id are required' }),
        },
      ],
      isError: true,
    };
  }

  let url = buildTagsPath(accountId, containerId, workspaceId);
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMTagsListResponse>(url);

  const tags = (response.tag || []).map((t) => ({
    tagId: t.tagId,
    name: t.name,
    type: t.type,
    firingTriggerId: t.firingTriggerId || [],
    paused: t.paused || false,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId,
            containerId,
            workspaceId,
            count: tags.length,
            tags,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetTag(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const tagId = args.tag_id as string;

  if (!accountId || !containerId || !workspaceId || !tagId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, workspace_id, and tag_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const response = await client.get<GTMTag>(
    buildTagsPath(accountId, containerId, workspaceId, tagId)
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId,
            containerId,
            workspaceId,
            ...formatTag(response),
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmCreateTag(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const name = args.name as string;
  const type = args.type as string;
  const parameter = args.parameter as GTMParameter[] | undefined;
  const firingTriggerId = args.firing_trigger_id as string[] | undefined;
  const blockingTriggerId = args.blocking_trigger_id as string[] | undefined;
  const paused = args.paused as boolean | undefined;

  if (!accountId || !containerId || !workspaceId || !name || !type) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, workspace_id, name, and type are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const tagBody: Partial<GTMTag> = {
    name,
    type,
  };

  if (parameter) tagBody.parameter = parameter;
  if (firingTriggerId) tagBody.firingTriggerId = firingTriggerId;
  if (blockingTriggerId) tagBody.blockingTriggerId = blockingTriggerId;
  if (paused !== undefined) tagBody.paused = paused;

  const response = await client.post<GTMTag>(
    buildTagsPath(accountId, containerId, workspaceId),
    tagBody
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Tag created successfully',
            accountId,
            containerId,
            workspaceId,
            ...formatTag(response),
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmUpdateTag(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const tagId = args.tag_id as string;
  const name = args.name as string | undefined;
  const parameter = args.parameter as GTMParameter[] | undefined;
  const firingTriggerId = args.firing_trigger_id as string[] | undefined;
  const blockingTriggerId = args.blocking_trigger_id as string[] | undefined;
  const paused = args.paused as boolean | undefined;

  if (!accountId || !containerId || !workspaceId || !tagId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, workspace_id, and tag_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  // First get the existing tag to preserve fields
  const existingTag = await client.get<GTMTag>(
    buildTagsPath(accountId, containerId, workspaceId, tagId)
  );

  const updatedTag: Partial<GTMTag> = {
    ...existingTag,
  };

  if (name !== undefined) updatedTag.name = name;
  if (parameter !== undefined) updatedTag.parameter = parameter;
  if (firingTriggerId !== undefined) updatedTag.firingTriggerId = firingTriggerId;
  if (blockingTriggerId !== undefined) updatedTag.blockingTriggerId = blockingTriggerId;
  if (paused !== undefined) updatedTag.paused = paused;

  const response = await client.put<GTMTag>(
    buildTagsPath(accountId, containerId, workspaceId, tagId),
    updatedTag
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Tag updated successfully',
            accountId,
            containerId,
            workspaceId,
            ...formatTag(response),
          },
          null,
          2
        ),
      },
    ],
  };
}
