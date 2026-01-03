# Post-Phase Hook

Execute these actions after completing any phase.

---

## 1. Create Completion File

After phase success, create `PHASE-X-COMPLETE.md`:

```bash
# Template location
PLANNING/implementation-phases/PHASE-COMPLETE-TEMPLATE.md

# Create completion file
cp PHASE-COMPLETE-TEMPLATE.md PHASE-[X]-COMPLETE.md
# Fill in actual values from phase execution
```

---

## 2. Capture Phase State

Store artifacts created in this phase:

### Phase 0 State
```json
{
  "phase": 0,
  "name": "Template Installation",
  "artifacts": {
    "templateId": "cvt_42412215_XXX",
    "templateName": "LinkedIn InsightTag 2.0"
  },
  "completedAt": "[ISO_TIMESTAMP]"
}
```

### Phase 1 State
```json
{
  "phase": 1,
  "name": "Variable Creation",
  "artifacts": {
    "variables": [
      { "name": "CONST - LinkedIn Partner ID", "id": "[ID]", "type": "c" },
      { "name": "CJS - LinkedIn Event ID", "id": "[ID]", "type": "jsm" },
      { "name": "Cookie - li_fat_id", "id": "[ID]", "type": "k" }
    ]
  },
  "completedAt": "[ISO_TIMESTAMP]"
}
```

### Phase 2 State
```json
{
  "phase": 2,
  "name": "Tag Creation",
  "artifacts": {
    "tags": [
      { "name": "LinkedIn - Insight Tag Base", "id": "[ID]", "trigger": "2147479553" },
      { "name": "LinkedIn - Lead Conversion", "id": "[ID]", "trigger": "305" }
    ]
  },
  "completedAt": "[ISO_TIMESTAMP]"
}
```

### Phase 3 State
```json
{
  "phase": 3,
  "name": "Validation",
  "artifacts": {
    "validation": {
      "templateCount": 1,
      "variableCount": 3,
      "tagCount": 2,
      "conflicts": 0,
      "errors": 0
    }
  },
  "completedAt": "[ISO_TIMESTAMP]"
}
```

### Phase 4 State
```json
{
  "phase": 4,
  "name": "Test & Publish",
  "artifacts": {
    "previewUrl": "[URL]",
    "versionId": "[ID]",
    "versionName": "LinkedIn Insight Tag - BLADE Westchester",
    "fingerprint": "[FP]",
    "publishedAt": "[ISO_TIMESTAMP]",
    "liveVersionId": "[ID]"
  },
  "completedAt": "[ISO_TIMESTAMP]"
}
```

---

## 3. Update Master Plan

After each phase, update `IMPLEMENTATION-MASTER-PLAN.md`:

```markdown
## Implementation Phases Overview

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 0 | Template Installation | ✅ | [TIMESTAMP] |
| 1 | Variable Creation | ✅ | [TIMESTAMP] |
| 2 | Tag Creation | ⏳ | - |
| ... | ... | ... | ... |
```

---

## 4. Git Commit (Optional)

If git is initialized:

```bash
git add -A
git commit -m "Phase [X]: [Phase Name] complete

[Changes made]

Artifacts: [IDs]
Next: Phase [X+1]"
```

---

## 5. Report to User

Output completion summary:

```
╔═══════════════════════════════════════════════╗
║  Phase [X]: [Phase Name] - COMPLETE           ║
╠═══════════════════════════════════════════════╣
║  ✅ Tasks completed: [N]                      ║
║  ✅ Artifacts created: [N]                    ║
║  ✅ Verification passed                       ║
╠═══════════════════════════════════════════════╣
║  Next: Phase [X+1] - [Next Phase Name]        ║
╚═══════════════════════════════════════════════╝
```

---

## 6. Proceed to Next Phase

After reporting:

```
"Read PLANNING/implementation-phases/PHASE-[X+1]-PROMPT.md and execute all tasks"
```

Or prompt user:
> "Phase [X] complete. Proceed to Phase [X+1]? (y/n)"

---

## Automatic Execution

```javascript
async function postPhaseHook(phaseNumber, results) {
  // 1. Create completion file
  const completionContent = generateCompletion(phaseNumber, results);
  await writeFile(`PHASE-${phaseNumber}-COMPLETE.md`, completionContent);
  
  // 2. Update master plan
  await updateMasterPlan(phaseNumber, "complete");
  
  // 3. Report to user
  console.log(formatCompletionReport(phaseNumber, results));
  
  // 4. Check if final phase
  if (phaseNumber === 4) {
    console.log("🎉 ALL PHASES COMPLETE - DEPLOYMENT SUCCESSFUL");
  } else {
    console.log(`Next: Phase ${phaseNumber + 1}`);
  }
}
```
