/**
 * GA4 Data Stream Tools
 * - ga4_list_data_streams: List all data streams for a property
 * - ga4_get_data_stream: Get data stream details
 *
 * Uses GA4 Admin API: https://analyticsadmin.googleapis.com/v1beta
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GA4_ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

// Types for GA4 Data Streams
interface WebStreamData {
  measurementId: string;
  firebaseAppId?: string;
  defaultUri: string;
}

interface AndroidAppStreamData {
  firebaseAppId: string;
  packageName: string;
}

interface IosAppStreamData {
  firebaseAppId: string;
  bundleId: string;
}

interface GA4DataStream {
  name: string; // Format: properties/{propertyId}/dataStreams/{dataStreamId}
  type: 'DATA_STREAM_TYPE_UNSPECIFIED' | 'WEB_DATA_STREAM' | 'ANDROID_APP_DATA_STREAM' | 'IOS_APP_DATA_STREAM';
  displayName: string;
  createTime: string;
  updateTime: string;
  webStreamData?: WebStreamData;
  androidAppStreamData?: AndroidAppStreamData;
  iosAppStreamData?: IosAppStreamData;
}

interface GA4DataStreamsListResponse {
  dataStreams?: GA4DataStream[];
  nextPageToken?: string;
}

// Tool Definitions
export const ga4DataStreamTools = [
  {
    name: 'ga4_list_data_streams',
    description: 'List all data streams for a GA4 property. Includes web, iOS, and Android app streams.',
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
          description: 'Maximum number of data streams to return (default: 50, max: 200).',
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
    name: 'ga4_get_data_stream',
    description: 'Get detailed information about a specific GA4 data stream.',
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
        data_stream_id: {
          type: 'string',
          description: 'The data stream ID (numeric ID only, e.g., "987654321").',
        },
      },
      required: ['user_id', 'property_id', 'data_stream_id'],
    },
  },
];

// Helper to extract data stream ID from resource name
function extractDataStreamId(resourceName: string): string {
  const parts = resourceName.split('/');
  return parts[parts.length - 1];
}

// Helper to format data stream response
function formatDataStream(ds: GA4DataStream) {
  const base = {
    dataStreamId: extractDataStreamId(ds.name),
    displayName: ds.displayName,
    type: ds.type,
    createTime: ds.createTime,
    updateTime: ds.updateTime,
  };

  // Add type-specific data
  if (ds.webStreamData) {
    return {
      ...base,
      measurementId: ds.webStreamData.measurementId,
      defaultUri: ds.webStreamData.defaultUri,
      firebaseAppId: ds.webStreamData.firebaseAppId,
    };
  } else if (ds.androidAppStreamData) {
    return {
      ...base,
      firebaseAppId: ds.androidAppStreamData.firebaseAppId,
      packageName: ds.androidAppStreamData.packageName,
    };
  } else if (ds.iosAppStreamData) {
    return {
      ...base,
      firebaseAppId: ds.iosAppStreamData.firebaseAppId,
      bundleId: ds.iosAppStreamData.bundleId,
    };
  }

  return base;
}

// Tool Handlers
export async function handleGa4ListDataStreams(
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

  let url = `${GA4_ADMIN_API}/properties/${cleanPropertyId}/dataStreams?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GA4DataStreamsListResponse>(url);

  const dataStreams = (response.dataStreams || []).map(formatDataStream);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            count: dataStreams.length,
            dataStreams,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4GetDataStream(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const dataStreamId = args.data_stream_id as string;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  if (!dataStreamId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'data_stream_id is required' }) }],
      isError: true,
    };
  }

  // Remove prefixes if provided
  const cleanPropertyId = propertyId.replace('properties/', '');
  const cleanDataStreamId = dataStreamId.replace('dataStreams/', '');

  const response = await client.get<GA4DataStream>(
    `${GA4_ADMIN_API}/properties/${cleanPropertyId}/dataStreams/${cleanDataStreamId}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            ...formatDataStream(response),
          },
          null,
          2
        ),
      },
    ],
  };
}
