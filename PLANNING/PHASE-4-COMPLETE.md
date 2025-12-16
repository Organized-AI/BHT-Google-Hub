# Phase 4: GTM Tools - COMPLETE

## Summary
Implemented 19 Google Tag Manager tools for the Google Marketing Hub MCP Server.

## Tools Implemented

### Account & Container Management (4 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_accounts` | List all GTM accounts accessible to user |
| `gtm_get_account` | Get account details |
| `gtm_list_containers` | List containers in an account |
| `gtm_get_container` | Get container details |

### Workspace Management (2 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_workspaces` | List workspaces in a container |
| `gtm_get_workspace` | Get workspace details |

### Tags (4 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_tags` | List all tags in a workspace |
| `gtm_get_tag` | Get tag details including parameters |
| `gtm_create_tag` | Create a new tag with triggers |
| `gtm_update_tag` | Update existing tag configuration |

### Triggers (3 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_triggers` | List all triggers in a workspace |
| `gtm_get_trigger` | Get trigger details with filters |
| `gtm_create_trigger` | Create new trigger (pageview, click, custom event, etc.) |

### Variables (3 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_variables` | List all variables in a workspace |
| `gtm_get_variable` | Get variable details with parameters |
| `gtm_create_variable` | Create new variable (constant, data layer, JavaScript, etc.) |

### Version Control (3 tools)
| Tool | Description |
|------|-------------|
| `gtm_list_versions` | List all container versions |
| `gtm_create_version` | Create version from workspace (captures changes) |
| `gtm_publish_version` | Publish version to make it live |

## Files Created

```
src/tools/gtm/
├── index.ts           # Exports all GTM tools and handlers
├── accounts.ts        # Account list/get tools
├── containers.ts      # Container list/get tools
├── workspaces.ts      # Workspace list/get tools
├── tags.ts            # Tag CRUD tools
├── triggers.ts        # Trigger list/get/create tools
├── variables.ts       # Variable list/get/create tools
└── versions.ts        # Version list/create/publish tools
```

## Files Modified

- `src/index.ts` - Added GTM tool imports, registered GTM_TOOLS, added tool handler routing

## API Endpoints Used

### GTM API v2
- Base URL: `https://tagmanager.googleapis.com/tagmanager/v2`
- Accounts: `GET /accounts`, `GET /accounts/{accountId}`
- Containers: `GET /accounts/{accountId}/containers`
- Workspaces: `GET .../containers/{containerId}/workspaces`
- Tags: `GET/POST/PUT .../workspaces/{workspaceId}/tags`
- Triggers: `GET/POST .../workspaces/{workspaceId}/triggers`
- Variables: `GET/POST .../workspaces/{workspaceId}/variables`
- Versions: `GET .../containers/{containerId}/version_headers`
- Create Version: `POST .../workspaces/{workspaceId}:create_version`
- Publish: `POST .../versions/{versionId}:publish`

## Key Features

1. **Full CRUD for Tags** - Create, read, update tags with full parameter support
2. **Trigger Management** - Support for all trigger types (pageview, click, custom event, etc.)
3. **Variable Management** - Create constants, data layer vars, custom JavaScript, etc.
4. **Version Control Workflow** - Create versions from workspaces and publish to live
5. **Pagination Support** - All list operations support page tokens

## Usage Examples

### List Containers
```json
{
  "name": "gtm_list_containers",
  "arguments": {
    "user_id": "ghub_xxxxx",
    "account_id": "123456"
  }
}
```

### Create GA4 Event Tag
```json
{
  "name": "gtm_create_tag",
  "arguments": {
    "user_id": "ghub_xxxxx",
    "account_id": "123456",
    "container_id": "789012",
    "workspace_id": "1",
    "name": "GA4 - Button Click",
    "type": "gaawe",
    "parameter": [
      { "type": "template", "key": "eventName", "value": "button_click" },
      { "type": "template", "key": "measurementId", "value": "G-XXXXXXX" }
    ],
    "firing_trigger_id": ["2"]
  }
}
```

### Create and Publish Version
```json
// Step 1: Create version
{
  "name": "gtm_create_version",
  "arguments": {
    "user_id": "ghub_xxxxx",
    "account_id": "123456",
    "container_id": "789012",
    "workspace_id": "1",
    "name": "v1.0.0 - Initial GA4 Setup"
  }
}

// Step 2: Publish version
{
  "name": "gtm_publish_version",
  "arguments": {
    "user_id": "ghub_xxxxx",
    "account_id": "123456",
    "container_id": "789012",
    "version_id": "5"
  }
}
```

## Tag Types Supported
- `gaawe` - GA4 Event
- `gaawc` - GA4 Config
- `html` - Custom HTML
- `img` - Custom Image
- `cvt_*` - Community Templates

## Trigger Types Supported
- `pageview` - Page View
- `domReady` - DOM Ready
- `windowLoaded` - Window Loaded
- `click` / `linkClick` - Click triggers
- `customEvent` - Custom Event
- `formSubmission` - Form Submission
- `scrollDepth` - Scroll Depth
- `elementVisibility` - Element Visibility
- `timer` - Timer

## Variable Types Supported
- `c` - Constant
- `v` - Data Layer Variable
- `jsm` - Custom JavaScript
- `k` - First-Party Cookie
- `u` - URL
- `f` - JavaScript Variable
- `aev` - Auto-Event Variable

## Tool Count

| Phase | Tools | Status |
|-------|-------|--------|
| Auth | 4 | Complete |
| GCP | 8 | Complete |
| GA4 | 11 | Complete |
| **GTM** | **19** | **Complete** |
| Google Ads | 12 | Pending |
| **Total** | **54** | **42 Complete** |

## Completed
- Date: 2025-12-16
- Phase: 4 of 5
- Tools: 19 GTM tools implemented and registered
- Bundle Size: 116.5kb (up from 69.2kb)
