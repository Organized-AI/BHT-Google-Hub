# Phase 5: Google Ads Tools Implementation (12 Tools)

## Objective
Implement Google Ads tools for account management, campaigns, performance reporting, and optimization.

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp/packages/mcp-server

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are implementing Google Ads tools for the Google Marketing Hub Remote MCP Server.

## Context
- Remote MCP on Cloudflare Workers
- Use GoogleApiClient for all API calls
- Google Ads API v18: https://googleads.googleapis.com/v18
- All tools prefixed with gads_
- Pattern inspired by TrueClicks MCP (GAQL queries) and Hire Otto MCP (campaign management)

## Tools to Implement (12 total)

### Account Management (TrueClicks pattern)
1. gads_list_accounts
   - List accessible Google Ads accounts
   - API: GET /customers:listAccessibleCustomers
   - Returns: customer resource names

2. gads_get_account
   - Get account details
   - Params: customerId
   - Uses GAQL: SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer

### Campaign Management (Hire Otto pattern)
3. gads_list_campaigns
   - List campaigns in an account
   - Params: customerId
   - GAQL: SELECT campaign.id, campaign.name, campaign.status, campaign.bidding_strategy_type FROM campaign

4. gads_get_campaign
   - Get campaign details
   - Params: customerId, campaignId
   - GAQL: SELECT campaign.id, campaign.name, campaign.status, campaign.start_date, campaign.end_date, campaign.bidding_strategy_type FROM campaign WHERE campaign.id = {campaignId}

5. gads_update_campaign_status
   - Pause/Enable/Remove a campaign
   - Params: customerId, campaignId, status (ENABLED|PAUSED|REMOVED)
   - API: POST /customers/{customerId}/campaigns:mutate

6. gads_update_campaign_budget
   - Update campaign budget
   - Params: customerId, campaignId, budgetAmountMicros
   - API: POST /customers/{customerId}/campaignBudgets:mutate

### Performance Reporting (TrueClicks pattern - GAQL)
7. gads_run_report
   - Run a custom GAQL report
   - Params: customerId, query
   - API: POST /customers/{customerId}/googleAds:searchStream

8. gads_get_campaign_performance
   - Get campaign performance metrics
   - Params: customerId, dateRange (TODAY|YESTERDAY|LAST_7_DAYS|LAST_30_DAYS|custom)
   - GAQL: SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING {dateRange}

9. gads_get_keyword_performance
   - Get keyword performance
   - Params: customerId, campaignId (optional), dateRange
   - GAQL: SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM keyword_view

10. gads_get_search_terms_report
    - Get search terms report
    - Params: customerId, campaignId (optional), dateRange
    - GAQL: SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros FROM search_term_view

### Account Health (Hire Otto pattern)
11. gads_get_change_history
    - Get recent account changes
    - Params: customerId, dateRange
    - GAQL: SELECT change_event.change_date_time, change_event.change_resource_type, change_event.changed_fields, change_event.old_resource, change_event.new_resource FROM change_event

12. gads_get_recommendations
    - Get account recommendations
    - Params: customerId
    - GAQL: SELECT recommendation.type, recommendation.impact, recommendation.campaign FROM recommendation WHERE recommendation.dismissed = FALSE

## File Structure
Create: src/tools/gads/
- index.ts (exports all Google Ads tools)
- accounts.ts (gads_list_accounts, gads_get_account)
- campaigns.ts (gads_list_campaigns, gads_get_campaign, gads_update_campaign_status, gads_update_campaign_budget)
- reports.ts (gads_run_report, gads_get_campaign_performance, gads_get_keyword_performance, gads_get_search_terms_report)
- health.ts (gads_get_change_history, gads_get_recommendations)

## Google Ads API Authentication
Headers required:
- Authorization: Bearer {access_token}
- developer-token: {DEVELOPER_TOKEN} (from Google Ads API Center)
- login-customer-id: {MANAGER_ACCOUNT_ID} (if using manager account)

## GAQL Query Pattern
```typescript
async function runGaqlQuery(
  client: GoogleApiClient,
  customerId: string,
  query: string
): Promise<any[]> {
  const response = await client.request<SearchStreamResponse>(
    `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      body: JSON.stringify({ query })
    }
  );
  // Flatten results from stream
  return response.results || [];
}
```

## gads_run_report Input Schema
```typescript
inputSchema: {
  type: 'object',
  properties: {
    customerId: { 
      type: 'string', 
      description: 'Google Ads customer ID (no hyphens)' 
    },
    query: { 
      type: 'string', 
      description: 'GAQL query (e.g., "SELECT campaign.id, metrics.clicks FROM campaign")' 
    }
  },
  required: ['customerId', 'query']
}
```

## Date Range Handling
Support both predefined and custom ranges:
- TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, THIS_MONTH, LAST_MONTH
- Custom: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }

## Important Notes
- Customer IDs should be passed without hyphens (1234567890 not 123-456-7890)
- Cost values are in micros (divide by 1,000,000 for actual currency)
- Developer token required for production (apply at Google Ads API Center)
- Test accounts can use test developer token

## Validation
- [ ] All 12 tools defined with proper schemas
- [ ] GAQL queries execute correctly
- [ ] Campaign updates work (status, budget)
- [ ] Performance data returns correctly formatted
- [ ] Tools work end-to-end from Claude Desktop
```

## Success Criteria
- All 12 Google Ads tools implemented and working
- Custom GAQL queries supported
- Campaign management operations functional
- Performance reporting accurate
