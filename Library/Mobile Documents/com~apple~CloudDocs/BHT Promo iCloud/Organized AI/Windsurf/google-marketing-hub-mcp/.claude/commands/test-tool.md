---
description: Test a specific MCP tool with sample data
allowed-tools: Bash(curl:*), Bash(npx wrangler:*)
---

Test the specified Google Marketing Hub MCP tool: $ARGUMENTS

## Usage
```
/test-tool <tool_name> [--live]
```

## Test Modes

### Local Testing (Default)
Uses `wrangler dev` on localhost:8787

```bash
# Start local dev server
npx wrangler dev &

# Wait for server
sleep 3

# Test tool
curl -X POST http://localhost:8787/message \
  -H "Content-Type: application/json" \
  -H "X-MCP-Token: ghub_test_token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "<TOOL_NAME>",
      "arguments": {}
    }
  }'
```

### Live Testing (--live flag)
Tests against deployed Worker

```bash
curl -X POST https://google-marketing-hub-mcp.workers.dev/message \
  -H "Content-Type: application/json" \
  -H "X-MCP-Token: $GHUB_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "<TOOL_NAME>",
      "arguments": {}
    }
  }'
```

## Sample Arguments by Tool

### Auth Tools
- `ghub_auth_status`: `{}`
- `ghub_auth_init`: `{}`

### GCP Tools
- `ghub_gcp_list_projects`: `{"pageSize": 10}`
- `ghub_gcp_get_project`: `{"projectId": "my-project"}`

### GA4 Tools
- `ghub_ga4_list_properties`: `{}`
- `ghub_ga4_run_report`: `{"propertyId": "123456", "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}], "metrics": ["activeUsers"]}`

### GTM Tools
- `ghub_gtm_list_accounts`: `{}`
- `ghub_gtm_list_containers`: `{"accountId": "123456"}`

### Google Ads Tools
- `ghub_gads_list_customers`: `{}`
- `ghub_gads_gaql_query`: `{"customerId": "123-456-7890", "query": "SELECT campaign.name FROM campaign LIMIT 5"}`

## Verify Response Format

Expected successful response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {"type": "text", "text": "..."}
    ]
  }
}
```

Expected error response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32001,
    "message": "Token not found"
  }
}
```
