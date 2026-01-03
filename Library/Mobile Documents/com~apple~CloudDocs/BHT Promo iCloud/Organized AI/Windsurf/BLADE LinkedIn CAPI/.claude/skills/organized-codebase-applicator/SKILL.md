---
name: organized-codebase-applicator
description: Applies Organized Codebase template structure to existing projects, creates Claude Code Plugins, and cleans up unused/redundant directories. Use when user wants to organize an existing project, apply the Organized Codebase template, create a plugin, clean up a messy codebase, remove iteration folders, standardize project structure, or mentions "organized codebase", "clean up codebase", "apply template", "create plugin", "remove unused folders", "standardize project", or "clean up directories".
---

# Organized Codebase Applicator

Applies the Organized Codebase template to existing projects. **Default behavior**: consolidate ALL Claude components into `.claude/` directory. Plugin structure at root is optional and only for distribution.

> **Context-Aware**: This skill adapts to whatever codebase it's applied to. Always analyze the current project structure first before applying changes. The examples and templates are guides, not prescriptions.

## Skill Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| **References** | `references/` | Documentation and templates |
| `directory-structure.md` | `references/` | Standard directory structure |
| `common-issues.md` | `references/` | Issue detection & resolution |
| `templates.md` | `references/` | Component file templates |
| **Scripts** | `scripts/` | Automation utilities |
| `diagnose.sh` | `scripts/` | Diagnose codebase issues |
| `reorganize.sh` | `scripts/` | Apply reorganization |
| **Assets** | `assets/` | Visual diagrams and examples |
| `workflow-diagram.md` | `assets/` | ASCII workflow and decision trees |
| `example-reorganization-summary.md` | `assets/` | Real-world example output (adapt to your project) |

## Quick Reference: Before & After

### BEFORE (Disorganized)

```
project/
├── .claude/                    # Partial local config
│   ├── agents/
│   │   └── my-agent.md         ← DUPLICATE
│   ├── commands/
│   │   └── command-a.md
│   └── skills/                 ← EMPTY
│
├── .claude-plugin/             ← UNNECESSARY
│   └── plugin.json
│
├── agents/                     ← ROOT DUPLICATE
│   └── my-agent.md
│
├── commands/                   ← ROOT DUPLICATE
│   └── command-b.md
│
├── skills/                     ← MIXED LOCATION
│   ├── project-skill/
│   └── generic-skill/          ← SHOULDN'T BE HERE
│
├── prompts/                    ← DEPRECATED
│   └── old-prompts.md
│
├── docs/                       ← NON-STANDARD
└── src/
```

### AFTER (Organized)

```
project/
├── .claude/                    # ALL Claude components here
│   ├── agents/
│   │   └── my-agent.md
│   ├── commands/
│   │   ├── command-a.md
│   │   └── command-b.md
│   ├── hooks/
│   │   └── hooks.json
│   ├── skills/
│   │   ├── project-skill/
│   │   └── generic-skill/
│   ├── settings.json
│   └── settings.local.json
│
├── PLANNING/
│   └── implementation-phases/
├── CONFIG/
├── DOCUMENTATION/
├── ARCHITECTURE/
├── SPECIFICATIONS/
├── AGENT-HANDOFF/
├── scripts/
├── .archive/                   # Deprecated content preserved
│   └── prompts-deprecated/
│
├── src/
├── CLAUDE.md
└── README.md
```

---

## Workflow Overview

| Phase | Purpose | Key Actions |
|-------|---------|-------------|
| 1. Analysis | Understand current state | `find . -type d -maxdepth 3`, identify duplicates |
| 2. Identify Issues | Find problems | Duplicates, wrong locations, deprecated content |
| 3. Consolidate | Move to `.claude/` | All agents, commands, hooks, skills → `.claude/` |
| 4. Create Dirs | Standard structure | PLANNING/, CONFIG/, DOCUMENTATION/, etc. |
| 5. Archive | Preserve deprecated | Old content → `.archive/` |
| 6. Finalize | Update docs | CLAUDE.md, README.md, git commit |

---

## Phase 1: Analysis

Run these commands to understand current state:

```bash
# List directory structure
find . -type d -maxdepth 3 | grep -v ".git" | sort

# Check for duplicates
ls -la .claude/agents/ agents/ 2>/dev/null
ls -la .claude/commands/ commands/ 2>/dev/null
ls -la .claude/skills/ skills/ 2>/dev/null
ls -la .claude/hooks/ hooks/ 2>/dev/null

# Check for plugin structure (usually unnecessary)
ls -la .claude-plugin/ 2>/dev/null
```

---

## Phase 2: Identify Issues

### Common Problems to Find

| Issue | Detection | Solution |
|-------|-----------|----------|
| **Duplicate agents** | Same file in `.claude/agents/` AND `agents/` | Keep one, consolidate to `.claude/agents/` |
| **Duplicate commands** | Files in both locations | Merge to `.claude/commands/` |
| **Mixed skills** | Generic skills mixed with project-specific | All go to `.claude/skills/` |
| **Unnecessary plugin** | `.claude-plugin/` exists but not distributing | Remove `.claude-plugin/`, use `.claude/` |
| **Deprecated content** | `prompts/`, old versions | Archive to `.archive/` |
| **Wrong naming** | `Repo manager skill` (spaces) | Rename to kebab-case: `repo-manager` |
| **Empty directories** | `.claude/skills/` empty while `skills/` has content | Move content, remove empty |

### Redundancy Patterns to Archive

```bash
# Auto-archive these patterns
*-pwa/           # PWA variants
*-app/           # App variants
*-v[0-9]*/       # Version iterations
*-old/           # Old versions
*-backup/        # Backups
prompts/         # If superseded by PLANNING/
```

---

## Phase 3: Consolidate to `.claude/`

**DEFAULT PATTERN**: Everything goes in `.claude/`

```bash
# Create .claude structure if needed
mkdir -p .claude/{agents,commands,hooks,skills}

# Move root components to .claude/ (if they exist at root)
mv agents/*.md .claude/agents/ 2>/dev/null && rmdir agents
mv commands/*.md .claude/commands/ 2>/dev/null && rmdir commands
mv hooks/*.json .claude/hooks/ 2>/dev/null && rmdir hooks
mv skills/* .claude/skills/ 2>/dev/null && rmdir skills

# Remove unnecessary plugin structure
rm -rf .claude-plugin/

# Remove duplicates (keep .claude/ version)
# Compare first: diff .claude/agents/file.md agents/file.md
```

### Handling Duplicates

```bash
# Check if files are identical
diff .claude/agents/my-agent.md agents/my-agent.md

# If identical, remove the root version
rm agents/my-agent.md && rmdir agents

# If different, merge manually or keep newer version
```

---

## Phase 4: Create Standard Directories

```bash
# Documentation structure
mkdir -p PLANNING/implementation-phases
mkdir -p ARCHITECTURE
mkdir -p DOCUMENTATION
mkdir -p SPECIFICATIONS
mkdir -p AGENT-HANDOFF
mkdir -p CONFIG
mkdir -p scripts
mkdir -p .archive
```

### Target Structure

```
.claude/                    # ALL Claude Code components
├── agents/                 # Agent definitions
├── commands/               # Slash commands
├── hooks/                  # Pre/post hooks
├── skills/                 # Skills (project + utility)
├── settings.json           # Claude settings
└── settings.local.json     # Local overrides (gitignored)

PLANNING/                   # Project planning
├── implementation-phases/  # Phase prompts
└── *.md                    # Planning docs

CONFIG/                     # Configuration files
DOCUMENTATION/              # Technical documentation
ARCHITECTURE/               # System architecture
SPECIFICATIONS/             # Functional/technical specs
AGENT-HANDOFF/              # Agent handoff docs
scripts/                    # Automation scripts
.archive/                   # Archived/deprecated content
```

---

## Phase 5: Archive Deprecated Content

**Never delete - always archive:**

```bash
# Create archive directory
mkdir -p .archive

# Archive deprecated directories
mv prompts .archive/prompts-deprecated
mv old-docs .archive/old-docs-deprecated

# Archive iteration versions
mv project-v1 .archive/
mv project-old .archive/
```

### What Can Be Deleted (Regenerable)

```bash
# These are safe to delete (can be regenerated)
rm -rf node_modules/
rm -rf dist/
rm -rf build/
rm -rf .next/
rm -rf .cache/
```

---

## Phase 6: Finalize

### 1. Update CLAUDE.md

Add project structure section:

```markdown
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
```

### 2. Update README.md

Add structure section showing the organized layout.

### 3. Create Summary

Create `REORGANIZATION-SUMMARY.md` with before/after ASCII:

```markdown
# Reorganization Summary

## Before
[ASCII tree of old structure]

## After
[ASCII tree of new structure]

## Changes Made
| Action | Item | Result |
|--------|------|--------|
| Consolidated | agents/ | → .claude/agents/ |
| ... | ... | ... |
```

### 4. Git Commit

```bash
git add -A
git commit -m "Apply Organized Codebase template

- Consolidated all Claude components to .claude/
- Created standard directory structure
- Archived deprecated content
- Updated documentation"
```

---

## When to Use Plugin Structure (Exception)

**Only use plugin structure when distributing to others:**

```
# Plugin structure (ONLY for distribution)
project/
├── .claude-plugin/
│   └── plugin.json          # Required for plugins
├── commands/                # At root for plugins
├── agents/                  # At root for plugins
├── skills/                  # At root for plugins
├── hooks/                   # At root for plugins
└── .claude/
    └── settings.json        # Local settings only
```

### Plugin Decision Tree

```
Is this project being distributed as a plugin?
├── YES → Use plugin structure (root directories + .claude-plugin/)
└── NO → Use local structure (everything in .claude/)
        └── Most projects should use this!
```

---

## Component Templates

### Command Template (`.claude/commands/my-command.md`)

```markdown
---
description: Brief description of what this command does
---

# Command Title

## What This Command Does

1. Step one
2. Step two

## Prerequisites

- Requirement one

## Success Criteria

- [ ] Expected outcome
```

### Agent Template (`.claude/agents/my-agent.md`)

```markdown
---
name: agent-name
description: Agent description
triggers:
  - "trigger phrase one"
---

# Agent Name

## Purpose

What this agent does autonomously.

## Workflow

### Phase 1: [Name]
[Steps]

## Success Criteria

- [ ] Outcome one
```

### Skill Template (`.claude/skills/my-skill/SKILL.md`)

```markdown
---
name: skill-name
description: What this skill enables Claude to do
---

# Skill Name

## Capabilities

- Capability one

## Usage

How Claude should apply this skill.
```

### Hooks Template (`.claude/hooks/hooks.json`)

```json
{
  "hooks": [
    {
      "name": "pre-deploy",
      "event": "before_command",
      "command_pattern": "deploy",
      "action": {
        "type": "prompt",
        "content": "Verify requirements before deploying."
      }
    }
  ]
}
```

---

## Migration Table

| Old Location | New Location |
|--------------|--------------|
| `agents/` | `.claude/agents/` |
| `commands/` | `.claude/commands/` |
| `skills/` | `.claude/skills/` |
| `hooks/` | `.claude/hooks/` |
| `docs/` | `DOCUMENTATION/` |
| `prompts/` | `.archive/prompts-deprecated/` OR `PLANNING/` |
| `experiments/` | `PLANNING/experiments/` |
| `.claude-plugin/` | Remove (unless distributing) |

---

## Execution Checklist

```markdown
## Organized Codebase Application

- [ ] **Phase 1**: Analyzed current structure
- [ ] **Phase 2**: Identified duplicates and issues
- [ ] **Phase 3**: Consolidated all components to `.claude/`
  - [ ] Moved agents
  - [ ] Moved commands
  - [ ] Moved hooks
  - [ ] Moved skills
  - [ ] Removed root duplicates
  - [ ] Removed `.claude-plugin/` (if not distributing)
- [ ] **Phase 4**: Created standard directories
  - [ ] PLANNING/
  - [ ] CONFIG/
  - [ ] DOCUMENTATION/
  - [ ] ARCHITECTURE/
  - [ ] SPECIFICATIONS/
  - [ ] AGENT-HANDOFF/
  - [ ] scripts/
  - [ ] .archive/
- [ ] **Phase 5**: Archived deprecated content
- [ ] **Phase 6**: Finalized
  - [ ] Updated CLAUDE.md
  - [ ] Updated README.md
  - [ ] Created REORGANIZATION-SUMMARY.md
  - [ ] Git committed changes
```

---

## Quick Commands

```bash
# Full reorganization (local structure)
mkdir -p .claude/{agents,commands,hooks,skills}
mkdir -p PLANNING/implementation-phases ARCHITECTURE DOCUMENTATION SPECIFICATIONS
mkdir -p AGENT-HANDOFF CONFIG scripts .archive

# Move root Claude components to .claude/
for dir in agents commands hooks skills; do
  if [ -d "$dir" ] && [ -d ".claude/$dir" ]; then
    mv $dir/* .claude/$dir/ 2>/dev/null
    rmdir $dir 2>/dev/null
  fi
done

# Remove plugin structure if not distributing
rm -rf .claude-plugin

# Git commit
git add -A && git commit -m "Apply Organized Codebase template"
```
