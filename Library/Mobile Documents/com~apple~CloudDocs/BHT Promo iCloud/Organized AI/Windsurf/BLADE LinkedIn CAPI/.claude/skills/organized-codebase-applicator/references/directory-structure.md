# Directory Structure Reference

## Standard Organized Codebase Structure

```
project/
├── .claude/                        # Claude Code configuration (LOCAL)
│   ├── agents/                     # Agent definitions
│   │   └── *.md                    # Agent files
│   ├── commands/                   # Slash commands
│   │   └── *.md                    # Command files
│   ├── hooks/                      # Hooks configuration
│   │   └── hooks.json              # Hook definitions
│   ├── skills/                     # Skills
│   │   └── skill-name/
│   │       ├── SKILL.md            # Skill definition
│   │       ├── references/         # Reference docs
│   │       ├── assets/             # Images, diagrams
│   │       └── scripts/            # Automation scripts
│   ├── settings.json               # Claude settings
│   └── settings.local.json         # Local overrides (gitignored)
│
├── PLANNING/                       # Project planning
│   ├── implementation-phases/      # Phase prompts
│   │   ├── PHASE-0-PROMPT.md
│   │   ├── PHASE-1-PROMPT.md
│   │   └── ...
│   └── IMPLEMENTATION-MASTER-PLAN.md
│
├── CONFIG/                         # Configuration files
│   ├── config.json                 # Main config
│   └── *.json                      # Other configs
│
├── DOCUMENTATION/                  # Technical documentation
│   └── *.md                        # Doc files
│
├── ARCHITECTURE/                   # System architecture
│   └── *.md                        # Architecture docs
│
├── SPECIFICATIONS/                 # Functional/technical specs
│   └── *.md                        # Spec files
│
├── AGENT-HANDOFF/                  # Agent handoff instructions
│   └── HANDOFF.md                  # Main handoff doc
│
├── scripts/                        # Automation scripts
│   └── *.sh                        # Shell scripts
│
├── .archive/                       # Archived/deprecated content
│   └── *-deprecated/               # Archived directories
│
├── src/                            # Source code (if applicable)
├── CLAUDE.md                       # Project overview for Claude
└── README.md                       # Project readme
```

## Directory Purposes

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `.claude/` | All Claude Code components | agents, commands, hooks, skills, settings |
| `.claude/agents/` | Autonomous agent definitions | `*.md` agent files |
| `.claude/commands/` | Slash commands | `*.md` command files |
| `.claude/hooks/` | Hook configurations | `hooks.json` + reference `.md` files |
| `.claude/skills/` | Skills with capabilities | Skill directories with `SKILL.md` |
| `PLANNING/` | Project planning | Implementation phases, master plan |
| `CONFIG/` | Configuration files | JSON config files |
| `DOCUMENTATION/` | Technical docs | Markdown documentation |
| `ARCHITECTURE/` | System architecture | Architecture diagrams, docs |
| `SPECIFICATIONS/` | Specs | Functional/technical specifications |
| `AGENT-HANDOFF/` | Handoff docs | Context for agent continuity |
| `scripts/` | Automation | Shell scripts, utilities |
| `.archive/` | Deprecated content | Archived old content |

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Agents | `kebab-case.md` | `gtm-automation-agent.md` |
| Commands | `kebab-case.md` | `deploy-linkedin.md` |
| Skills | `kebab-case/SKILL.md` | `linkedin-capi/SKILL.md` |
| Phases | `PHASE-N-PROMPT.md` | `PHASE-0-PROMPT.md` |
| Config | `kebab-case.json` | `gtm-config.json` |
| Docs | `UPPERCASE.md` | `CLAUDE.md`, `README.md` |

## Gitignore Recommendations

```gitignore
# Local Claude settings
.claude/settings.local.json

# Regenerable
node_modules/
dist/
build/
.next/
.cache/

# Environment
.env
.env.local
```
