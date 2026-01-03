# Phase 1: Create GTM Variables

## 1.1 Create LinkedIn Partner ID Constant

```
gtm_variable action=create 
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "CONST - LinkedIn Partner ID",
    "type": "c",
    "parameter": [
      {"type": "template", "key": "value", "value": "[PARTNER_ID]"}
    ]
  }
```

## 1.2 Create Event ID Generator (Custom JavaScript)

```
gtm_variable action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "CJS - LinkedIn Event ID",
    "type": "jsm",
    "parameter": [{
      "type": "template",
      "key": "javascript",
      "value": "function() { var dlEventId = {{DL_event_id}}; if (dlEventId) return dlEventId; var txnId = {{DL_transaction_id}}; if (txnId) return 'li_' + txnId; return 'li_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }"
    }]
  }
```

## 1.3 Create li_fat_id Cookie Variable

```
gtm_variable action=create
  accountId=4702245012
  containerId=42412215
  workspaceId=86
  createOrUpdateConfig={
    "name": "Cookie - li_fat_id",
    "type": "k",
    "parameter": [
      {"type": "template", "key": "name", "value": "li_fat_id"}
    ]
  }
```

## Success Criteria
- [ ] 3 variables created
- [ ] Variable IDs captured
