/**
 * GTM Variable Tools
 * - gtm_list_variables: List variables in a workspace
 * - gtm_get_variable: Get variable details
 * - gtm_create_variable: Create a new variable
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Variables
interface GTMParameter {
  type: string;
  key: string;
  value?: string;
  list?: GTMParameter[];
  map?: GTMParameter[];
}

interface GTMVariable {
  path: string;
  accountId: string;
  containerId: string;
  workspaceId: string;
  variableId: string;
  name: string;
  type: string;
  parameter?: GTMParameter[];
  fingerprint?: string;
  parentFolderId?: string;
  notes?: string;
  scheduleStartMs?: string;
  scheduleEndMs?: string;
  formatValue?: {
    caseConversionType?: string;
    convertNullToValue?: { value?: string };
    convertUndefinedToValue?: { value?: string };
    convertTrueToValue?: { value?: string };
    convertFalseToValue?: { value?: string };
  };
  disablingTriggerId?: string[];
  enablingTriggerId?: string[];
  tagManagerUrl?: string;
}

interface GTMVariablesListResponse {
  variable?: GTMVariable[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmVariableTools = [
  {
    name: 'gtm_list_variables',
    description: 'List all variables in a GTM workspace.',
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
    name: 'gtm_get_variable',
    description: 'Get detailed information about a specific GTM variable.',
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
        variable_id: {
          type: 'string',
          description: 'The GTM variable ID.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'variable_id'],
    },
  },
  {
    name: 'gtm_create_variable',
    description: 'Create a new variable in a GTM workspace.',
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
          description: 'The variable name.',
        },
        type: {
          type: 'string',
          description:
            'The variable type (e.g., "c" for Constant, "v" for Data Layer Variable, "jsm" for Custom JavaScript, "k" for First Party Cookie, "u" for URL).',
        },
        parameter: {
          type: 'array',
          description: 'Variable parameters as array of {type, key, value} objects.',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Parameter type (e.g., "template", "boolean")' },
              key: { type: 'string', description: 'Parameter key' },
              value: { type: 'string', description: 'Parameter value' },
            },
          },
        },
        notes: {
          type: 'string',
          description: 'Notes about the variable.',
        },
      },
      required: ['user_id', 'account_id', 'container_id', 'workspace_id', 'name', 'type'],
    },
  },
];

// Helper to build variables path
function buildVariablesPath(
  accountId: string,
  containerId: string,
  workspaceId: string,
  variableId?: string
): string {
  let path = `${GTM_API}/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`;
  if (variableId) {
    path += `/${variableId}`;
  }
  return path;
}

// Helper to format variable for response
function formatVariable(variable: GTMVariable) {
  return {
    variableId: variable.variableId,
    name: variable.name,
    type: variable.type,
    parameter: variable.parameter || [],
    notes: variable.notes || null,
    fingerprint: variable.fingerprint,
    formatValue: variable.formatValue || null,
    tagManagerUrl: variable.tagManagerUrl || null,
  };
}

// Tool Handlers
export async function handleGtmListVariables(
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

  let url = buildVariablesPath(accountId, containerId, workspaceId);
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMVariablesListResponse>(url);

  const variables = (response.variable || []).map((v) => ({
    variableId: v.variableId,
    name: v.name,
    type: v.type,
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
            count: variables.length,
            variables,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetVariable(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const variableId = args.variable_id as string;

  if (!accountId || !containerId || !workspaceId || !variableId) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'account_id, container_id, workspace_id, and variable_id are required',
          }),
        },
      ],
      isError: true,
    };
  }

  const response = await client.get<GTMVariable>(
    buildVariablesPath(accountId, containerId, workspaceId, variableId)
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
            ...formatVariable(response),
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmCreateVariable(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;
  const containerId = args.container_id as string;
  const workspaceId = args.workspace_id as string;
  const name = args.name as string;
  const type = args.type as string;
  const parameter = args.parameter as GTMParameter[] | undefined;
  const notes = args.notes as string | undefined;

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

  const variableBody: Partial<GTMVariable> = {
    name,
    type,
  };

  if (parameter) variableBody.parameter = parameter;
  if (notes) variableBody.notes = notes;

  const response = await client.post<GTMVariable>(
    buildVariablesPath(accountId, containerId, workspaceId),
    variableBody
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            message: 'Variable created successfully',
            accountId,
            containerId,
            workspaceId,
            ...formatVariable(response),
          },
          null,
          2
        ),
      },
    ],
  };
}
