# Phase 2: Create GTM Tags

## Prerequisites
- Phase 0 complete (template installed)
- Phase 1 complete (variables created)
- Template ID from Phase 0

## 2.1 Create Base Insight Tag (Pageview)

```
gtm_tag action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn - Insight Tag Base",
    "type": "[TEMPLATE_ID]",
    "parameter": [
      {"type": "template", "key": "partnerId", "value": "{{CONST - LinkedIn Partner ID}}"}
    ],
    "firingTriggerId": ["2147479553"],
    "tagFiringOption": "oncePerLoad"
  }
```

## 2.2 Create Lead Conversion Tag

```
gtm_tag action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "LinkedIn - Lead Conversion",
    "type": "[TEMPLATE_ID]",
    "parameter": [
      {"type": "template", "key": "partnerId", "value": "{{CONST - LinkedIn Partner ID}}"},
      {"type": "template", "key": "conversionId", "value": "25208314"},
      {"type": "template", "key": "eventId", "value": "{{CJS - LinkedIn Event ID}}"}
    ],
    "firingTriggerId": ["305"],
    "tagFiringOption": "oncePerEvent"
  }
```

## Success Criteria
- [ ] 2 tags created
- [ ] Tags linked to correct triggers
