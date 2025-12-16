# Phase 3: GA4 Tools Implementation (11 Tools)

## Objective
Implement Google Analytics 4 tools for property management, reporting, and configuration.

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp/packages/mcp-server

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are implementing GA4 tools for the Google Marketing Hub Remote MCP Server.

## Context
- Remote MCP on Cloudflare Workers
- Use GoogleApiClient for all API calls
- GA4 Admin API: https://analyticsadmin.googleapis.com/v1beta
- GA4 Data API: https://analyticsdata.googleapis.com/v1beta
- All tools prefixed with ga4_

## Tools to Implement (11 total)

### Property Management (Admin API)
1. ga4_list_properties
   - List GA4 properties accessible to user
   - API: GET /accounts/-/properties (with account filter)
   
2. ga4_get_property
   - Get property details
   - Params: propertyId
   - API: GET /properties/{propertyId}

3. ga4_list_data_streams
   - List data streams for a property
   - Params: propertyId
   - API: GET /properties/{propertyId}/dataStreams

4. ga4_get_data_stream
   - Get data stream details
   - Params: propertyId, dataStreamId
   - API: GET /properties/{propertyId}/dataStreams/{dataStreamId}

### Reporting (Data API)
5. ga4_run_report
   - Run a GA4 report
   - Params: propertyId, dateRanges, dimensions, metrics
   - API: POST /properties/{propertyId}:runReport

6. ga4_run_realtime_report
   - Run a realtime report
   - Params: propertyId, dimensions, metrics
   - API: POST /properties/{propertyId}:runRealtimeReport

7. ga4_get_metadata
   - Get available dimensions and metrics
   - Params: propertyId
   - API: GET /properties/{propertyId}/metadata

### Audiences (Admin API)
8. ga4_list_audiences
   - List audiences for a property
   - Params: propertyId
   - API: GET /properties/{propertyId}/audiences

9. ga4_get_audience
   - Get audience details
   - Params: propertyId, audienceId
   - API: GET /properties/{propertyId}/audiences/{audienceId}

### Conversions (Admin API)
10. ga4_list_conversion_events
    - List conversion events for a property
    - Params: propertyId
    - API: GET /properties/{propertyId}/conversionEvents

11. ga4_get_conversion_event
    - Get conversion event details
    - Params: propertyId, conversionEventId
    - API: GET /properties/{propertyId}/conversionEvents/{conversionEventId}

## File Structure
Create: src/tools/ga4/
- index.ts (exports all GA4 tools)
- properties.ts (ga4_list_properties, ga4_get_property)
- data-streams.ts (ga4_list_data_streams, ga4_get_data_stream)
- reports.ts (ga4_run_report, ga4_run_realtime_report, ga4_get_metadata)
- audiences.ts (ga4_list_audiences, ga4_get_audience)
- conversions.ts (ga4_list_conversion_events, ga4_get_conversion_event)

## ga4_run_report Input Schema
```typescript
inputSchema: {
  type: 'object',
  properties: {
    propertyId: { type: 'string', description: 'GA4 property ID (e.g., 123456789)' },
    dateRanges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD or relative like "7daysAgo")' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD or "today")' }
        }
      }
    },
    dimensions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Dimensions to include (e.g., ["date", "sessionSource"])'
    },
    metrics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Metrics to include (e.g., ["sessions", "conversions"])'
    },
    limit: { type: 'number', description: 'Max rows to return (default: 10000)' }
  },
  required: ['propertyId', 'dateRanges', 'metrics']
}
```

## API Base URLs
- Admin API: https://analyticsadmin.googleapis.com/v1beta
- Data API: https://analyticsdata.googleapis.com/v1beta

## Validation
- [ ] All 11 tools defined with proper schemas
- [ ] Reports return formatted data
- [ ] Property IDs handled correctly (no "properties/" prefix in params)
- [ ] Error handling for invalid property access
- [ ] Tools work end-to-end from Claude Desktop
```

## Success Criteria
- All 11 GA4 tools implemented and working
- Report tool can run custom queries
- Realtime data accessible
- Proper formatting of tabular data
