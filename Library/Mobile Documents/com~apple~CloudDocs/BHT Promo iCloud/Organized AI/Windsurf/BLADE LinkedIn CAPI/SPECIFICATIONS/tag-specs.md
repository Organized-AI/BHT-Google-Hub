# LinkedIn Insight Tag - Technical Specifications

## Variables

### CONST - LinkedIn Partner ID
| Property | Value |
|----------|-------|
| Name | `CONST - LinkedIn Partner ID` |
| Type | `c` (Constant) |
| Parameter Value | `[FROM_LINKEDIN_CAMPAIGN_MANAGER]` |

### CJS - LinkedIn Event ID
| Property | Value |
|----------|-------|
| Name | `CJS - LinkedIn Event ID` |
| Type | `jsm` (Custom JavaScript) |
| Purpose | Generate unique event ID for deduplication |

### Cookie - li_fat_id
| Property | Value |
|----------|-------|
| Name | `Cookie - li_fat_id` |
| Type | `k` (First-Party Cookie) |
| Cookie Name | `li_fat_id` |

---

## Tags

### LinkedIn - Insight Tag Base
| Property | Value |
|----------|-------|
| Name | `LinkedIn - Insight Tag Base` |
| Template | LinkedIn Insight Tag (Community Gallery) |
| Trigger | All Pages (2147479553) |
| Firing Option | Once per page load |

### LinkedIn - Lead Conversion
| Property | Value |
|----------|-------|
| Name | `LinkedIn - Lead Conversion` |
| Conversion ID | `25208314` |
| Trigger | CompleteRegistration (305) |
| Firing Option | Once per event |

---

## Triggers (Existing - Reuse)

| Trigger Name | ID | Type |
|--------------|-----|------|
| All Pages | 2147479553 | Built-in |
| Purchase | 10 | Custom Event |
| CompleteRegistration | 305 | Custom Event |
