# Phase 4: GTM Tools Implementation (19 Tools)

## Objective
Implement Google Tag Manager tools for container management, tags, triggers, variables, and version control.

## Commands
```bash
cd /Users/supabowl/Library/Mobile\ Documents/com~apple~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf/google-marketing-hub-mcp/packages/mcp-server

claude --dangerously-skip-permissions
```

## Prompt for Claude Code

```
You are implementing GTM tools for the Google Marketing Hub Remote MCP Server.

## Context
- Remote MCP on Cloudflare Workers
- Use GoogleApiClient for all API calls
- GTM API v2: https://tagmanager.googleapis.com/tagmanager/v2
- All tools prefixed with gtm_
- This is the largest tool set (19 tools)

## Tools to Implement (19 total)

### Account & Container Management
1. gtm_list_accounts
   - List GTM accounts
   - API: GET /accounts

2. gtm_get_account
   - Get account details
   - Params: accountId
   - API: GET /accounts/{accountId}

3. gtm_list_containers
   - List containers in an account
   - Params: accountId
   - API: GET /accounts/{accountId}/containers

4. gtm_get_container
   - Get container details
   - Params: accountId, containerId
   - API: GET /accounts/{accountId}/containers/{containerId}

### Workspace Management
5. gtm_list_workspaces
   - List workspaces in a container
   - Params: accountId, containerId
   - API: GET /accounts/{accountId}/containers/{containerId}/workspaces

6. gtm_get_workspace
   - Get workspace details
   - Params: accountId, containerId, workspaceId
   - API: GET /accounts/{accountId}/containers/{containerId}/workspaces/{workspaceId}

### Tags
7. gtm_list_tags
   - List tags in a workspace
   - Params: accountId, containerId, workspaceId
   - API: GET /accounts/{accountId}/containers/{containerId}/workspaces/{workspaceId}/tags

8. gtm_get_tag
   - Get tag details
   - Params: accountId, containerId, workspaceId, tagId
   - API: GET .../workspaces/{workspaceId}/tags/{tagId}

9. gtm_create_tag
   - Create a new tag
   - Params: accountId, containerId, workspaceId, name, type, parameter, firingTriggerId
   - API: POST .../workspaces/{workspaceId}/tags

10. gtm_update_tag
    - Update an existing tag
    - Params: accountId, containerId, workspaceId, tagId, ...updates
    - API: PUT .../workspaces/{workspaceId}/tags/{tagId}

### Triggers
11. gtm_list_triggers
    - List triggers in a workspace
    - Params: accountId, containerId, workspaceId
    - API: GET .../workspaces/{workspaceId}/triggers

12. gtm_get_trigger
    - Get trigger details
    - Params: accountId, containerId, workspaceId, triggerId
    - API: GET .../workspaces/{workspaceId}/triggers/{triggerId}

13. gtm_create_trigger
    - Create a new trigger
    - Params: accountId, containerId, workspaceId, name, type, customEventFilter
    - API: POST .../workspaces/{workspaceId}/triggers

### Variables
14. gtm_list_variables
    - List variables in a workspace
    - Params: accountId, containerId, workspaceId
    - API: GET .../workspaces/{workspaceId}/variables

15. gtm_get_variable
    - Get variable details
    - Params: accountId, containerId, workspaceId, variableId
    - API: GET .../workspaces/{workspaceId}/variables/{variableId}

16. gtm_create_variable
    - Create a new variable
    - Params: accountId, containerId, workspaceId, name, type, parameter
    - API: POST .../workspaces/{workspaceId}/variables

### Version Control
17. gtm_list_versions
    - List container versions
    - Params: accountId, containerId
    - API: GET /accounts/{accountId}/containers/{containerId}/versions

18. gtm_create_version
    - Create a version from workspace
    - Params: accountId, containerId, workspaceId, name, notes
    - API: POST .../workspaces/{workspaceId}:create_version

19. gtm_publish_version
    - Publish a version to live
    - Params: accountId, containerId, versionId
    - API: POST .../versions/{versionId}:publish

## File Structure
Create: src/tools/gtm/
- index.ts (exports all GTM tools)
- accounts.ts (gtm_list_accounts, gtm_get_account)
- containers.ts (gtm_list_containers, gtm_get_container)
- workspaces.ts (gtm_list_workspaces, gtm_get_workspace)
- tags.ts (gtm_list_tags, gtm_get_tag, gtm_create_tag, gtm_update_tag)
- triggers.ts (gtm_list_triggers, gtm_get_trigger, gtm_create_trigger)
- variables.ts (gtm_list_variables, gtm_get_variable, gtm_create_variable)
- versions.ts (gtm_list_versions, gtm_create_version, gtm_publish_version)

## GTM Path Pattern
Base: https://tagmanager.googleapis.com/tagmanager/v2
Paths use format: /accounts/{accountId}/containers/{containerId}/workspaces/{workspaceId}/...

## gtm_create_tag Input Schema Example
```typescript
inputSchema: {
  type: 'object',
  properties: {
    accountId: { type: 'string' },
    containerId: { type: 'string' },
    workspaceId: { type: 'string' },
    name: { type: 'string', description: 'Tag name' },
    type: { type: 'string', description: 'Tag type (e.g., "gaawe" for GA4 Event)' },
    parameter: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' },
          type: { type: 'string' }
        }
      },
      description: 'Tag parameters'
    },
    firingTriggerId: {
      type: 'array',
      items: { type: 'string' },
      description: 'Trigger IDs that fire this tag'
    }
  },
  required: ['accountId', 'containerId', 'workspaceId', 'name', 'type']
}
```

## Validation
- [ ] All 19 tools defined with proper schemas
- [ ] Create/Update operations work correctly
- [ ] Version control flow works (create → publish)
- [ ] Error handling for permission issues
- [ ] Tools work end-to-end from Claude Desktop
```

## Success Criteria
- All 19 GTM tools implemented and working
- Can create and manage tags, triggers, variables
- Version control workflow operational
- Publishing to live works correctly
