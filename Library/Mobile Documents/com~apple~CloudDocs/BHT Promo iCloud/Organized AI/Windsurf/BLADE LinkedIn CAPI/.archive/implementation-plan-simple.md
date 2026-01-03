# BLADE LinkedIn Insight Tag - Implementation Plan

## Project Scope

**Objective:** Deploy LinkedIn Insight Tag alongside existing server-side CAPI for dual-tracking with deduplication.

**Campaign:** BLADE Westchester LinkedIn ($5K December budget)

---

## Phase Breakdown

### Phase 0: Template Installation (Automated)
- Install LinkedIn InsightTag 2.0 from Community Gallery
- Via GTM API `galleryReference` or `templateData`

### Phase 1: Create Variables (Automated)
| Variable | Type | Purpose |
|----------|------|---------|
| CONST - LinkedIn Partner ID | Constant | Store Partner ID |
| CJS - LinkedIn Event ID | Custom JS | Generate/retrieve event ID |
| Cookie - li_fat_id | Cookie | LinkedIn first-party cookie |

### Phase 2: Create Tags (Automated)
| Tag | Trigger | Purpose |
|-----|---------|---------|
| LinkedIn - Insight Tag Base | All Pages | Pageview, audience |
| LinkedIn - Lead Conversion | CompleteRegistration | Lead tracking |

### Phase 3: Verification (Automated)
- Verify all variables created
- Verify all tags created with correct triggers
- Check workspace status

### Phase 4: Test & Publish (Automated)
- Generate quick preview URL
- Create container version
- Publish to live
- Verify live version

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tags Created | 2 | GTM workspace |
| Variables Created | 3 | GTM workspace |
| Pageviews Tracked | >0 within 1 hour | LinkedIn Campaign Manager |
| Conversions Tracked | Match server count | Compare client vs CAPI |
| Deduplication | 1:1 ratio | LinkedIn conversion reports |
