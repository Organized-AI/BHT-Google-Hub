/**
 * GTM Trigger Tools
 * - gtm_list_triggers: List triggers in a workspace
 * - gtm_get_trigger: Get trigger details
 * - gtm_create_trigger: Create a new trigger
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Triggers
interface GTMCondition {
  type: string;
  parameter?: Array<{
    type: string;
    key: string;
    value?: string;
  }>;
}

interface GTMTrigger {
  path: string;
  accountId: string;
  containerId: string;
  workspaceId: string;
  triggerId: string;
  name: string;
  type: string;
  customEventFilter?: GTMCondition[];
  filter?: GTMCondition[];
  autoEventFilter?: GTMCondition[];
  waitForTags?: { value?: string };
  checkValidation?: { value?: string };
  waitForTagsTimeout?: { value?: string };
  uniqueTriggerId?: { value?: string };
  eventName?: { value?: string };
  interval?: { value?: string };
  limit?: { value?: string };
  fingerprint?: string;
  parentFolderId?: string;
  selector?: { value?: string };
  intervalSeconds?: { value?: string };
  maxTimerLengthSeconds?: { value?: string };
  verticalScrollPercentageList?: { value?: string };
  horizontalScrollPercentageList?: { value?: string };
  visibilitySelector?: { value?: string };
  visiblePercentageMin?: { value?: string };
  visiblePercentageMax?: { value?: string };
  continuousTimeMinMilliseconds?: { value?: string };
  totalTimeMinMilliseconds?: { value?: string };
  tagManagerUrl?: string;
  notes?: string;
  parameter?: Array<{
    type: string;
    key: string;
    value?: string;
  }>;
}

interface GTMTriggersListResponse {
  trigger?: GTMTrigger[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmTriggerTools = [
  {
    name: 'gtm_list_triggers',
    description: 'List all triggers in a GTM workspace.',
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
    name: 'gtm_get_trigger',
    description: 'Get detailed information about a specific GTM trigger.',
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
        trigger_id: {
          type: 'string',
          description: 'The GTM trigger ID.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'trigger_id'],
    },
  },
  {
    name: 'gtm_create_trigger',
    description: 'Create a new trigger in a GTM workspace.',
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
          description: 'The trigger name.',
        },
        type: {
          type: 'string',
          description:
            'The trigger type (e.g., "pageview", "click", "customEvent", "domReady", "windowLoaded", "formSubmission", "scrollDepth", "timer", "elementVisibility").',
        },
        custom_event_filter: {
          type: 'array',
          description: 'Filter conditions for custom events.',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Condition type (e.g., "equals", "contains")' },
              parameter: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    key: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        filter: {
          type: 'array',
          description: 'Additional filter conditions.',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              parameter: { type: 'array' },
            },
          },
        },
        event_name: {
          type: 'string',
          description: 'Event name for custom event triggers.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'name', 'type'],
    },
  },
];

// Helper to build triggers path
function buildTriggersPath(
  accountId: string,
  containerId: string,
  workspaceId: string,
  triggerId?: string
): string {
  let path = `${GTM_API}/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`;
  if (triggerId) {
    path += `/${triggerId}`;
  }
  return path;
}

// Helper to format trigger for response
function formatTrigger(trigger: GTMTrigger) {
  return {
    triggerId: trigger.triggerId,
    name: trigger.name,
    type: trigger.type,
    customEventFilter: trigger.customEventFilter || [],
    filter: trigger.filter || [],
    autoEventFilter: trigger.autoEventFilter || [],
    eventName: trigger.eventName?.value || null,
    fingerprint: trigger.fingerprint,
    notes: trigger.notes || null,
    tagManagerUrl: trigger.tagManagerUrl || null,
  };
}

// Tool Handlers
export async function handleGtmListTriggers(
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

  let url = buildTriggersPath(accountId, containerId, workspaceId);
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMTriggersListResponse>(url);

  const triggers = (response.trigger || []).map((t) => ({
    triggerId: t.triggerId,
    name: t.name,
    type: t.type,
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
            count: triggers.length,
            triggers,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetTrigger(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const triggerId = args.trigger_id as string;

  if (!accountId || !containerId || !workspaceId || !triggerId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, workspace_id, and trigger_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const response = await client.get<GTMTrigger>(
    buildTriggersPath(accountId, containerId, workspaceId, triggerId)
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
            ...formatTrigger(response),
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmCreateTrigger(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const name = args.name as string;
  const type = args.type as string;
  const customEventFilter = args.custom_event_filter as GTMCondition[] | undefined;
  const filter = args.filter as GTMCondition[] | undefined;
  const eventName = args.event_name as string | undefined;

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

  const triggerBody: Partial<GTMTrigger> = {
    name,
    type,
  };

  if (customEventFilter) triggerBody.customEventFilter = customEventFilter;
  if (filter) triggerBody.filter = filter;
  if (eventName) triggerBody.eventName = { value: eventName };

  const response = await client.post<GTMTrigger>(
    buildTriggersPath(accountId, containerId, workspaceId),
    triggerBody
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Trigger created successfully',
            accountId,
            containerId,
            workspaceId,
            ...formatTrigger(response),
          },
          null,
          2
        ),
      },
    ],
  };
}
