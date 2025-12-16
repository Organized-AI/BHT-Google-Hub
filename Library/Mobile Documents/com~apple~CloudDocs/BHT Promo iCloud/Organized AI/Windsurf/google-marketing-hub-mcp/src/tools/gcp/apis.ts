/**
 * GCP API Management Tools
 * - gcp_list_enabled_apis: List enabled APIs in a project
 * - gcp_enable_api: Enable an API in a project
 */

import { GoogleApiClient } from '../../lib/google-api-client';

// Types for Service Usage API
interface GoogleService {
  name: string;
  config?: {
    name: string;
    title: string;
    documentation?: {
      summary?: string;
    };
  };
  state: 'ENABLED' | 'DISABLED';
  parent: string;
}

interface ServicesListResponse {
  services?: GoogleService[];
  nextPageToken?: string;
}

interface OperationResponse {
  name: string;
  done?: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: Record<string, unknown>;
}

// Tool Definitions
export const gcpApiTools = [
  {
    name: 'gcp_list_enabled_apis',
    description: 'List all enabled APIs/services in a GCP project.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID to list enabled APIs for.',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of services to return (default: 100).',
        },
        page_token: {
          type: 'string',
          description: 'Token for pagination.',
        },
      },
      required: ['user_id', 'project_id'],
    },
  },
  {
    name: 'gcp_enable_api',
    description: 'Enable an API/service in a GCP project. Common services: analytics.googleapis.com, tagmanager.googleapis.com, analyticsadmin.googleapis.com',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID.',
        },
        service_name: {
          type: 'string',
          description: 'The service name to enable (e.g., "analytics.googleapis.com").',
        },
      },
      required: ['user_id', 'project_id', 'service_name'],
    },
  },
];

// Tool Handlers
export async function handleGcpListEnabledApis(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const projectId = args.project_id as string;

  if (!projectId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'project_id is required' }) }],
      isError: true,
    };
  }

  const pageSize = (args.page_size as number) || 100;
  const pageToken = args.page_token as string | undefined;

  // Filter for ENABLED services only
  let url = `https://serviceusage.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/services?filter=state:ENABLED&pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<ServicesListResponse>(url);

  const services = (response.services || []).map((svc) => ({
    name: svc.config?.name || svc.name.split('/').pop(),
    title: svc.config?.title || null,
    description: svc.config?.documentation?.summary || null,
    state: svc.state,
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            projectId,
            count: services.length,
            enabledServices: services,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGcpEnableApi(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const projectId = args.project_id as string;
  const serviceName = args.service_name as string;

  if (!projectId) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'project_id is required' }) }],
      isError: true,
    };
  }

  if (!serviceName) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'service_name is required' }) }],
      isError: true,
    };
  }

  // Enable the service
  const response = await client.post<OperationResponse>(
    `https://serviceusage.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/services/${encodeURIComponent(serviceName)}:enable`,
    {}
  );

  // Check if operation completed successfully
  if (response.error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: response.error.message,
              code: response.error.code,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            projectId,
            serviceName,
            operationName: response.name,
            done: response.done || false,
            message: response.done
              ? `Service ${serviceName} is now enabled.`
              : `Service ${serviceName} is being enabled. Operation: ${response.name}`,
          },
          null,
          2
        ),
      },
    ],
  };
}
