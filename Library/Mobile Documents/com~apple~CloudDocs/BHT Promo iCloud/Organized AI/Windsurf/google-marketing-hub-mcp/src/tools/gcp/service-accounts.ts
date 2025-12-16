/**
 * GCP Service Account Tools
 * - gcp_list_service_accounts: List service accounts in a project
 * - gcp_get_service_account: Get service account details
 */

import { GoogleApiClient } from '../../lib/google-api-client';

// Types for IAM API
interface ServiceAccount {
  name: string;
  projectId: string;
  uniqueId: string;
  email: string;
  displayName?: string;
  description?: string;
  disabled?: boolean;
  oauth2ClientId?: string;
}

interface ServiceAccountsListResponse {
  accounts?: ServiceAccount[];
  nextPageToken?: string;
}

// Tool Definitions
export const gcpServiceAccountTools = [
  {
    name: 'gcp_list_service_accounts',
    description: 'List all service accounts in a GCP project.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID to list service accounts for.',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of service accounts to return (default: 100).',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination.',
        },
      },
      required: ['user_id', 'project_id'],
    },
  },
  {
    name: 'gcp_get_service_account',
    description: 'Get detailed information about a specific service account.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID.',
        },
        email: {
          type: 'string',
          description: 'The service account email address.',
        },
      },
      required: ['user_id', 'project_id', 'email'],
    },
  },
];

// Tool Handlers
export async function handleGcpListServiceAccounts(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const projectId = args.project_id as string;

  if (!projectId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'project_id is required' }) }],
      isError: true,
    };
  }

  const pageSize = (args.page_size as number) || 100;
  const pageToken = args.page_token as string | undefined;

  let url = `https://iam.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/serviceAccounts?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<ServiceAccountsListResponse>(url);

  const accounts = (response.accounts || []).map((sa) => ({
    email: sa.email,
    displayName: sa.displayName || null,
    description: sa.description || null,
    uniqueId: sa.uniqueId,
    disabled: sa.disabled || false,
    projectId: sa.projectId,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            projectId,
            count: accounts.length,
            serviceAccounts: accounts,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGcpGetServiceAccount(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const projectId = args.project_id as string;
  const email = args.email as string;

  if (!projectId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'project_id is required' }) }],
      isError: true,
    };
  }

  if (!email) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'email is required' }) }],
      isError: true,
    };
  }

  const response = await client.get<ServiceAccount>(
    `https://iam.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/serviceAccounts/${encodeURIComponent(email)}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            email: response.email,
            displayName: response.displayName || null,
            description: response.description || null,
            uniqueId: response.uniqueId,
            disabled: response.disabled || false,
            projectId: response.projectId,
            oauth2ClientId: response.oauth2ClientId || null,
          },
          null,
          2
        ),
      },
    ],
  };
}
