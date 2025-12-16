/**
 * Google Ads Campaign Tools
 * - gads_list_campaigns: List campaigns in an account
 * - gads_get_campaign: Get campaign details
 * - gads_update_campaign_status: Update campaign status (ENABLED|PAUSED|REMOVED)
 * - gads_update_campaign_budget: Update campaign budget
 *
 * Uses Google Ads API v18: https://googleads.googleapis.com/v18
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GADS_API = 'https://googleads.googleapis.com/v18';

// Types for Google Ads Campaigns
interface CampaignResult {
  campaign: {
    resourceName: string;
    id: string;
    name: string;
    status: string;
    biddingStrategyType?: string;
    startDate?: string;
    endDate?: string;
    campaignBudget?: string;
    advertisingChannelType?: string;
  };
  campaignBudget?: {
    resourceName: string;
    id: string;
    amountMicros: string;
    deliveryMethod?: string;
  };
}

interface SearchStreamResponse {
  results?: Array<CampaignResult>;
}

interface MutateResponse {
  results: Array<{
    resourceName: string;
  }>;
}

// Tool Definitions
export const gadsCampaignTools = [
  {
    name: 'gads_list_campaigns',
    description: 'List all campaigns in a Google Ads account.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        customer_id: {
          type: 'string',
          description: 'The Google Ads customer ID (without hyphens).',
        },
        status: {
          type: 'string',
          enum: ['ENABLED', 'PAUSED', 'REMOVED', 'ALL'],
          description: 'Filter by campaign status. Default: ALL.',
        },
      },
      required: ['user_id', 'customer_id'],
    },
  },
  {
    name: 'gads_get_campaign',
    description: 'Get detailed information about a specific campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        customer_id: {
          type: 'string',
          description: 'The Google Ads customer ID (without hyphens).',
        },
        campaign_id: {
          type: 'string',
          description: 'The campaign ID to retrieve.',
        },
      },
      required: ['user_id', 'customer_id', 'campaign_id'],
    },
  },
  {
    name: 'gads_update_campaign_status',
    description: 'Update the status of a campaign (pause, enable, or remove).',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        customer_id: {
          type: 'string',
          description: 'The Google Ads customer ID (without hyphens).',
        },
        campaign_id: {
          type: 'string',
          description: 'The campaign ID to update.',
        },
        status: {
          type: 'string',
          enum: ['ENABLED', 'PAUSED', 'REMOVED'],
          description: 'The new status for the campaign.',
        },
      },
      required: ['user_id', 'customer_id', 'campaign_id', 'status'],
    },
  },
  {
    name: 'gads_update_campaign_budget',
    description: 'Update the daily budget for a campaign.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        customer_id: {
          type: 'string',
          description: 'The Google Ads customer ID (without hyphens).',
        },
        campaign_id: {
          type: 'string',
          description: 'The campaign ID to update budget for.',
        },
        budget_amount_micros: {
          type: 'string',
          description: 'The new budget amount in micros (multiply dollars by 1,000,000).',
        },
      },
      required: ['user_id', 'customer_id', 'campaign_id', 'budget_amount_micros'],
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
export async function handleGadsListCampaigns(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const statusFilter = args.status as string | undefined;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  let query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.bidding_strategy_type,
      campaign.advertising_channel_type,
      campaign.start_date,
      campaign.end_date,
      campaign_budget.id,
      campaign_budget.amount_micros
    FROM campaign
  `;

  if (statusFilter && statusFilter !== 'ALL') {
    query += ` WHERE campaign.status = '${statusFilter}'`;
  }

  const results = await runGaqlQuery(client, customerId, query);

  const campaigns = (results as CampaignResult[]).map((r) => ({
    campaignId: r.campaign.id,
    name: r.campaign.name,
    status: r.campaign.status,
    biddingStrategyType: r.campaign.biddingStrategyType || null,
    advertisingChannelType: r.campaign.advertisingChannelType || null,
    startDate: r.campaign.startDate || null,
    endDate: r.campaign.endDate || null,
    budgetId: r.campaignBudget?.id || null,
    budgetAmountMicros: r.campaignBudget?.amountMicros || null,
    budgetAmount: r.campaignBudget?.amountMicros
      ? (parseInt(r.campaignBudget.amountMicros, 10) / 1000000).toFixed(2)
      : null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            count: campaigns.length,
            campaigns,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsGetCampaign(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  if (!campaignId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'campaign_id is required' }) }],
      isError: true,
    };
  }

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.bidding_strategy_type,
      campaign.advertising_channel_type,
      campaign.start_date,
      campaign.end_date,
      campaign_budget.id,
      campaign_budget.amount_micros,
      campaign_budget.delivery_method
    FROM campaign
    WHERE campaign.id = ${campaignId}
  `;

  const results = await runGaqlQuery(client, customerId, query);

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Campaign not found',
            campaignId,
            customerId,
          }),
        },
      ],
      isError: true,
    };
  }

  const r = results[0] as CampaignResult;

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            campaignId: r.campaign.id,
            name: r.campaign.name,
            status: r.campaign.status,
            biddingStrategyType: r.campaign.biddingStrategyType || null,
            advertisingChannelType: r.campaign.advertisingChannelType || null,
            startDate: r.campaign.startDate || null,
            endDate: r.campaign.endDate || null,
            budget: {
              budgetId: r.campaignBudget?.id || null,
              amountMicros: r.campaignBudget?.amountMicros || null,
              amount: r.campaignBudget?.amountMicros
                ? (parseInt(r.campaignBudget.amountMicros, 10) / 1000000).toFixed(2)
                : null,
              deliveryMethod: r.campaignBudget?.deliveryMethod || null,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsUpdateCampaignStatus(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string;
  const status = args.status as string;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  if (!campaignId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'campaign_id is required' }) }],
      isError: true,
    };
  }

  if (!status || !['ENABLED', 'PAUSED', 'REMOVED'].includes(status)) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'status is required and must be ENABLED, PAUSED, or REMOVED',
          }),
        },
      ],
      isError: true,
    };
  }

  const response = await client.post<MutateResponse>(
    `${GADS_API}/customers/${customerId}/campaigns:mutate`,
    {
      operations: [
        {
          update: {
            resourceName: `customers/${customerId}/campaigns/${campaignId}`,
            status,
          },
          updateMask: 'status',
        },
      ],
    }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            campaignId,
            newStatus: status,
            resourceName: response.results?.[0]?.resourceName,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsUpdateCampaignBudget(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string;
  const budgetAmountMicros = args.budget_amount_micros as string;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  if (!campaignId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'campaign_id is required' }) }],
      isError: true,
    };
  }

  if (!budgetAmountMicros) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'budget_amount_micros is required' }),
        },
      ],
      isError: true,
    };
  }

  // First, get the campaign's budget resource name
  const query = `
    SELECT campaign.campaign_budget
    FROM campaign
    WHERE campaign.id = ${campaignId}
  `;

  const results = await runGaqlQuery(client, customerId, query);

  if (results.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Campaign not found',
            campaignId,
            customerId,
          }),
        },
      ],
      isError: true,
    };
  }

  const campaign = results[0] as { campaign: { campaignBudget: string } };
  const budgetResourceName = campaign.campaign.campaignBudget;

  if (!budgetResourceName) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Campaign does not have a budget assigned',
            campaignId,
          }),
        },
      ],
      isError: true,
    };
  }

  // Update the budget
  const response = await client.post<MutateResponse>(
    `${GADS_API}/customers/${customerId}/campaignBudgets:mutate`,
    {
      operations: [
        {
          update: {
            resourceName: budgetResourceName,
            amountMicros: budgetAmountMicros,
          },
          updateMask: 'amount_micros',
        },
      ],
    }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            campaignId,
            budgetResourceName,
            newBudgetAmountMicros: budgetAmountMicros,
            newBudgetAmount: (parseInt(budgetAmountMicros, 10) / 1000000).toFixed(2),
            resourceName: response.results?.[0]?.resourceName,
          },
          null,
          2
        ),
      },
    ],
  };
}
