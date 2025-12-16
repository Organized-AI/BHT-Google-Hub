/**
 * Google Ads Reporting Tools
 * - gads_run_report: Run a custom GAQL report
 * - gads_get_campaign_performance: Get campaign performance metrics
 * - gads_get_keyword_performance: Get keyword performance
 * - gads_get_search_terms_report: Get search terms report
 *
 * Uses Google Ads API v18: https://googleads.googleapis.com/v18
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GADS_API = 'https://googleads.googleapis.com/v18';

// Types for Google Ads Reports
interface SearchStreamResponse {
  results?: Array<Record<string, unknown>>;
}

// Valid date range presets
const DATE_RANGE_PRESETS = [
  'TODAY',
  'YESTERDAY',
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'THIS_MONTH',
  'LAST_MONTH',
  'THIS_QUARTER',
  'LAST_QUARTER',
  'THIS_YEAR',
  'LAST_YEAR',
];

// Tool Definitions
export const gadsReportTools = [
  {
    name: 'gads_run_report',
    description:
      'Run a custom Google Ads Query Language (GAQL) report. Returns raw query results.',
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
        query: {
          type: 'string',
          description:
            'The GAQL query to execute (e.g., "SELECT campaign.id, metrics.clicks FROM campaign").',
        },
      },
      required: ['user_id', 'customer_id', 'query'],
    },
  },
  {
    name: 'gads_get_campaign_performance',
    description: 'Get performance metrics for campaigns in a Google Ads account.',
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
        date_range: {
          type: 'string',
          enum: DATE_RANGE_PRESETS,
          description:
            'Predefined date range for the report (e.g., TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS).',
        },
        start_date: {
          type: 'string',
          description: 'Custom start date in YYYY-MM-DD format (use with end_date instead of date_range).',
        },
        end_date: {
          type: 'string',
          description: 'Custom end date in YYYY-MM-DD format (use with start_date instead of date_range).',
        },
        campaign_id: {
          type: 'string',
          description: 'Optional: Filter by specific campaign ID.',
        },
      },
      required: ['user_id', 'customer_id'],
    },
  },
  {
    name: 'gads_get_keyword_performance',
    description: 'Get performance metrics for keywords in a Google Ads account.',
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
        date_range: {
          type: 'string',
          enum: DATE_RANGE_PRESETS,
          description:
            'Predefined date range for the report (e.g., TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS).',
        },
        start_date: {
          type: 'string',
          description: 'Custom start date in YYYY-MM-DD format.',
        },
        end_date: {
          type: 'string',
          description: 'Custom end date in YYYY-MM-DD format.',
        },
        campaign_id: {
          type: 'string',
          description: 'Optional: Filter by specific campaign ID.',
        },
      },
      required: ['user_id', 'customer_id'],
    },
  },
  {
    name: 'gads_get_search_terms_report',
    description: 'Get search terms report showing actual search queries that triggered ads.',
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
        date_range: {
          type: 'string',
          enum: DATE_RANGE_PRESETS,
          description:
            'Predefined date range for the report (e.g., TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS).',
        },
        start_date: {
          type: 'string',
          description: 'Custom start date in YYYY-MM-DD format.',
        },
        end_date: {
          type: 'string',
          description: 'Custom end date in YYYY-MM-DD format.',
        },
        campaign_id: {
          type: 'string',
          description: 'Optional: Filter by specific campaign ID.',
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

// Helper to build date filter clause
function buildDateFilter(args: Record<string, unknown>): string {
  const dateRange = args.date_range as string | undefined;
  const startDate = args.start_date as string | undefined;
  const endDate = args.end_date as string | undefined;

  if (dateRange && DATE_RANGE_PRESETS.includes(dateRange)) {
    return `segments.date DURING ${dateRange}`;
  }

  if (startDate && endDate) {
    return `segments.date BETWEEN '${startDate}' AND '${endDate}'`;
  }

  // Default to last 30 days
  return 'segments.date DURING LAST_30_DAYS';
}

// Tool Handlers
export async function handleGadsRunReport(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const query = args.query as string;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  if (!query) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'query is required' }) }],
      isError: true,
    };
  }

  const results = await runGaqlQuery(client, customerId, query);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            query,
            rowCount: results.length,
            results,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsGetCampaignPerformance(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string | undefined;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  const dateFilter = buildDateFilter(args);

  let query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE ${dateFilter}
  `;

  if (campaignId) {
    query += ` AND campaign.id = ${campaignId}`;
  }

  const results = await runGaqlQuery(client, customerId, query);

  interface CampaignPerformanceResult {
    campaign: {
      id: string;
      name: string;
      status: string;
    };
    metrics: {
      impressions: string;
      clicks: string;
      costMicros: string;
      conversions: number;
      conversionsValue: number;
      ctr: number;
      averageCpc: string;
    };
  }

  const campaigns = (results as CampaignPerformanceResult[]).map((r) => ({
    campaignId: r.campaign.id,
    name: r.campaign.name,
    status: r.campaign.status,
    impressions: parseInt(r.metrics.impressions || '0', 10),
    clicks: parseInt(r.metrics.clicks || '0', 10),
    costMicros: r.metrics.costMicros || '0',
    cost: (parseInt(r.metrics.costMicros || '0', 10) / 1000000).toFixed(2),
    conversions: r.metrics.conversions || 0,
    conversionsValue: r.metrics.conversionsValue || 0,
    ctr: r.metrics.ctr || 0,
    averageCpc: r.metrics.averageCpc
      ? (parseInt(r.metrics.averageCpc, 10) / 1000000).toFixed(2)
      : '0.00',
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            dateFilter,
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

export async function handleGadsGetKeywordPerformance(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string | undefined;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  const dateFilter = buildDateFilter(args);

  let query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.status,
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc
    FROM keyword_view
    WHERE ${dateFilter}
  `;

  if (campaignId) {
    query += ` AND campaign.id = ${campaignId}`;
  }

  const results = await runGaqlQuery(client, customerId, query);

  interface KeywordPerformanceResult {
    adGroupCriterion: {
      keyword: {
        text: string;
        matchType: string;
      };
      status: string;
    };
    campaign: {
      id: string;
      name: string;
    };
    adGroup: {
      id: string;
      name: string;
    };
    metrics: {
      impressions: string;
      clicks: string;
      costMicros: string;
      conversions: number;
      ctr: number;
      averageCpc: string;
    };
  }

  const keywords = (results as KeywordPerformanceResult[]).map((r) => ({
    keyword: r.adGroupCriterion.keyword.text,
    matchType: r.adGroupCriterion.keyword.matchType,
    status: r.adGroupCriterion.status,
    campaignId: r.campaign.id,
    campaignName: r.campaign.name,
    adGroupId: r.adGroup.id,
    adGroupName: r.adGroup.name,
    impressions: parseInt(r.metrics.impressions || '0', 10),
    clicks: parseInt(r.metrics.clicks || '0', 10),
    cost: (parseInt(r.metrics.costMicros || '0', 10) / 1000000).toFixed(2),
    conversions: r.metrics.conversions || 0,
    ctr: r.metrics.ctr || 0,
    averageCpc: r.metrics.averageCpc
      ? (parseInt(r.metrics.averageCpc, 10) / 1000000).toFixed(2)
      : '0.00',
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            dateFilter,
            count: keywords.length,
            keywords,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsGetSearchTermsReport(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const campaignId = args.campaign_id as string | undefined;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  const dateFilter = buildDateFilter(args);

  let query = `
    SELECT
      search_term_view.search_term,
      search_term_view.status,
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr
    FROM search_term_view
    WHERE ${dateFilter}
  `;

  if (campaignId) {
    query += ` AND campaign.id = ${campaignId}`;
  }

  const results = await runGaqlQuery(client, customerId, query);

  interface SearchTermResult {
    searchTermView: {
      searchTerm: string;
      status: string;
    };
    campaign: {
      id: string;
      name: string;
    };
    adGroup: {
      id: string;
      name: string;
    };
    metrics: {
      impressions: string;
      clicks: string;
      costMicros: string;
      conversions: number;
      ctr: number;
    };
  }

  const searchTerms = (results as SearchTermResult[]).map((r) => ({
    searchTerm: r.searchTermView.searchTerm,
    status: r.searchTermView.status,
    campaignId: r.campaign.id,
    campaignName: r.campaign.name,
    adGroupId: r.adGroup.id,
    adGroupName: r.adGroup.name,
    impressions: parseInt(r.metrics.impressions || '0', 10),
    clicks: parseInt(r.metrics.clicks || '0', 10),
    cost: (parseInt(r.metrics.costMicros || '0', 10) / 1000000).toFixed(2),
    conversions: r.metrics.conversions || 0,
    ctr: r.metrics.ctr || 0,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            dateFilter,
            count: searchTerms.length,
            searchTerms,
          },
          null,
          2
        ),
      },
    ],
  };
}
