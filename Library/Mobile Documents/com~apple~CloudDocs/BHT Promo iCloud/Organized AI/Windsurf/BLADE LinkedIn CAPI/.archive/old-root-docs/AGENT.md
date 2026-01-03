# LinkedIn GTM Agent

> Autonomous agent for deploying LinkedIn Insight Tag to GTM containers

## Quick Start

```bash
cd "BLADE LinkedIn CAPI"
claude --dangerously-skip-permissions
```

Then say:
```
Deploy LinkedIn tracking for BLADE
```

## What It Does

The agent autonomously executes:

1. **Installs template** from Community Gallery (no manual UI!)
2. **Creates variables** for Partner ID, Event ID, cookie
3. **Creates tags** for pageview and conversions
4. **Validates** workspace for conflicts
5. **Generates preview** URL for testing
6. **Creates version** with descriptive notes
7. **Publishes** to live environment
8. **Verifies** deployment success

## Required Input

The agent will ask for:
- **LinkedIn Partner ID** (get from Campaign Manager → Account Assets → Insight Tag)

## Trigger Phrases

Any of these will activate the agent:
- "Deploy LinkedIn tracking"
- "Install LinkedIn Insight Tag"  
- "Run GTM automation"
- "Execute BLADE LinkedIn"
- "Start LinkedIn implementation"

## Agent Location

`.claude/agents/gtm-linkedin-automation-agent.md`

## No Manual Steps Required

The agent handles everything programmatically via GTM MCP tools:
- Template installation → `gtm_template create`
- Variable creation → `gtm_variable create`
- Tag creation → `gtm_tag create`
- Preview generation → `gtm_workspace quickPreview`
- Version creation → `gtm_workspace createVersion`
- Publishing → `gtm_version publish`
- Verification → `gtm_version live`
