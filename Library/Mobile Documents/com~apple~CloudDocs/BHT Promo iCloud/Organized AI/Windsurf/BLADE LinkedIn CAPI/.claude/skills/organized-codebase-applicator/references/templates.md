# Component Templates Reference

## Agent Template

**Location:** `.claude/agents/my-agent.md`

```markdown
---
name: agent-name
description: Brief description of what this agent does
triggers:
  - "trigger phrase one"
  - "trigger phrase two"
---

# Agent Name

## Purpose

What this agent does autonomously.

## Workflow

### Phase 1: Analysis
- Step one
- Step two

### Phase 2: Execution
- Step one
- Step two

### Phase 3: Verification
- Verify results
- Report status

## Tools Required

- Tool 1 (MCP server or built-in)
- Tool 2

## Success Criteria

- [ ] Outcome one achieved
- [ ] Outcome two achieved
- [ ] Documentation updated
```

---

## Command Template

**Location:** `.claude/commands/my-command.md`

```markdown
---
description: Brief description of what this command does
---

# Command Title

## What This Command Does

1. Step one
2. Step two
3. Step three

## Prerequisites

- Requirement one
- Requirement two

## Usage

```
/command-name [arguments]
```

## Examples

```
/command-name --option value
```

## Success Criteria

- [ ] Expected outcome one
- [ ] Expected outcome two
```

---

## Skill Template

**Location:** `.claude/skills/my-skill/SKILL.md`

```markdown
---
name: skill-name
description: What this skill enables Claude to do. Use when [trigger conditions].
---

# Skill Name

Brief description of the skill's purpose.

## Capabilities

- Capability one
- Capability two
- Capability three

## Usage

How Claude should apply this skill.

## Workflow

| Phase | Purpose |
|-------|---------|
| 1. Analysis | Understand the task |
| 2. Execution | Perform the work |
| 3. Verification | Confirm results |

## Examples

### Example 1: [Scenario]

Input: [user request]
Output: [expected result]

### Example 2: [Scenario]

Input: [user request]
Output: [expected result]
```

---

## Hooks Template

**Location:** `.claude/hooks/hooks.json`

```json
{
  "hooks": [
    {
      "name": "pre-deploy",
      "event": "before_command",
      "command_pattern": "deploy",
      "description": "Verify prerequisites before deployment",
      "action": {
        "type": "prompt",
        "content": "Before deploying, verify all requirements are met."
      }
    },
    {
      "name": "post-deploy",
      "event": "after_command",
      "command_pattern": "deploy",
      "description": "Log completion after deployment",
      "action": {
        "type": "prompt",
        "content": "Deployment complete. Update state and documentation."
      }
    }
  ]
}
```

---

## CLAUDE.md Template

**Location:** `CLAUDE.md`

```markdown
# Project Name

## Project Overview

Brief description of what this project does.

## Project Structure

\`\`\`
.claude/                    # Claude Code configuration
├── agents/                 # Agent definitions
├── commands/               # Slash commands
├── hooks/                  # Pre/post hooks
├── skills/                 # Skills
└── settings.json           # Settings

PLANNING/                   # Implementation planning
CONFIG/                     # Configuration files
DOCUMENTATION/              # Technical docs
...
\`\`\`

## Quick Start

\`\`\`bash
cd project-directory
claude --dangerously-skip-permissions
\`\`\`

Then say: "Execute [main command]"

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file - project overview |
| `.claude/agents/*.md` | Agent definitions |
| `CONFIG/config.json` | Main configuration |

## Success Criteria

- [ ] Criterion one
- [ ] Criterion two
```

---

## AGENT-HANDOFF/HANDOFF.md Template

**Location:** `AGENT-HANDOFF/HANDOFF.md`

```markdown
# Agent Handoff Document

## Project: [PROJECT_NAME]

### Quick Context

Brief description of the project and current state.

### Key Files to Read

1. `CLAUDE.md` - Project overview
2. `PLANNING/IMPLEMENTATION-MASTER-PLAN.md` - Full roadmap
3. `CONFIG/config.json` - Configuration

### Current State

| Component | Status |
|-----------|--------|
| Phase 0 | ✅ Complete |
| Phase 1 | ⏳ In Progress |
| Phase 2 | ⏳ Pending |

### Recent Changes

- Change one
- Change two

### Known Issues

- Issue one
- Issue two

### Next Steps

1. Complete Phase 1
2. Begin Phase 2
3. Update documentation

### Important Notes

- Note one
- Note two
```

---

## REORGANIZATION-SUMMARY.md Template

**Location:** `REORGANIZATION-SUMMARY.md`

```markdown
# Organized Codebase Applicator - Execution Summary

## Before & After Structure

### BEFORE

\`\`\`
project/
├── [old structure]
\`\`\`

### AFTER

\`\`\`
project/
├── [new structure]
\`\`\`

## Changes Made

| Action | Item | Result |
|--------|------|--------|
| Consolidated | `agents/` | → `.claude/agents/` |
| Consolidated | `commands/` | → `.claude/commands/` |
| Archived | `prompts/` | → `.archive/prompts-deprecated/` |
| Removed | `.claude-plugin/` | Not needed |
| Created | `PLANNING/` | New directory |

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| Root directories | X | Y |
| Duplicate components | X | 0 |
| Claude component locations | Mixed | Unified |
```
