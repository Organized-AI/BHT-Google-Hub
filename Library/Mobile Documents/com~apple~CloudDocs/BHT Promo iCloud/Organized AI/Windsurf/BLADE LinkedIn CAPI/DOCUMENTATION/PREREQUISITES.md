# BLADE LinkedIn Insight Tag - Prerequisites

## Required Components

### 1. MCP Servers
| MCP Server | Purpose | Required |
|------------|---------|----------|
| `google-tag-manager-mcp-server` | All GTM CRUD operations | ✅ Yes |
| `stape-mcp-server` | Verify Stape config | ⚠️ Optional |

### 2. User Input Required
| Data Point | Source | Status |
|------------|--------|--------|
| LinkedIn Partner ID | Campaign Manager → Account Assets → Insight Tag | ⏳ Needed |

---

## GTM MCP Authentication

```bash
# If session expired, clear and re-authenticate:
rm -rf ~/.mcp-auth
# Then restart Claude Desktop
```

---

## Data Already Known

| Data Point | Value |
|------------|-------|
| GTM Account ID | `4702245012` |
| Web Container ID | `42412215` |
| Workspace ID | `86` |
| Lead Conversion Rule | `25208314` |
| All Pages Trigger | `2147479553` |
| CompleteRegistration Trigger | `305` |

---

## Execution

```bash
cd "BLADE LinkedIn CAPI"
claude --dangerously-skip-permissions
> Deploy LinkedIn tracking for BLADE
```

The agent will prompt for Partner ID if not in config.
