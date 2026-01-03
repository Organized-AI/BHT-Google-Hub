# LinkedIn Insight Tag - Programmatic Template Installation

## Overview

This document provides **two approaches** to programmatically install the LinkedIn Insight Tag template without manual GTM UI intervention.

---

## Approach 1: Import via `templateData` (Raw .tpl File)

This approach imports the raw template code directly into GTM.

### GTM MCP Command

```javascript
// Use gtm_template action=create with templateData
gtm_template({
  accountId: "4702245012",
  action: "create",
  containerId: "42412215",
  workspaceId: "86",
  createOrUpdateConfig: {
    name: "LinkedIn InsightTag 2.0",
    templateData: `[FULL TEMPLATE CONTENT from template.tpl]`
  }
});
```

---

## Approach 2: Import via `galleryReference` (Link to Community Gallery)

This approach creates a template that references the Community Gallery source.

### GTM MCP Command

```javascript
gtm_template({
  accountId: "4702245012",
  action: "create", 
  containerId: "42412215",
  workspaceId: "86",
  createOrUpdateConfig: {
    name: "LinkedIn InsightTag 2.0",
    galleryReference: {
      host: "github.com",
      owner: "linkedin",
      repository: "linkedin-gtm-community-template",
      version: "c07099c0e0cf0ade2057ee4016d3da9f32959169",
      isModified: false
    }
  }
});
```

---

## Verification

After template creation, verify with:

```javascript
gtm_template({
  accountId: "4702245012",
  action: "list",
  containerId: "42412215", 
  workspaceId: "86"
});
```

The template ID format will be: `cvt_42412215_XXX`

---

## Fallback: Semi-Automated Flow

If full automation isn't possible:

1. **One-time manual step**: Add template via GTM UI (2 minutes)
2. **Automated thereafter**: Create all tags, variables, triggers via GTM MCP
3. **Template updates**: Can be automated via templateData import

This hybrid approach still saves 90%+ of manual effort.
