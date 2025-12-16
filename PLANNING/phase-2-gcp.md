# Phase 2: GCP Tools Implementation (8 Tools)

## Objective
Implement Google Cloud Platform foundation tools for project and resource management.

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp/packages/mcp-server

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are implementing GCP tools for the Google Marketing Hub Remote MCP Server.

## Context
- Remote MCP on Cloudflare Workers
- Use GoogleApiClient from Phase 1 for all API calls
- Follow existing tool patterns in src/index.ts
- All tools prefixed with gcp_

## Tools to Implement (8 total)

### Project Management
1. gcp_list_projects
   - List all accessible GCP projects
   - API: GET https://cloudresourcemanager.googleapis.com/v1/projects
   - Returns: projectId, name, lifecycleState

2. gcp_get_project
   - Get project details
   - Params: projectId
   - API: GET https://cloudresourcemanager.googleapis.com/v1/projects/{projectId}

### Service Account Management
3. gcp_list_service_accounts
   - List service accounts in a project
   - Params: projectId
   - API: GET https://iam.googleapis.com/v1/projects/{projectId}/serviceAccounts

4. gcp_get_service_account
   - Get service account details
   - Params: projectId, serviceAccountEmail
   - API: GET https://iam.googleapis.com/v1/projects/{projectId}/serviceAccounts/{email}

### API Management
5. gcp_list_enabled_apis
   - List enabled APIs in a project
   - Params: projectId
   - API: GET https://serviceusage.googleapis.com/v1/projects/{projectId}/services?filter=state:ENABLED

6. gcp_enable_api
   - Enable an API in a project
   - Params: projectId, serviceName
   - API: POST https://serviceusage.googleapis.com/v1/projects/{projectId}/services/{serviceName}:enable

### Billing
7. gcp_get_billing_info
   - Get billing info for a project
   - Params: projectId
   - API: GET https://cloudbilling.googleapis.com/v1/projects/{projectId}/billingInfo

8. gcp_list_billing_accounts
   - List accessible billing accounts
   - API: GET https://cloudbilling.googleapis.com/v1/billingAccounts

## File Structure
Create: src/tools/gcp/
- index.ts (exports all GCP tools)
- projects.ts (gcp_list_projects, gcp_get_project)
- service-accounts.ts (gcp_list_service_accounts, gcp_get_service_account)
- apis.ts (gcp_list_enabled_apis, gcp_enable_api)
- billing.ts (gcp_get_billing_info, gcp_list_billing_accounts)

## Tool Definition Pattern
```typescript
export const gcpListProjects: ToolDefinition = {
  name: 'gcp_list_projects',
  description: 'List all accessible GCP projects',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function handleGcpListProjects(
  client: GoogleApiClient,
  params: Record<string, unknown>
): Promise<ToolResult> {
  const response = await client.request<GcpProjectsResponse>(
    'https://cloudresourcemanager.googleapis.com/v1/projects'
  );
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(response.projects, null, 2)
    }]
  };
}
```

## Update src/index.ts
- Import GCP tool definitions
- Add to TOOL_DEFINITIONS array
- Add handlers to tool routing switch

## Validation
- [ ] All 8 tools defined with proper schemas
- [ ] Tools return formatted JSON responses
- [ ] Error handling for API failures
- [ ] tools/list includes all gcp_ tools
- [ ] Tools work end-to-end from Claude Desktop
```

## Success Criteria
- All 8 GCP tools implemented and working
- Proper error handling for missing permissions
- Formatted responses that Claude can interpret
