# Google Marketing Hub MCP - Build Checklist

## Phase 0: Project Setup ✅
- [x] wrangler.toml created with D1 and KV bindings
- [x] package.json with dependencies
- [x] tsconfig.json configured
- [x] D1 database created (ghub-tokens)
- [x] KV namespace created (sessions)
- [x] Secrets set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [x] migrations/0001_initial.sql applied
- [x] `wrangler dev` starts successfully
- [x] /health endpoint responds
- [x] **PHASE-0-COMPLETE.md created**

## Phase 1: Auth Layer (4 tools) ✅
- [x] src/lib/token-manager.ts implemented
- [x] src/lib/google-api-client.ts implemented
- [x] ghub_auth_init
- [x] ghub_auth_callback (via OAuth flow)
- [x] ghub_auth_status
- [x] ghub_auth_revoke
- [x] ghub_auth_list (bonus tool)
- [x] OAuth flow works end-to-end
- [x] Token refresh works automatically
- [x] **PHASE-1-COMPLETE.md created**

## Phase 2: GCP Tools (8 tools) ✅
- [x] gcp_list_projects
- [x] gcp_get_project
- [x] gcp_list_service_accounts
- [x] gcp_get_service_account
- [x] gcp_list_enabled_apis
- [x] gcp_enable_api
- [x] gcp_get_billing_info
- [x] gcp_list_billing_accounts
- [x] All tools deployed and tested
- [x] **PHASE-2-COMPLETE.md created**

## Phase 3: GA4 Tools (11 tools)
- [ ] ghub_ga4_list_properties
- [ ] ghub_ga4_get_property
- [ ] ghub_ga4_run_report
- [ ] ghub_ga4_run_realtime_report
- [ ] ghub_ga4_list_audiences
- [ ] ghub_ga4_create_audience
- [ ] ghub_ga4_list_conversions
- [ ] ghub_ga4_create_conversion
- [ ] ghub_ga4_list_custom_dimensions
- [ ] ghub_ga4_create_custom_dimension
- [ ] ghub_ga4_get_data_retention
- [ ] All tools pass /test-tool validation
- [ ] **PHASE-3-COMPLETE.md created**

## Phase 4: GTM Tools (19 tools)
### Account/Container
- [ ] ghub_gtm_list_accounts
- [ ] ghub_gtm_list_containers
- [ ] ghub_gtm_get_container

### Workspace
- [ ] ghub_gtm_list_workspaces
- [ ] ghub_gtm_create_workspace
- [ ] ghub_gtm_sync_workspace
- [ ] ghub_gtm_preview_workspace

### Tags
- [ ] ghub_gtm_list_tags
- [ ] ghub_gtm_get_tag
- [ ] ghub_gtm_create_tag
- [ ] ghub_gtm_update_tag
- [ ] ghub_gtm_delete_tag

### Triggers
- [ ] ghub_gtm_list_triggers
- [ ] ghub_gtm_create_trigger

### Variables
- [ ] ghub_gtm_list_variables
- [ ] ghub_gtm_create_variable

### Versions
- [ ] ghub_gtm_list_versions
- [ ] ghub_gtm_create_version
- [ ] ghub_gtm_publish_version

- [ ] All tools pass /test-tool validation
- [ ] **PHASE-4-COMPLETE.md created**

## Phase 5: Google Ads Tools (12 tools)
### Customer
- [ ] ghub_gads_list_customers
- [ ] ghub_gads_get_customer

### Campaigns
- [ ] ghub_gads_list_campaigns
- [ ] ghub_gads_get_campaign
- [ ] ghub_gads_update_campaign

### Ad Groups
- [ ] ghub_gads_list_ad_groups
- [ ] ghub_gads_list_ads
- [ ] ghub_gads_get_ad_metrics

### Keywords
- [ ] ghub_gads_list_keywords
- [ ] ghub_gads_get_search_terms

### Other
- [ ] ghub_gads_list_conversions
- [ ] ghub_gads_gaql_query

- [ ] All tools pass /test-tool validation
- [ ] **PHASE-5-COMPLETE.md created**

## Post-Build
- [ ] Final deployment with `wrangler deploy`
- [ ] All 54 tools listed via tools/list
- [ ] Claude Desktop connects via SSE
- [ ] BUILD-COMPLETE.md created
- [ ] Git push to main

---

## Progress Summary

| Phase | Tools | Status |
|-------|-------|--------|
| 0 | 0 | ✅ |
| 1 | 4 | ✅ |
| 2 | 8 | ✅ |
| 3 | 11 | ⏳ |
| 4 | 19 | ⏳ |
| 5 | 12 | ⏳ |
| **Total** | **54** | |

**Legend:** ⏳ Pending | 🔄 In Progress | ✅ Complete
