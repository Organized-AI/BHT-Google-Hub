/**
 * Google Ads Account Tools
 * - gads_list_accounts: List accessible Google Ads accounts
 * - gads_get_account: Get account details
 *
 * Uses Google Ads API v18: https://googleads.googleapis.com/v18
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GADS_API = 'https://googleads.googleapis.com/v18';

// Types for Google Ads Accounts
interface CustomerResourceName {
  resourceNames: string[];
}

interface CustomerDetails {
  customer: {
    resourceName: string;
    id: string;
    descriptiveName: string;
    currencyCode: string;
    timeZone: string;
    trackingUrlTemplate?: string;
    autoTaggingEnabled?: boolean;
    manager?: boolean;
    testAccount?: boolean;
  };
}

interface SearchStreamResponse {
  results?: Array<CustomerDetails>;
}

// Tool Definitions
export const gadsAccountTools = [
  {
    name: 'gads_list_accounts',
    description: 'List all accessible Google Ads accounts for the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'gads_get_account',
    description: 'Get detailed information about a specific Google Ads account.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        customer_id: {
          type: 'string',
          description: 'The Google Ads customer ID (without hyphens, e.g., 1234567890).',
        },
      },
      required: ['user_id', 'customer_id'],
    },
  },
];

// Helper to run GAQL queries
async function runGaqlQuery(
  client: GoogleApiClient,
  customerId: string,
  query: string
): Promise<unknown[]> {
  const response = await client.post<SearchStreamResponse>(
    `${GADS_API}/customers/${customerId}/googleAds:searchStream`,
    { query }
  );
  return response.results || [];
}

// Tool Handlers
export async function handleGadsListAccounts(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const response = await client.get<CustomerResourceName>(
    `${GADS_API}/customers:listAccessibleCustomers`
  );

  const resourceNames = response.resourceNames || [];
  const accounts = resourceNames.map((name) => {
    // Format: customers/{customerId}
    const customerId = name.split('/')[1];
    return {
      resourceName: name,
      customerId,
    };
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: accounts.length,
            accounts,
            note: 'Use gads_get_account with a customer_id to get detailed account information.',
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsGetAccount(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = args.customer_id as string;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  // Remove any hyphens from customer ID
  const cleanCustomerId = customerId.replace(/-/g, '');

  const query = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.time_zone,
      customer.tracking_url_template,
      customer.auto_tagging_enabled,
      customer.manager,
      customer.test_account
    FROM customer
  `;

  const results = await runGaqlQuery(client, cleanCustomerId, query);

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Account not found or not accessible',
            customerId: cleanCustomerId,
          }),
        },
      ],
      isError: true,
    };
  }

  const account = (results[0] as CustomerDetails).customer;

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId: account.id,
            name: account.descriptiveName,
            currencyCode: account.currencyCode,
            timeZone: account.timeZone,
            trackingUrlTemplate: account.trackingUrlTemplate || null,
            autoTaggingEnabled: account.autoTaggingEnabled || false,
            isManager: account.manager || false,
            isTestAccount: account.testAccount || false,
          },
          null,
          2
        ),
      },
    ],
  };
}
