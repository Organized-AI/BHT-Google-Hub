# Organized Codebase Applicator - Workflow Diagram

## Main Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZED CODEBASE APPLICATOR                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ANALYSIS                                              │
│  ─────────────────                                              │
│  • Run diagnose.sh or manual inspection                         │
│  • Identify: duplicates, deprecated content, missing dirs       │
│  • Determine: local (.claude/) vs plugin (root) structure       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: IDENTIFY ISSUES                                       │
│  ────────────────────────                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Duplicates  │ │ Deprecated  │ │   Missing   │               │
│  │ at root +   │ │ prompts/    │ │  PLANNING/  │               │
│  │ .claude/    │ │ *-old/      │ │  CONFIG/    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: CONSOLIDATE TO .claude/                               │
│  ────────────────────────────────                               │
│                                                                 │
│  agents/     ──────────────────────────▶  .claude/agents/       │
│  commands/   ──────────────────────────▶  .claude/commands/     │
│  hooks/      ──────────────────────────▶  .claude/hooks/        │
│  skills/     ──────────────────────────▶  .claude/skills/       │
│                                                                 │
│  .claude-plugin/  ─────▶  REMOVE (unless distributing)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: CREATE STANDARD DIRECTORIES                          │
│  ────────────────────────────────────                           │
│                                                                 │
│  mkdir -p:                                                      │
│    • PLANNING/implementation-phases/                            │
│    • CONFIG/                                                    │
│    • DOCUMENTATION/                                             │
│    • ARCHITECTURE/                                              │
│    • SPECIFICATIONS/                                            │
│    • AGENT-HANDOFF/                                             │
│    • scripts/                                                   │
│    • .archive/                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: ARCHIVE DEPRECATED                                    │
│  ───────────────────────────                                    │
│                                                                 │
│  prompts/   ──────────────────▶  .archive/prompts-deprecated/   │
│  docs/      ──────────────────▶  DOCUMENTATION/ (migrate)       │
│  *-old/     ──────────────────▶  .archive/                      │
│  *-backup/  ──────────────────▶  .archive/                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: FINALIZE                                              │
│  ────────────────                                               │
│                                                                 │
│  1. Update CLAUDE.md with new structure                         │
│  2. Update README.md                                            │
│  3. Create REORGANIZATION-SUMMARY.md                            │
│  4. Git commit                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │   DONE   │
                        └──────────┘
```

## Decision Tree: Local vs Plugin

```
                    ┌──────────────────────────┐
                    │  Is this project being   │
                    │  distributed as a plugin │
                    │  to other users/teams?   │
                    └──────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
        ┌─────────┐                     ┌─────────┐
        │   YES   │                     │   NO    │
        └─────────┘                     └─────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    PLUGIN STRUCTURE     │    │    LOCAL STRUCTURE      │
│    ─────────────────    │    │    ───────────────      │
│                         │    │                         │
│  .claude-plugin/        │    │  .claude/               │
│    └── plugin.json      │    │    ├── agents/          │
│                         │    │    ├── commands/        │
│  agents/    (at root)   │    │    ├── hooks/           │
│  commands/  (at root)   │    │    ├── skills/          │
│  skills/    (at root)   │    │    └── settings.json    │
│  hooks/     (at root)   │    │                         │
│                         │    │  (No root components)   │
│  .claude/               │    │                         │
│    └── settings.json    │    │                         │
└─────────────────────────┘    └─────────────────────────┘
              │                               │
              │                               │
              ▼                               ▼
   ┌──────────────────┐          ┌──────────────────┐
   │  Distributable   │          │  Project-only    │
   │  via marketplace │          │  configuration   │
   └──────────────────┘          └──────────────────┘
```

## Component Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     BEFORE REORGANIZATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  project/                                                       │
│  ├── .claude/                    ◄─── Partial config           │
│  │   ├── agents/my-agent.md      ◄─── DUPLICATE                │
│  │   └── settings.json                                         │
│  ├── .claude-plugin/             ◄─── Unnecessary              │
│  ├── agents/my-agent.md          ◄─── DUPLICATE                │
│  ├── commands/cmd.md             ◄─── Wrong location           │
│  ├── skills/                     ◄─── Wrong location           │
│  ├── prompts/                    ◄─── Deprecated               │
│  └── docs/                       ◄─── Non-standard             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │  reorganize.sh
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AFTER REORGANIZATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  project/                                                       │
│  ├── .claude/                    ◄─── ALL components here      │
│  │   ├── agents/my-agent.md                                    │
│  │   ├── commands/cmd.md                                       │
│  │   ├── hooks/                                                │
│  │   ├── skills/                                               │
│  │   └── settings.json                                         │
│  ├── PLANNING/                   ◄─── Standard directories     │
│  ├── CONFIG/                                                   │
│  ├── DOCUMENTATION/              ◄─── docs/ content moved here │
│  ├── ARCHITECTURE/                                             │
│  ├── SPECIFICATIONS/                                           │
│  ├── AGENT-HANDOFF/                                            │
│  ├── scripts/                                                  │
│  ├── .archive/                   ◄─── Deprecated preserved     │
│  │   └── prompts-deprecated/                                   │
│  ├── CLAUDE.md                                                 │
│  └── README.md                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
