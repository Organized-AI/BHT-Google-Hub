# Phase [X]: [Phase Name] - COMPLETE

**Completed:** [TIMESTAMP]
**Duration:** [ESTIMATE]
**Executed By:** Claude Code Agent

---

## Tasks Completed

| Task | Status | Notes |
|------|--------|-------|
| Task X.1 | ✅ | [Details] |
| Task X.2 | ✅ | [Details] |
| Task X.3 | ✅ | [Details] |

---

## Artifacts Created

| Type | Name | ID/Reference |
|------|------|--------------|
| [Template/Variable/Tag] | [Name] | [ID] |

---

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| [Check 1] | [Value] | [Value] | ✅/❌ |

---

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| None | N/A |

---

## State Captured

```json
{
  "phaseId": [X],
  "phaseName": "[Name]",
  "completedAt": "[ISO_TIMESTAMP]",
  "artifacts": {
    "[type]": "[id]"
  },
  "nextPhase": [X+1]
}
```

---

## Git Commit

```bash
git add -A
git commit -m "Phase [X]: [Phase Name] complete

- [Change 1]
- [Change 2]
- [Change 3]

Artifacts: [IDs]
Next: Phase [X+1]"
```

---

## Next Phase

Proceed to: `PHASE-[X+1]-PROMPT.md`

**Command:**
```bash
"Read PLANNING/implementation-phases/PHASE-[X+1]-PROMPT.md and execute all tasks"
```
