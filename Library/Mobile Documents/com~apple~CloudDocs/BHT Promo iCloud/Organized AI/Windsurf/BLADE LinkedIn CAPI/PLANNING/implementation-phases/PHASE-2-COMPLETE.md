# Phase 2: Tag Creation - COMPLETE

**Completed:** 2024-12-29
**Template ID Used:** cvt_42412215_96 (LinkedIn InsightTag 2.0)

## Tags Created

| Name | Tag ID | Trigger | Trigger ID |
|------|--------|---------|------------|
| LinkedIn - Insight Tag Base | 348 | All Pages | 2147479553 |
| LinkedIn - Lead Conversion | 349 | CompleteRegistration | 305 |

## Tag Details

### LinkedIn - Insight Tag Base (Tag ID: 348)
- **Type:** cvt_42412215_96
- **Trigger:** All Pages (2147479553)
- **Firing Option:** Once Per Page Load
- **Parameters:**
  - `partnerId`: `{{CONST - LinkedIn Partner ID}}`
- **Purpose:** Track all pageviews for audience building

### LinkedIn - Lead Conversion (Tag ID: 349)
- **Type:** cvt_42412215_96
- **Trigger:** CompleteRegistration (305)
- **Firing Option:** Once Per Event
- **Parameters:**
  - `partnerId`: `{{CONST - LinkedIn Partner ID}}`
  - `conversionId`: `25208314`
- **Purpose:** Track lead conversions for Westchester campaign

## Notes

- The LinkedIn InsightTag 2.0 template supports: `partnerId`, `conversionId`, `customUrl`
- Event ID deduplication is handled server-side via CAPI (not in client-side template)
- The `CJS - LinkedIn Event ID` variable will be used for server-side tracking integration

## Next Phase
Proceed to Phase 3: Validation
