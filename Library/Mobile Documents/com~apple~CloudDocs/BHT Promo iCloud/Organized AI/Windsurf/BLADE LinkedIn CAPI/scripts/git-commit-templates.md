# Git Commit Templates - BLADE LinkedIn Implementation

## Phase Completion Commits

### Phase 0: Template Installation
```bash
git add -A
git commit -m "Phase 0: LinkedIn InsightTag 2.0 template installed

- Installed template from Community Gallery via GTM API
- Template ID: cvt_42412215_XXX
- Method: galleryReference (or templateData fallback)

Artifacts: Template cvt_42412215_XXX
Next: Phase 1 - Variable Creation"
```

### Phase 1: Variable Creation
```bash
git add -A
git commit -m "Phase 1: LinkedIn tracking variables created

- CONST - LinkedIn Partner ID (constant)
- CJS - LinkedIn Event ID (custom JS for deduplication)
- Cookie - li_fat_id (first-party cookie)

Variables: 3 created
Next: Phase 2 - Tag Creation"
```

### Phase 2: Tag Creation
```bash
git add -A
git commit -m "Phase 2: LinkedIn Insight tags created

- LinkedIn - Insight Tag Base (All Pages trigger)
- LinkedIn - Lead Conversion (CompleteRegistration trigger)
- Using template cvt_42412215_XXX

Tags: 2 created
Triggers: All Pages (2147479553), CompleteRegistration (305)
Next: Phase 3 - Validation"
```

### Phase 3: Validation
```bash
git add -A
git commit -m "Phase 3: Workspace validation complete

- Workspace status: Clean
- Merge conflicts: None
- Components verified: 1 template, 3 variables, 2 tags

Status: Ready for publish
Next: Phase 4 - Test & Publish"
```

### Phase 4: Test & Publish
```bash
git add -A
git commit -m "Phase 4: LinkedIn Insight Tag published to live

- Preview URL generated for testing
- Container version created: v[XX]
- Published to live environment
- Live version verified

Version: [VERSION_ID]
Fingerprint: [FINGERPRINT]
Status: DEPLOYMENT COMPLETE"
```

---

## Full Implementation Commit

After all phases complete:
```bash
git add -A
git commit -m "feat: LinkedIn Insight Tag implementation complete

Implemented LinkedIn Insight Tag for BLADE Westchester campaign.

Components:
- LinkedIn InsightTag 2.0 template (Community Gallery)
- 3 variables (Partner ID, Event ID, Cookie)
- 2 tags (Base pageview, Lead conversion)

Features:
- Dual-tracking: Client-side + Server-side CAPI
- Event ID deduplication for accurate attribution
- Conversion tracking: Lead (Rule 25208314)

GTM Container: GTM-W9S77T7
Version: v[XX]

Closes: BLADE-LinkedIn implementation"
```

---

## Rollback Commit (If Needed)

```bash
git add -A
git commit -m "rollback: Reverted to previous GTM version

- Issue detected after LinkedIn Insight Tag deployment
- Rolled back to version v[PREV]
- Investigating: [ISSUE_DESCRIPTION]

Previous version: v[PREV]
Fingerprint: [PREV_FP]"
```
