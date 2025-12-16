/**
 * Google Ads Account Health Tools
 * - gads_get_change_history: Get recent account changes
 * - gads_get_recommendations: Get account recommendations
 *
 * Uses Google Ads API v18: https://googleads.googleapis.com/v18
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GADS_API = 'https://googleads.googleapis.com/v18';

// Types for Google Ads Health
interface SearchStreamResponse {
  results?: Array<Record<string, unknown>>;
}

// Valid date range presets
const DATE_RANGE_PRESETS = [
  'TODAY',
  'YESTERDAY',
  'LAST_7_DAYS',
  'LAST_14_DAYS',
  'LAST_30_DAYS',
];

// Tool Definitions
export const gadsHealthTools = [
  {
    name: 'gads_get_change_history',
    description:
      'Get recent change history for a Google Ads account, showing who made what changes and when.',
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
            'Predefined date range for the report. Default: LAST_7_DAYS.',
        },
        resource_type: {
          type: 'string',
          enum: ['CAMPAIGN', 'AD_GROUP', 'AD', 'CRITERION', 'ALL'],
          description: 'Filter by resource type. Default: ALL.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of changes to return. Default: 100.',
        },
      },
      required: ['user_id', 'customer_id'],
    },
  },
  {
    name: 'gads_get_recommendations',
    description:
      'Get Google Ads recommendations to improve account performance. Shows optimization suggestions from Google.',
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
        recommendation_type: {
          type: 'string',
          enum: [
            'CAMPAIGN_BUDGET',
            'KEYWORD',
            'TEXT_AD',
            'TARGET_CPA_OPT_IN',
            'MAXIMIZE_CONVERSIONS_OPT_IN',
            'ENHANCED_CPC_OPT_IN',
            'SEARCH_PARTNERS_OPT_IN',
            'MAXIMIZE_CLICKS_OPT_IN',
            'OPTIMIZE_AD_ROTATION',
            'KEYWORD_MATCH_TYPE',
            'MOVE_UNUSED_BUDGET',
            'ALL',
          ],
          description: 'Filter by recommendation type. Default: ALL.',
        },
        include_dismissed: {
          type: 'boolean',
          description: 'Include dismissed recommendations. Default: false.',
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
export async function handleGadsGetChangeHistory(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const dateRange = (args.date_range as string) || 'LAST_7_DAYS';
  const resourceType = args.resource_type as string | undefined;
  const limit = (args.limit as number) || 100;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  let query = `
    SELECT
      change_event.change_date_time,
      change_event.change_resource_type,
      change_event.change_resource_name,
      change_event.client_type,
      change_event.user_email,
      change_event.changed_fields,
      change_event.old_resource,
      change_event.new_resource
    FROM change_event
    WHERE change_event.change_date_time DURING ${dateRange}
  `;

  if (resourceType && resourceType !== 'ALL') {
    query += ` AND change_event.change_resource_type = '${resourceType}'`;
  }

  query += ` ORDER BY change_event.change_date_time DESC`;
  query += ` LIMIT ${limit}`;

  const results = await runGaqlQuery(client, customerId, query);

  interface ChangeEventResult {
    changeEvent: {
      changeDateTime: string;
      changeResourceType: string;
      changeResourceName: string;
      clientType: string;
      userEmail: string;
      changedFields: string[];
      oldResource?: Record<string, unknown>;
      newResource?: Record<string, unknown>;
    };
  }

  const changes = (results as ChangeEventResult[]).map((r) => ({
    changeDateTime: r.changeEvent.changeDateTime,
    resourceType: r.changeEvent.changeResourceType,
    resourceName: r.changeEvent.changeResourceName,
    clientType: r.changeEvent.clientType,
    userEmail: r.changeEvent.userEmail || 'Unknown',
    changedFields: r.changeEvent.changedFields || [],
    oldResource: r.changeEvent.oldResource || null,
    newResource: r.changeEvent.newResource || null,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            dateRange,
            count: changes.length,
            changes,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGadsGetRecommendations(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const customerId = (args.customer_id as string)?.replace(/-/g, '');
  const recommendationType = args.recommendation_type as string | undefined;
  const includeDismissed = (args.include_dismissed as boolean) || false;

  if (!customerId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'customer_id is required' }) }],
      isError: true,
    };
  }

  let query = `
    SELECT
      recommendation.resource_name,
      recommendation.type,
      recommendation.impact,
      recommendation.campaign_budget_recommendation,
      recommendation.keyword_recommendation,
      recommendation.text_ad_recommendation,
      recommendation.target_cpa_opt_in_recommendation,
      recommendation.maximize_conversions_opt_in_recommendation,
      recommendation.campaign,
      recommendation.ad_group,
      recommendation.dismissed
    FROM recommendation
  `;

  const conditions: string[] = [];

  if (!includeDismissed) {
    conditions.push('recommendation.dismissed = FALSE');
  }

  if (recommendationType && recommendationType !== 'ALL') {
    conditions.push(`recommendation.type = '${recommendationType}'`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  const results = await runGaqlQuery(client, customerId, query);

  interface RecommendationResult {
    recommendation: {
      resourceName: string;
      type: string;
      impact: {
        baseMetrics?: {
          impressions?: number;
          clicks?: number;
          costMicros?: string;
          conversions?: number;
        };
        potentialMetrics?: {
          impressions?: number;
          clicks?: number;
          costMicros?: string;
          conversions?: number;
        };
      };
      campaignBudgetRecommendation?: {
        currentBudgetAmountMicros?: string;
        recommendedBudgetAmountMicros?: string;
      };
      keywordRecommendation?: {
        keyword?: {
          text: string;
          matchType: string;
        };
        recommendedCpcBidMicros?: string;
      };
      textAdRecommendation?: {
        ad?: Record<string, unknown>;
      };
      targetCpaOptInRecommendation?: {
        targetCpaMicros?: string;
      };
      maximizeConversionsOptInRecommendation?: Record<string, unknown>;
      campaign?: string;
      adGroup?: string;
      dismissed: boolean;
    };
  }

  const recommendations = (results as RecommendationResult[]).map((r) => {
    const rec = r.recommendation;
    const impact = rec.impact || {};

    const formatted: Record<string, unknown> = {
      resourceName: rec.resourceName,
      type: rec.type,
      dismissed: rec.dismissed,
      campaign: rec.campaign || null,
      adGroup: rec.adGroup || null,
      impact: {
        baseMetrics: impact.baseMetrics || null,
        potentialMetrics: impact.potentialMetrics || null,
      },
    };

    // Add type-specific recommendation details
    if (rec.campaignBudgetRecommendation) {
      formatted.budgetRecommendation = {
        currentBudget: rec.campaignBudgetRecommendation.currentBudgetAmountMicros
          ? (
              parseInt(rec.campaignBudgetRecommendation.currentBudgetAmountMicros, 10) / 1000000
            ).toFixed(2)
          : null,
        recommendedBudget: rec.campaignBudgetRecommendation.recommendedBudgetAmountMicros
          ? (
              parseInt(rec.campaignBudgetRecommendation.recommendedBudgetAmountMicros, 10) / 1000000
            ).toFixed(2)
          : null,
      };
    }

    if (rec.keywordRecommendation) {
      formatted.keywordRecommendation = {
        keyword: rec.keywordRecommendation.keyword?.text || null,
        matchType: rec.keywordRecommendation.keyword?.matchType || null,
        recommendedCpcBid: rec.keywordRecommendation.recommendedCpcBidMicros
          ? (parseInt(rec.keywordRecommendation.recommendedCpcBidMicros, 10) / 1000000).toFixed(2)
          : null,
      };
    }

    if (rec.targetCpaOptInRecommendation) {
      formatted.targetCpaRecommendation = {
        targetCpa: rec.targetCpaOptInRecommendation.targetCpaMicros
          ? (parseInt(rec.targetCpaOptInRecommendation.targetCpaMicros, 10) / 1000000).toFixed(2)
          : null,
      };
    }

    return formatted;
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            customerId,
            includeDismissed,
            count: recommendations.length,
            recommendations,
          },
          null,
          2
        ),
      },
    ],
  };
}
