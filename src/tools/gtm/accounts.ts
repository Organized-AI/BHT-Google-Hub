/**
 * GTM Account Tools
 * - gtm_list_accounts: List all GTM accounts
 * - gtm_get_account: Get account details
 *
 * Uses GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GTM_API = 'https://tagmanager.googleapis.com/tagmanager/v2';

// Types for GTM Accounts
interface GTMAccount {
  path: string; // Format: accounts/{accountId}
  accountId: string;
  name: string;
  shareData?: boolean;
  fingerprint?: string;
  tagManagerUrl?: string;
  features?: {
    supportUserPermissions?: boolean;
    supportMultipleContainers?: boolean;
  };
}

interface GTMAccountsListResponse {
  account?: GTMAccount[];
  nextPageToken?: string;
}

// Tool Definitions
export const gtmAccountTools = [
  {
    name: 'gtm_list_accounts',
    description: 'List all Google Tag Manager accounts accessible to the user.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination to get the next page of results.',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'gtm_get_account',
    description: 'Get detailed information about a specific GTM account.',
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
      },
      required: ['user_id', 'account_id'],
    },
  },
];

// Tool Handlers
export async function handleGtmListAccounts(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const pageToken = args.page_token as string | undefined;

  let url = `${GTM_API}/accounts`;
  if (pageToken) {
    url += `?pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GTMAccountsListResponse>(url);

  const accounts = (response.account || []).map((a) => ({
    accountId: a.accountId,
    name: a.name,
    shareData: a.shareData || false,
    tagManagerUrl: a.tagManagerUrl || null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: accounts.length,
            accounts,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGtmGetAccount(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const accountId = args.account_id as string;

  if (!accountId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'account_id is required' }) }],
      isError: true,
    };
  }

  const response = await client.get<GTMAccount>(`${GTM_API}/accounts/${accountId}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            accountId: response.accountId,
            name: response.name,
            shareData: response.shareData || false,
            fingerprint: response.fingerprint,
            tagManagerUrl: response.tagManagerUrl || null,
            features: response.features || {},
          },
          null,
          2
        ),
      },
    ],
  };
}
