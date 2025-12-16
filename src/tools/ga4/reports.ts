/**
 * GA4 Reporting Tools
 * - ga4_run_report: Run a custom GA4 report
 * - ga4_run_realtime_report: Run a realtime report
 * - ga4_get_metadata: Get available dimensions and metrics
 *
 * Uses GA4 Data API: https://analyticsdata.googleapis.com/v1beta
 */

import { GoogleApiClient } from '../../lib/google-api-client';

const GA4_DATA_API = 'https://analyticsdata.googleapis.com/v1beta';

// Types for GA4 Data API
interface DateRange {
  startDate: string;
  endDate: string;
}

interface Dimension {
  name: string;
}

interface Metric {
  name: string;
}

interface DimensionHeader {
  name: string;
}

interface MetricHeader {
  name: string;
  type: string;
}

interface DimensionValue {
  value: string;
}

interface MetricValue {
  value: string;
}

interface Row {
  dimensionValues?: DimensionValue[];
  metricValues?: MetricValue[];
}

interface GA4ReportResponse {
  dimensionHeaders?: DimensionHeader[];
  metricHeaders?: MetricHeader[];
  rows?: Row[];
  rowCount?: number;
  metadata?: {
    currencyCode?: string;
    timeZone?: string;
  };
}

interface GA4RealtimeReportResponse {
  dimensionHeaders?: DimensionHeader[];
  metricHeaders?: MetricHeader[];
  rows?: Row[];
  rowCount?: number;
}

interface MetadataItem {
  apiName: string;
  uiName: string;
  description: string;
  deprecatedApiNames?: string[];
  customDefinition?: boolean;
  category?: string;
}

interface GA4MetadataResponse {
  name: string;
  dimensions?: MetadataItem[];
  metrics?: MetadataItem[];
}

// Tool Definitions
export const ga4ReportTools = [
  {
    name: 'ga4_run_report',
    description: 'Run a custom GA4 report. Supports date ranges, dimensions, and metrics for historical data analysis.',
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
        date_ranges: {
          type: 'array',
          description: 'Array of date ranges to query.',
          items: {
            type: 'object',
            properties: {
              start_date: {
                type: 'string',
                description: 'Start date (YYYY-MM-DD or relative like "7daysAgo", "30daysAgo", "yesterday").',
              },
              end_date: {
                type: 'string',
                description: 'End date (YYYY-MM-DD or "today", "yesterday").',
              },
            },
            required: ['start_date', 'end_date'],
          },
        },
        dimensions: {
          type: 'array',
          description: 'Dimensions to include (e.g., ["date", "sessionSource", "country"]). Max 9 dimensions.',
          items: { type: 'string' },
        },
        metrics: {
          type: 'array',
          description: 'Metrics to include (e.g., ["sessions", "totalUsers", "conversions"]). Required.',
          items: { type: 'string' },
        },
        limit: {
          type: 'number',
          description: 'Maximum rows to return (default: 10000, max: 100000).',
        },
        offset: {
          type: 'number',
          description: 'Row offset for pagination (default: 0).',
        },
      },
      required: ['user_id', 'property_id', 'date_ranges', 'metrics'],
    },
  },
  {
    name: 'ga4_run_realtime_report',
    description: 'Run a realtime GA4 report. Shows data from the last 30 minutes.',
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
        dimensions: {
          type: 'array',
          description: 'Realtime dimensions (e.g., ["country", "city", "unifiedScreenName"]). Max 9.',
          items: { type: 'string' },
        },
        metrics: {
          type: 'array',
          description: 'Realtime metrics (e.g., ["activeUsers", "screenPageViews"]). Required.',
          items: { type: 'string' },
        },
        limit: {
          type: 'number',
          description: 'Maximum rows to return (default: 1000, max: 100000).',
        },
      },
      required: ['user_id', 'property_id', 'metrics'],
    },
  },
  {
    name: 'ga4_get_metadata',
    description: 'Get available dimensions and metrics for a GA4 property. Useful for discovering what can be queried.',
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

// Helper to format report rows as a table
function formatReportRows(
  dimensionHeaders: DimensionHeader[] | undefined,
  metricHeaders: MetricHeader[] | undefined,
  rows: Row[] | undefined
): Array<Record<string, string | number>> {
  if (!rows) return [];

  return rows.map((row) => {
    const record: Record<string, string | number> = {};

    // Add dimension values
    if (dimensionHeaders && row.dimensionValues) {
      dimensionHeaders.forEach((header, index) => {
        record[header.name] = row.dimensionValues![index]?.value || '';
      });
    }

    // Add metric values (convert to numbers where possible)
    if (metricHeaders && row.metricValues) {
      metricHeaders.forEach((header, index) => {
        const value = row.metricValues![index]?.value || '0';
        // Try to parse as number if it looks like one
        const numValue = parseFloat(value);
        record[header.name] = isNaN(numValue) ? value : numValue;
      });
    }

    return record;
  });
}

// Tool Handlers
export async function handleGa4RunReport(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const dateRanges = args.date_ranges as Array<{ start_date: string; end_date: string }>;
  const dimensions = args.dimensions as string[] | undefined;
  const metrics = args.metrics as string[];
  const limit = Math.min((args.limit as number) || 10000, 100000);
  const offset = (args.offset as number) || 0;

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  if (!dateRanges || dateRanges.length === 0) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'date_ranges is required' }) }],
      isError: true,
    };
  }

  if (!metrics || metrics.length === 0) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'metrics is required' }) }],
      isError: true,
    };
  }

  // Remove "properties/" prefix if provided
  const cleanPropertyId = propertyId.replace('properties/', '');

  // Build request body
  const requestBody: {
    dateRanges: DateRange[];
    dimensions?: Dimension[];
    metrics: Metric[];
    limit: number;
    offset: number;
  } = {
    dateRanges: dateRanges.map((dr) => ({
      startDate: dr.start_date,
      endDate: dr.end_date,
    })),
    metrics: metrics.map((m) => ({ name: m })),
    limit,
    offset,
  };

  if (dimensions && dimensions.length > 0) {
    requestBody.dimensions = dimensions.map((d) => ({ name: d }));
  }

  const response = await client.post<GA4ReportResponse>(
    `${GA4_DATA_API}/properties/${cleanPropertyId}:runReport`,
    requestBody
  );

  const formattedRows = formatReportRows(
    response.dimensionHeaders,
    response.metricHeaders,
    response.rows
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            rowCount: response.rowCount || 0,
            dimensions: response.dimensionHeaders?.map((h) => h.name) || [],
            metrics: response.metricHeaders?.map((h) => ({ name: h.name, type: h.type })) || [],
            metadata: response.metadata,
            rows: formattedRows,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4RunRealtimeReport(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const propertyId = args.property_id as string;
  const dimensions = args.dimensions as string[] | undefined;
  const metrics = args.metrics as string[];
  const limit = Math.min((args.limit as number) || 1000, 100000);

  if (!propertyId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'property_id is required' }) }],
      isError: true,
    };
  }

  if (!metrics || metrics.length === 0) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'metrics is required' }) }],
      isError: true,
    };
  }

  // Remove "properties/" prefix if provided
  const cleanPropertyId = propertyId.replace('properties/', '');

  // Build request body
  const requestBody: {
    dimensions?: Dimension[];
    metrics: Metric[];
    limit: number;
  } = {
    metrics: metrics.map((m) => ({ name: m })),
    limit,
  };

  if (dimensions && dimensions.length > 0) {
    requestBody.dimensions = dimensions.map((d) => ({ name: d }));
  }

  const response = await client.post<GA4RealtimeReportResponse>(
    `${GA4_DATA_API}/properties/${cleanPropertyId}:runRealtimeReport`,
    requestBody
  );

  const formattedRows = formatReportRows(
    response.dimensionHeaders,
    response.metricHeaders,
    response.rows
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            description: 'Realtime data from the last 30 minutes',
            rowCount: response.rowCount || 0,
            dimensions: response.dimensionHeaders?.map((h) => h.name) || [],
            metrics: response.metricHeaders?.map((h) => ({ name: h.name, type: h.type })) || [],
            rows: formattedRows,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGa4GetMetadata(
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

  const response = await client.get<GA4MetadataResponse>(
    `${GA4_DATA_API}/properties/${cleanPropertyId}/metadata`
  );

  // Format dimensions and metrics for easier consumption
  const dimensions = (response.dimensions || []).map((d) => ({
    apiName: d.apiName,
    uiName: d.uiName,
    description: d.description,
    category: d.category,
    customDefinition: d.customDefinition || false,
  }));

  const metrics = (response.metrics || []).map((m) => ({
    apiName: m.apiName,
    uiName: m.uiName,
    description: m.description,
    category: m.category,
    customDefinition: m.customDefinition || false,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            propertyId: cleanPropertyId,
            dimensionCount: dimensions.length,
            metricCount: metrics.length,
            dimensions,
            metrics,
          },
          null,
          2
        ),
      },
    ],
  };
}
