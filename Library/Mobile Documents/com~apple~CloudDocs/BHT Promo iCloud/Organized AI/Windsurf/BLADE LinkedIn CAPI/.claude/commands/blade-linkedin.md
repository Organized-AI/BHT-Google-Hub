# BLADE LinkedIn Slash Commands

Alternative to agent mode - manual phase execution via slash commands.

---

## Available Commands

### /blade-status
Check current implementation status.

```
Read CONFIG/phase-state.json and report:
- Current phase
- Completed phases
- Pending phases
- Any blockers
```

### /blade-phase-0
Execute Phase 0: Template Installation

```
Read PLANNING/implementation-phases/PHASE-0-PROMPT.md and execute all tasks.
Run pre-phase hooks from .claude/hooks/pre-phase.md first.
Run post-phase hooks from .claude/hooks/post-phase.md after.
```

### /blade-phase-1
Execute Phase 1: Variable Creation

```
Read PLANNING/implementation-phases/PHASE-1-PROMPT.md and execute all tasks.
Requires: Phase 0 complete, LinkedIn Partner ID.
```

### /blade-phase-2
Execute Phase 2: Tag Creation

```
Read PLANNING/implementation-phases/PHASE-2-PROMPT.md and execute all tasks.
Requires: Phase 0 and Phase 1 complete.
```

### /blade-phase-3
Execute Phase 3: Validation

```
Read PLANNING/implementation-phases/PHASE-3-PROMPT.md and execute all tasks.
Requires: Phases 0-2 complete.
```

### /blade-phase-4
Execute Phase 4: Test & Publish

```
Read PLANNING/implementation-phases/PHASE-4-PROMPT.md and execute all tasks.
Requires: Phase 3 complete (validation passed).
```

### /blade-deploy
Full autonomous deployment (all phases).

```
Read .claude/agents/gtm-linkedin-automation-agent.md.
Execute all phases (0-4) automatically with hooks.
Request LinkedIn Partner ID if not provided.
```

### /blade-rollback
Rollback to previous GTM version.

```
1. List version history: gtm_version_header action=list
2. Identify previous stable version
3. Republish: gtm_version action=publish containerVersionId=[PREV]
4. Verify: gtm_version action=live
```

### /blade-verify
Verify current live deployment.

```
1. Get live version: gtm_version action=live
2. Check for LinkedIn tags in version
3. Report version details and components
```

---

## Usage

In Claude Code, type the command name or describe what you want:

```
> /blade-status
> /blade-deploy
> /blade-phase-2
```

Or use natural language:
```
> "Check BLADE implementation status"
> "Deploy LinkedIn tracking for BLADE"
> "Run Phase 2 for BLADE"
```
