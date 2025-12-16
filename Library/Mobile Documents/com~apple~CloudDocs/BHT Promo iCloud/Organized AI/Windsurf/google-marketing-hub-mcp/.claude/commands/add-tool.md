# Add New MCP Tool

Generate boilerplate for a new MCP tool in the Google Marketing Hub.

## Usage
```
/add-tool <tool_name>
```

## Tool Naming Convention
```
ghub_<service>_<action>

Services: auth, gcp, ga4, gtm, gads
Actions: list, get, create, update, delete, run
```

## Tool Definition Template

Add to the appropriate handler file (src/handlers/<service>.ts):

```typescript
// Tool Definition (add to TOOLS array)
{
  name: "ghub_<service>_<action>",
  description: "Description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      // Add required parameters
      requiredParam: {
        type: "string",
        description: "Description of the parameter"
      },
      // Add optional parameters
      optionalParam: {
        type: "string",
        description: "Optional parameter description"
      }
    },
    required: ["requiredParam"]
  }
}
```

## Handler Function Template

```typescript
async function handle<ToolName>(
  args: { requiredParam: string; optionalParam?: string },
  client: GoogleApiClient
): Promise<MCPResponse> {
  try {
    const response = await client.fetch(
      `https://api.googleapis.com/v1/endpoint/${args.requiredParam}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ error: error.error?.message || 'API Error' })
        }],
        isError: true
      };
    }

    const data = await response.json();
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message })
      }],
      isError: true
    };
  }
}
```

## Add to Router

In the main handler switch statement:

```typescript
case 'ghub_<service>_<action>':
  return await handle<ToolName>(args, client);
```

## Google API Reference URLs

| Service | API Documentation |
|---------|-------------------|
| GCP | https://cloud.google.com/resource-manager/reference/rest |
| GA4 Admin | https://developers.google.com/analytics/devguides/config/admin/v1/rest |
| GA4 Data | https://developers.google.com/analytics/devguides/reporting/data/v1/rest |
| GTM | https://developers.google.com/tag-platform/tag-manager/api/v2/reference |
| Google Ads | https://developers.google.com/google-ads/api/reference/rpc |
