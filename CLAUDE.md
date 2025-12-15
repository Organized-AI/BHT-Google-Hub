# Hackathon Clipper Program

TypeScript CLI application for managing Whop-powered clipper programs.

## Overview

This project enables:
- **Campaign Management**: Create and manage clipper programs with CPM/flat-fee pricing
- **Submission Workflow**: Process clipper submissions with approval/rejection flow
- **Automated Payouts**: Calculate and send payments based on verified views
- **Community Features**: Training courses, forum posts, and notifications

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Whop credentials from https://whop.com/dashboard/developer

# Run CLI
npm run dev help
```

## Implementation Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup | ⏳ |
| 1 | Core Infrastructure | ⏳ |
| 2 | Campaign Management | ⏳ |
| 3 | Submission Workflow | ⏳ |
| 4 | Payout System | ⏳ |
| 5 | Community Features | ⏳ |
| 6 | Integration & Testing | ⏳ |

## Project Structure

```
├── .claude/              # Claude Code configuration
│   ├── agents/           # Agent definitions
│   └── skills/           # Skill definitions with Whop API docs
├── PLANNING/             # Implementation phases
│   ├── IMPLEMENTATION-MASTER-PLAN.md
│   └── implementation-phases/
│       ├── PHASE-0-PROMPT.md
│       ├── PHASE-1-PROMPT.md
│       └── ...
├── src/
│   ├── lib/              # Core utilities
│   ├── services/         # Business logic
│   ├── types/            # Type definitions
│   └── index.ts          # CLI entry point
└── CLAUDE-CODE-PHASE-0.md  # Quick start
```

## How to Build

### Using Claude Code (Terminal)

```bash
cd hackathon-clipper-program
claude --dangerously-skip-permissions
```

Then paste this prompt to start:
```
Read PLANNING/implementation-phases/PHASE-0-PROMPT.md and execute all tasks. After completing each phase, automatically proceed to the next phase prompt until all phases are complete. Create PHASE-X-COMPLETE.md after each phase and git commit your changes.
```

### Using Claude Code Web

Open this project in Claude Code Web and paste:
```
I need you to build the hackathon-clipper-program CLI tool. 

1. First, read .claude/skills/whop-clipper-agent/SKILL.md to understand the Whop API
2. Then read PLANNING/IMPLEMENTATION-MASTER-PLAN.md for the full roadmap
3. Execute phases sequentially starting with PLANNING/implementation-phases/PHASE-0-PROMPT.md
4. Create PHASE-X-COMPLETE.md after each phase
5. Git commit after each phase with descriptive message
6. Proceed automatically to next phase until Phase 6 is complete

IMPORTANT: Before using whop_sdk_api:list_api_endpoints, ALWAYS check .claude/skills/whop-clipper-agent/references/api-endpoints.md first to avoid context bloat.
```

### Phase-by-Phase

Each phase prompt contains:
- Complete code to implement
- Success criteria to verify
- Completion template to create
- Git commit message

## Whop API Integration

Uses `@whop/mcp` SDK with these endpoint groups:

| Category | Endpoints |
|----------|-----------|
| Products | create, retrieve, update, list |
| Plans | create, update, list |
| Entries | list, retrieve, approve, deny |
| Transfers | create, retrieve, list |
| Courses | create courses, chapters, lessons |
| Forums | create posts, list posts |
| Notifications | create |

## Environment Variables

```env
WHOP_API_KEY=your_api_key       # Required
WHOP_APP_ID=app_xxx             # Required  
WHOP_COMPANY_ID=biz_xxx         # Required
```

## Key Documentation

- [Implementation Master Plan](PLANNING/IMPLEMENTATION-MASTER-PLAN.md)
- [Phase 0: Project Setup](PLANNING/implementation-phases/PHASE-0-PROMPT.md)
- [Whop API Docs](https://docs.whop.com/apps)
