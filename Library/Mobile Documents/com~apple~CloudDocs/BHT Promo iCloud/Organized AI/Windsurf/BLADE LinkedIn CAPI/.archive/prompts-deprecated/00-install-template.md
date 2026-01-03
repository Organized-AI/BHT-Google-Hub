# Phase 0: Install LinkedIn Insight Tag Template (AUTOMATED)

## Gallery Information
- **Owner**: `linkedin`
- **Repository**: `linkedin-gtm-community-template`
- **Host**: `github.com`
- **Latest SHA**: `c07099c0e0cf0ade2057ee4016d3da9f32959169`

---

## Method 1: Create Template with Gallery Reference

```
gtm_template action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn InsightTag 2.0",
    "galleryReference": {
      "host": "github.com",
      "owner": "linkedin",
      "repository": "linkedin-gtm-community-template",
      "version": "c07099c0e0cf0ade2057ee4016d3da9f32959169",
      "templateDeveloperId": "github.com_linkedin",
      "isModified": false
    }
  }
```

---

## Method 2: Create Template with Raw Template Data (Fallback)

```bash
curl -s "https://raw.githubusercontent.com/linkedin/linkedin-gtm-community-template/main/template.tpl"
```

Then create with `templateData` containing file content.

---

## Verify Installation

```
gtm_template action=list
  accountId=4702245012
  containerId=42412215
  workspaceId=86
```

**Capture**: Template ID (format: `cvt_42412215_XXX`)
