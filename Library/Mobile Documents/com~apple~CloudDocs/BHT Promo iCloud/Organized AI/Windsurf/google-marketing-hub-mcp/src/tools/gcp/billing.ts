/**
 * GCP Billing Tools
 * - gcp_get_billing_info: Get billing info for a project
 * - gcp_list_billing_accounts: List accessible billing accounts
 */

import { GoogleApiClient } from '../../lib/google-api-client';

// Types for Cloud Billing API
interface ProjectBillingInfo {
  name: string;
  projectId: string;
  billingAccountName: string;
  billingEnabled: boolean;
}

interface BillingAccount {
  name: string;
  displayName: string;
  open: boolean;
  masterBillingAccount?: string;
}

interface BillingAccountsListResponse {
  billingAccounts?: BillingAccount[];
  nextPageToken?: string;
}

// Tool Definitions
export const gcpBillingTools = [
  {
    name: 'gcp_get_billing_info',
    description: 'Get billing information for a GCP project, including whether billing is enabled and which billing account is linked.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID to get billing info for.',
        },
      },
      required: ['user_id', 'project_id'],
    },
  },
  {
    name: 'gcp_list_billing_accounts',
    description: 'List all billing accounts accessible to the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of billing accounts to return (default: 100).',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination.',
        },
      },
      required: ['user_id'],
    },
  },
];

// Tool Handlers
export async function handleGcpGetBillingInfo(
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

  const response = await client.get<ProjectBillingInfo>(
    `https://cloudbilling.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/billingInfo`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            projectId: response.projectId,
            billingEnabled: response.billingEnabled,
            billingAccountName: response.billingAccountName || null,
            billingAccountId: response.billingAccountName
              ? response.billingAccountName.replace('billingAccounts/', '')
              : null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGcpListBillingAccounts(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const pageSize = (args.page_size as number) || 100;
  const pageToken = args.page_token as string | undefined;

  let url = `https://cloudbilling.googleapis.com/v1/billingAccounts?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<BillingAccountsListResponse>(url);

  const accounts = (response.billingAccounts || []).map((ba) => ({
    id: ba.name.replace('billingAccounts/', ''),
    name: ba.name,
    displayName: ba.displayName,
    open: ba.open,
    masterBillingAccount: ba.masterBillingAccount || null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: accounts.length,
            billingAccounts: accounts,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}
