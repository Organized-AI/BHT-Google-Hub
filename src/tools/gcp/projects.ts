/**
 * GCP Project Management Tools
 * - gcp_list_projects: List all accessible GCP projects
 * - gcp_get_project: Get project details by ID
 */

import { GoogleApiClient } from '../../lib/google-api-client';

// Types for Google Cloud Resource Manager API
interface GcpProject {
  projectId: string;
  projectNumber: string;
  name: string;
  lifecycleState: 'ACTIVE' | 'DELETE_REQUESTED' | 'DELETE_IN_PROGRESS';
  createTime: string;
  parent?: {
    type: string;
    id: string;
  };
  labels?: Record<string, string>;
}

interface GcpProjectsListResponse {
  projects?: GcpProject[];
  nextPageToken?: string;
}

// Tool Definitions
export const gcpProjectTools = [
  {
    name: 'gcp_list_projects',
    description: 'List all accessible GCP projects. Returns project IDs, names, and lifecycle states.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        page_size: {
          type: 'number',
          description: 'Maximum number of projects to return (default: 100).',
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
    name: 'gcp_get_project',
    description: 'Get detailed information about a specific GCP project.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The authenticated user ID (ghub_xxx token) to use for this request.',
        },
        project_id: {
          type: 'string',
          description: 'The GCP project ID to retrieve.',
        },
      },
      required: ['user_id', 'project_id'],
    },
  },
];

// Tool Handlers
export async function handleGcpListProjects(
  client: GoogleApiClient,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const pageSize = (args.page_size as number) || 100;
  const pageToken = args.page_token as string | undefined;

  let url = `https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=${pageSize}`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const response = await client.get<GcpProjectsListResponse>(url);

  const projects = (response.projects || []).map((p) => ({
    projectId: p.projectId,
    name: p.name,
    projectNumber: p.projectNumber,
    lifecycleState: p.lifecycleState,
    createTime: p.createTime,
    labels: p.labels || {},
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            count: projects.length,
            projects,
            nextPageToken: response.nextPageToken || null,
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function handleGcpGetProject(
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

  const response = await client.get<GcpProject>(
    `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            projectId: response.projectId,
            name: response.name,
            projectNumber: response.projectNumber,
            lifecycleState: response.lifecycleState,
            createTime: response.createTime,
            parent: response.parent || null,
            labels: response.labels || {},
          },
          null,
          2
        ),
      },
    ],
  };
}
