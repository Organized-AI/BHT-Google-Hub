# Agent Handoff Document

## Project: BLADE LinkedIn Insight Tag

### Quick Context

Implementation of LinkedIn Insight Tag (client-side) alongside existing server-side CAPI tracking for BLADE's Westchester LinkedIn campaign. Uses dual-tracking with event ID deduplication for accurate attribution.

---

### Key Files to Read (Priority Order)

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `CLAUDE.md` | Project overview and quick start |
| 2 | `PLANNING/IMPLEMENTATION-MASTER-PLAN.md` | Complete implementation roadmap |
| 3 | `CONFIG/config.json` | All IDs and configuration values |
| 4 | `.claude/agents/gtm-linkedin-automation-agent.md` | Agent execution protocol |
| 5 | `PLANNING/implementation-phases/PHASE-X-PROMPT.md` | Individual phase instructions |

---

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Documentation | ✅ Complete | All docs created |
| Agent Definition | ✅ Ready | Autonomous execution configured |
| Phase Prompts | ✅ Ready | Phases 0-4 defined |
| MCP Configuration | ✅ Ready | GTM MCP server configured |
| Config File | ⏳ Needs Value | Partner ID placeholder |

---

### Implementation Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 - Template | ⏳ Pending | Install LinkedIn InsightTag 2.0 |
| 1 - Variables | ⏳ Pending | Create Partner ID, Event ID, Cookie |
| 2 - Tags | ⏳ Pending | Create Base + Lead Conversion tags |
| 3 - Validation | ⏳ Pending | Check workspace status |
| 4 - Publish | ⏳ Pending | Preview, version, publish |

---

### GTM Architecture

**Web Container (42412215):**
- 85+ existing tags (Facebook, Google, Microsoft)
- No LinkedIn tags yet (to be added)
- Workspace 86 (Default)

**Server Container (175099610):**
- LinkedIn CAPI already configured
- Conversion Rule: 25208314
- Using Stape template

---

### Execution Options

**Option 1: Autonomous Agent**
```bash
cd "BLADE LinkedIn CAPI"
claude --dangerously-skip-permissions
> Deploy LinkedIn tracking for BLADE
```

**Option 2: Phased Execution**
```bash
claude --dangerously-skip-permissions
> Read PLANNING/implementation-phases/PHASE-0-PROMPT.md and execute all tasks
```

---

### Blocking Dependencies

Before automation can run:

| Dependency | Source | Status |
|------------|--------|--------|
| LinkedIn Partner ID | Campaign Manager → Account Assets | ⏳ Required |
| GTM MCP Auth | OAuth flow on first use | ✅ Ready |

---

### Success Criteria

- [ ] Template ID captured (cvt_42412215_XXX)
- [ ] 3 variables created
- [ ] 2 tags created with correct triggers
- [ ] No workspace conflicts
- [ ] Version published to live
- [ ] Live version verified

---

### Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| GTM MCP auth expired | `rm -rf ~/.mcp-auth` + restart Claude Desktop |
| Template already exists | List templates, capture existing ID |
| Merge conflict | Run workspace sync |
| Variable reference fails | Ensure Phase 1 complete before Phase 2 |

---

### Handoff Notes

If picking up this project:

1. Check `CONFIG/config.json` for placeholder values
2. Ask user for LinkedIn Partner ID if not provided
3. Use Agent Mode for fastest execution
4. Or use phased prompts for step-by-step control
5. Don't skip validation (Phase 3)
6. Verify live version after publish

---

### Related Projects

- **BLADE Meta CAPI** - Existing Facebook/Meta tracking (complete)
- **BLADE GA4** - Google Analytics setup (complete)
- **Westchester Campaign** - LinkedIn ads campaign this supports
