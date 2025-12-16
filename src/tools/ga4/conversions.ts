/**
 * GA4 Conversion Event Tools
 * - ga4_list_conversion_events: List all conversion events for a property
 * - ga4_get_conversion_event: Get conversion event details
 *
 * Uses GA4 Admin API: https://analyticsadmin.googleapis.com/v1beta
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

// Types for GA4 Conversion Events
interface GA4ConversionEvent {
  name: string; // Format: properties/{propertyId}/conversionEvents/{eventName}
  eventName: string;
  createTime?: string;
  deletable?: boolean;
  custom?: boolean;
  countingMethod?: 'CONVERSION_COUNTING_METHOD_UNSPECIFIED' | 'ONCE_PER_EVENT' | 'ONCE_PER_SESSION';
  defaultConversionValue?: {
    value?: number;
    currencyCode?: string;
  };
}

interface GA4ConversionEventsListResponse {
  conversionEvents?: GA4ConversionEvent[];
  nextPageToken?: string;
}

// Tool Definitions
export const ga4ConversionTools = [
  {
    name: 'ga4_list_conversion_events',
    description: 'List all conversion events defined for a GA4 property.',
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
          description: 'Maximum number of conversion events to return (default: 50, max: 200).',
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
    name: 'ga4_get_conversion_event',
    description: 'Get detailed information about a specific GA4 conversion event.',
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
        event_name: {
          type: 'string',
          description: 'The conversion event name (e.g., "purchase", "sign_up").',
        },
      },
      required: ['user_id', 'property_id', 'event_name'],
    },
  },
];

// Helper to extract event name from resource name
function extractEventName(resourceName: string): string {
  const parts = resourceName.split('/');
  return parts[parts.length - 1];
}

// Helper to format conversion event response
function formatConversionEvent(event: GA4ConversionEvent) {
  return {
    eventName: event.eventName || extractEventName(event.name),
    countingMethod: event.countingMethod || 'ONCE_PER_EVENT',
    createTime: event.createTime || null,
    deletable: event.deletable ?? true,
    custom: event.custom ?? true,
    defaultConversionValue: event.defaultConversionValue || null,
  };
}

// Tool Handlers
export async function handleGa4ListConversionEvents(
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

  let url = `${GA4_ADMIN_API}/properties/${cleanPropertyId}/conversionEvents?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GA4ConversionEventsListResponse>(url);

  const conversionEvents = (response.conversionEvents || []).map(formatConversionEvent);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            count: conversionEvents.length,
            conversionEvents,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4GetConversionEvent(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const eventName = args.event_name as string;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  if (!eventName) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'event_name is required' }) }],
      isError: true,
    };
  }

  // Remove "properties/" prefix if provided
  const cleanPropertyId = propertyId.replace('properties/', '');
  // Remove "conversionEvents/" prefix if provided
  const cleanEventName = eventName.replace('conversionEvents/', '');

  const response = await client.get<GA4ConversionEvent>(
    `${GA4_ADMIN_API}/properties/${cleanPropertyId}/conversionEvents/${cleanEventName}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            ...formatConversionEvent(response),
          },
          null,
          2
        ),
      },
    ],
  };
}
