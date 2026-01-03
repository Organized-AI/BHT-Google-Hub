# Phase 1: Variable Creation - COMPLETE

**Completed:** 2024-12-29
**Partner ID Used:** 1009266 (from existing US LinkedIn tracking)

## Variables Created

| Name | Type | Variable ID |
|------|------|-------------|
| CONST - LinkedIn Partner ID | Constant (c) | 343 |
| CJS - LinkedIn Event ID | Custom JS (jsm) | 344 |
| Cookie - li_fat_id | Cookie (k) | 345 |

## Partner ID Discovery

Partner ID was discovered from existing LinkedIn tags in the container:
- `AW_LinkedIn_AllPages` (Tag ID: 26) → Partner ID: `1009266` (US)
- `Blade_EUR_Linkedin_Pixel` (Tag ID: 95) → Partner ID: `5133370` (EUR)

Used `1009266` for Westchester (US) campaign.

## Variable Details

### CONST - LinkedIn Partner ID
- Type: Constant
- Value: `1009266`
- Purpose: Store LinkedIn Partner ID for tag configuration

### CJS - LinkedIn Event ID
- Type: Custom JavaScript
- Purpose: Generate unique event IDs for deduplication with server-side CAPI
- Logic: Uses `DL_event_id` if available, falls back to `li_` + `DL_transaction_id`, or generates unique ID

### Cookie - li_fat_id
- Type: First-Party Cookie
- Cookie Name: `li_fat_id`
- Purpose: Capture LinkedIn first-party click ID for enhanced matching

## Next Phase
Proceed to Phase 2: Tag Creation
