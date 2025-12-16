/**
 * GA4 Property Management Tools
 * - ga4_list_properties: List all accessible GA4 properties
 * - ga4_get_property: Get property details by ID
 *
 * Uses GA4 Admin API: https://analyticsadmin.googleapis.com/v1beta
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

// Types for GA4 Admin API
interface GA4Property {
  name: string; // Format: properties/{propertyId}
  propertyType: 'PROPERTY_TYPE_UNSPECIFIED' | 'PROPERTY_TYPE_ORDINARY' | 'PROPERTY_TYPE_SUBPROPERTY' | 'PROPERTY_TYPE_ROLLUP';
  createTime: string;
  updateTime: string;
  parent?: string;
  displayName: string;
  industryCategory?: string;
  timeZone: string;
  currencyCode: string;
  serviceLevel?: 'SERVICE_LEVEL_UNSPECIFIED' | 'GOOGLE_ANALYTICS_STANDARD' | 'GOOGLE_ANALYTICS_360';
  account: string;
}

interface GA4Account {
  name: string; // Format: accounts/{accountId}
  displayName: string;
  createTime: string;
  updateTime: string;
  regionCode?: string;
}

interface GA4AccountsListResponse {
  accounts?: GA4Account[];
  nextPageToken?: string;
}

interface GA4PropertiesListResponse {
  properties?: GA4Property[];
  nextPageToken?: string;
}

// Tool Definitions
export const ga4PropertyTools = [
  {
    name: 'ga4_list_properties',
    description: 'List all accessible GA4 properties. Returns property IDs, names, and configuration details.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        account_id: {
          type: 'string',
          description: 'Optional: Filter by specific GA4 account ID. If not provided, lists properties from all accessible accounts.',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of properties to return (default: 50, max: 200).',
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
    name: 'ga4_get_property',
    description: 'Get detailed information about a specific GA4 property.',
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
      },
      required: ['user_id', 'property_id'],
    },
  },
];

// Helper to extract property ID from resource name
function extractPropertyId(resourceName: string): string {
  return resourceName.replace('properties/', '');
}

// Helper to extract account ID from resource name
function extractAccountId(resourceName: string): string {
  return resourceName.replace('accounts/', '');
}

// Tool Handlers
export async function handleGa4ListProperties(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const pageSize = Math.min((args.page_size as number) || 50, 200);
  const pageToken = args.page_token as string | undefined;
  const accountId = args.account_id as string | undefined;

  let allProperties: GA4Property[] = [];
  let nextPageToken: string | undefined;

  if (accountId) {
    // List properties for a specific account
    const filter = `parent:accounts/${accountId}`;
    let url = `${GA4_ADMIN_API}/properties?filter=${encodeURIComponent(filter)}&pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const response = await client.get<GA4PropertiesListResponse>(url);
    allProperties = response.properties || [];
    nextPageToken = response.nextPageToken;
  } else {
    // First get all accounts, then get properties for each
    const accountsResponse = await client.get<GA4AccountsListResponse>(`${GA4_ADMIN_API}/accounts`);
    const accounts = accountsResponse.accounts || [];

    // Get properties for all accounts
    for (const account of accounts) {
      const accountIdFromName = extractAccountId(account.name);
      const filter = `parent:accounts/${accountIdFromName}`;
      let url = `${GA4_ADMIN_API}/properties?filter=${encodeURIComponent(filter)}&pageSize=${pageSize}`;

      try {
        const response = await client.get<GA4PropertiesListResponse>(url);
        if (response.properties) {
          allProperties.push(...response.properties);
        }
      } catch (error) {
        // Continue to next account on error
        console.error(`Error fetching properties for account ${accountIdFromName}:`, error);
      }
    }
  }

  const properties = allProperties.map((p) => ({
    propertyId: extractPropertyId(p.name),
    displayName: p.displayName,
    propertyType: p.propertyType,
    timeZone: p.timeZone,
    currencyCode: p.currencyCode,
    serviceLevel: p.serviceLevel,
    industryCategory: p.industryCategory,
    account: p.account,
    createTime: p.createTime,
    updateTime: p.updateTime,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: properties.length,
            properties,
            nextPageToken: nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4GetProperty(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  // Remove "properties/" prefix if provided
  const cleanPropertyId = propertyId.replace('properties/', '');

  const response = await client.get<GA4Property>(
    `${GA4_ADMIN_API}/properties/${cleanPropertyId}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: extractPropertyId(response.name),
            displayName: response.displayName,
            propertyType: response.propertyType,
            timeZone: response.timeZone,
            currencyCode: response.currencyCode,
            serviceLevel: response.serviceLevel,
            industryCategory: response.industryCategory,
            account: response.account,
            parent: response.parent || null,
            createTime: response.createTime,
            updateTime: response.updateTime,
          },
          null,
          2
        ),
      },
    ],
  };
}
