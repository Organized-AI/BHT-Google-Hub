/**
 * GA4 Audience Tools
 * - ga4_list_audiences: List all audiences for a property
 * - ga4_get_audience: Get audience details
 *
 * Uses GA4 Admin API: https://analyticsadmin.googleapis.com/v1beta
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

// Types for GA4 Audiences
interface AudienceFilterExpression {
  // Simplified - actual structure is more complex
  [key: string]: unknown;
}

interface AudienceFilterClause {
  clauseType: 'INCLUDE' | 'EXCLUDE';
  simpleFilter?: AudienceFilterExpression;
  sequenceFilter?: AudienceFilterExpression;
}

interface GA4Audience {
  name: string; // Format: properties/{propertyId}/audiences/{audienceId}
  displayName: string;
  description?: string;
  membershipDurationDays: number;
  adsPersonalizationEnabled: boolean;
  eventTrigger?: {
    eventName: string;
    logCondition: 'LOG_CONDITION_UNSPECIFIED' | 'AUDIENCE_JOINED' | 'AUDIENCE_MEMBERSHIP_RENEWED';
  };
  exclusionDurationMode?: 'AUDIENCE_EXCLUSION_DURATION_MODE_UNSPECIFIED' | 'EXCLUDE_TEMPORARILY' | 'EXCLUDE_PERMANENTLY';
  filterClauses?: AudienceFilterClause[];
}

interface GA4AudiencesListResponse {
  audiences?: GA4Audience[];
  nextPageToken?: string;
}

// Tool Definitions
export const ga4AudienceTools = [
  {
    name: 'ga4_list_audiences',
    description: 'List all audiences defined for a GA4 property.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        property_id: {
          type: 'string',
          description: 'The GA4 property ID (numeric ID only, e.g., "123456789").',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of audiences to return (default: 50, max: 200).',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination to get the next page of results.',
        },
      },
      required: ['user_id', 'property_id'],
    },
  },
  {
    name: 'ga4_get_audience',
    description: 'Get detailed information about a specific GA4 audience.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        property_id: {
          type: 'string',
          description: 'The GA4 property ID (numeric ID only, e.g., "123456789").',
        },
        audience_id: {
          type: 'string',
          description: 'The audience ID (numeric ID only, e.g., "987654321").',
        },
      },
      required: ['user_id', 'property_id', 'audience_id'],
    },
  },
];

// Helper to extract audience ID from resource name
function extractAudienceId(resourceName: string): string {
  const parts = resourceName.split('/');
  return parts[parts.length - 1];
}

// Helper to format audience response
function formatAudience(audience: GA4Audience) {
  return {
    audienceId: extractAudienceId(audience.name),
    displayName: audience.displayName,
    description: audience.description || null,
    membershipDurationDays: audience.membershipDurationDays,
    adsPersonalizationEnabled: audience.adsPersonalizationEnabled,
    eventTrigger: audience.eventTrigger || null,
    exclusionDurationMode: audience.exclusionDurationMode || null,
    filterClausesCount: audience.filterClauses?.length || 0,
  };
}

// Tool Handlers
export async function handleGa4ListAudiences(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const pageSize = Math.min((args.page_size as number) || 50, 200);
  const pageToken = args.page_token as string | undefined;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  // Remove "properties/" prefix if provided
  const cleanPropertyId = propertyId.replace('properties/', '');

  let url = `${GA4_ADMIN_API}/properties/${cleanPropertyId}/audiences?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GA4AudiencesListResponse>(url);

  const audiences = (response.audiences || []).map(formatAudience);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            count: audiences.length,
            audiences,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4GetAudience(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const audienceId = args.audience_id as string;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  if (!audienceId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'audience_id is required' }) }],
      isError: true,
    };
  }

  // Remove prefixes if provided
  const cleanPropertyId = propertyId.replace('properties/', '');
  const cleanAudienceId = audienceId.replace('audiences/', '');

  const response = await client.get<GA4Audience>(
    `${GA4_ADMIN_API}/properties/${cleanPropertyId}/audiences/${cleanAudienceId}`
  );

  // Return full audience details including filter clauses
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            audienceId: cleanAudienceId,
            displayName: response.displayName,
            description: response.description || null,
            membershipDurationDays: response.membershipDurationDays,
            adsPersonalizationEnabled: response.adsPersonalizationEnabled,
            eventTrigger: response.eventTrigger || null,
            exclusionDurationMode: response.exclusionDurationMode || null,
            filterClauses: response.filterClauses || [],
          },
          null,
          2
        ),
      },
    ],
  };
}
