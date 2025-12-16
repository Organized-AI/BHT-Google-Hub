---
name: gtm-debug-agent
description: Automated Google Tag Manager debugging with visual monitoring, screenshot annotation, and MCP integration. Use when testing GTM configurations, verifying tag firing, debugging dataLayer events, validating consent mode, checking tracking implementations, or automating GTM container builds with Stape/GTM MCP servers. Triggers on "debug GTM", "test GTM tags", "GTM preview", "verify tag firing", "check dataLayer", "monitor tags", "validate consent", "did my GTM fix work", "validate tracking", "annotate screenshot", "GTM QA", or when verifying configuration changes via browser automation.
---

# GTM Debug Agent

Automated workflow for debugging Google Tag Manager implementations using browser automation with visual monitoring, annotated screenshots, and MCP server integration for end-to-end container build validation.

## Prerequisites

**Required MCP/Tools:**
- browser-use MCP (or Playwright MCP) - Browser automation
- filesystem MCP - Saving reports and screenshots
- sequential-thinking - Analysis workflow

**Optional MCP Integrations:**
- google-tag-manager MCP - Container configuration management
- Stape MCP - Server-side tagging validation

## Debug Workflow

### Phase 1: Setup

**Step 1: Gather Information**
```
Required from user:
- GTM Container ID (GTM-XXXXXXX)
- Target URL to test
- Specific tags or events to validate
- Actions to perform (clicks, form submissions, etc.)
```

**Step 2: Construct Preview URL**
```
GTM Preview URL format:
https://tagassistant.google.com/#/?id=GTM-XXXXXXX&url=https://target-site.com

Alternative: Add ?gtm_debug=x parameter to target URL
```

## Monitoring Dashboard

The agent monitors four key areas in GTM Preview mode:

### 1. Tags Monitor
```
WHAT TO CAPTURE:
- Tags Fired (green checkmarks)
- Tags Not Fired (red X or gray)
- Tag execution order
- Firing triggers for each tag
- Tag type (GA4, Meta Pixel, Custom HTML, etc.)

SCREENSHOT ANNOTATION:
- Red arrow → Successfully fired tags
- Label with tag name and trigger
```

### 2. Variables Monitor
```
WHAT TO CAPTURE:
- Variable names and current values
- Built-in variables (Page URL, Click Classes, etc.)
- User-defined variables
- Data Layer variables
- Value at each event timestamp

SCREENSHOT ANNOTATION:
- Red arrow → Variables with expected values
- Highlight mismatched or undefined values
```

### 3. Consent Monitor
```
WHAT TO CAPTURE:
- Consent Mode state (granted/denied)
- analytics_storage status
- ad_storage status
- ad_user_data status
- ad_personalization status
- Consent update events

SCREENSHOT ANNOTATION:
- Red arrow → Consent state transitions
- Highlight blocking consent states
```

### 4. dataLayer Monitor
```
WHAT TO CAPTURE:
- All dataLayer.push() events
- Event names and timestamps
- Ecommerce data structures
- Custom event parameters
- GTM internal events (gtm.js, gtm.dom, gtm.load)

SCREENSHOT ANNOTATION:
- Red arrow → Target events found
- Label with event name and key parameters
```

### Phase 2: Browser Capture

**Step 1: Navigate with Preview Mode**
```javascript
// Browser automation sequence
1. Open GTM Tag Assistant URL
2. Click "Connect" to enable preview
3. Navigate to target URL (opens in new tab with preview active)
4. Wait for page load and GTM initialization
```

**Step 2: Capture Baseline State**
```javascript
// Inject script to capture dataLayer
const captureDataLayer = () => {
  return JSON.stringify(window.dataLayer || [], null, 2);
};

// Capture initial state
const baseline = {
  timestamp: new Date().toISOString(),
  dataLayer: captureDataLayer(),
  url: window.location.href
};
```

**Step 3: Execute Test Actions**
```javascript
// For each user-defined action:
// 1. Perform action (click, scroll, form submit)
// 2. Wait for network idle
// 3. Capture dataLayer delta
// 4. Screenshot GTM debug panel
```

### Phase 3: Analysis

**dataLayer Event Validation**
```javascript
// Check for expected events
const validateDataLayer = (captured, expected) => {
  const events = captured.filter(e => e.event);
  return expected.map(exp => ({
    event: exp,
    found: events.some(e => e.event === exp),
    data: events.find(e => e.event === exp)
  }));
};
```

**Tag Firing Status**
```
Parse GTM Debug Panel for:
- Tags Fired: [list with trigger info]
- Tags Not Fired: [list with blocking reason]
- Variables: [values at each event]
```

### Phase 4: Report Generation

**Output Format**
```markdown
# GTM Debug Report

## Test Summary
- URL: [target URL]
- Container: GTM-XXXXXXX
- Timestamp: [ISO datetime]

## Results

### ✅ Passed
- [Tag Name] fired on [trigger]
- dataLayer.push({event: 'purchase'}) detected

### ❌ Failed
- [Tag Name] did not fire
  - Expected trigger: [condition]
  - Actual state: [what happened]

### ⚠️ Warnings
- [Unexpected behavior or suggestions]

## dataLayer Snapshot
[JSON dump of relevant events]

## Recommendations
[Actionable fixes if failures detected]
```

## Test Case Format

Define test scenarios using this structure:

```json
{
  "testName": "Purchase Event Tracking",
  "gtmContainerId": "GTM-XXXXXXX",
  "targetUrl": "https://example.com/checkout",
  "actions": [
    {"type": "wait", "selector": "#buy-button", "timeout": 5000},
    {"type": "click", "selector": "#buy-button"},
    {"type": "wait", "duration": 2000},
    {"type": "capture", "name": "after_purchase"}
  ],
  "expectedOutcomes": {
    "tagsFired": ["GA4 - Purchase", "Meta Pixel - Purchase"],
    "dataLayerEvents": ["purchase", "conversion"],
    "dataLayerContains": {
      "ecommerce.transaction_id": "*",
      "ecommerce.value": "*"
    }
  }
}
```

## Common Debug Scenarios

**Scenario 1: Tag Not Firing**
1. Check trigger conditions in GTM
2. Verify dataLayer event name matches exactly
3. Check for consent mode blocking
4. Verify tag sequencing dependencies

**Scenario 2: Wrong Data in Tag**
1. Inspect variable values at event time
2. Check dataLayer structure matches expected schema
3. Verify variable scope (page-level vs event-level)

**Scenario 3: Duplicate Tags**
1. Check for multiple triggers on same event
2. Verify tag firing options (once per page vs unlimited)
3. Look for DOM observer conflicts

## Browser Automation Commands

See `scripts/browser-commands.js` for reusable automation snippets.
See `scripts/annotate_screenshot.py` for screenshot annotation with red arrows.
See `scripts/gtm_monitor.py` for comprehensive monitoring orchestration.

## Resources

### scripts/
- `browser-commands.js` - Playwright/browser-use functions for dataLayer capture
- `annotate_screenshot.py` - Red arrow annotation on screenshots (requires Pillow)
- `gtm_monitor.py` - Full monitoring workflow with validation

### references/
- `gtm-selectors.md` - DOM selectors for GTM Tag Assistant panel
- `datalayer-patterns.md` - Common dataLayer validation patterns
- `test-case-template.json` - JSON schema for test scenarios
- `mcp-integration.md` - Complete Stape & GTM MCP integration guide

## Quick Start

**Minimal Debug Session:**
```
1. Provide: GTM-XXXXXXX, target URL, expected tags/events
2. Agent opens GTM Preview mode
3. Navigates to target, captures baseline
4. Executes test actions
5. Screenshots each monitoring tab (Tags, Variables, Consent, dataLayer)
6. Annotates screenshots with red arrows on successes
7. Generates pass/fail report
```

**Automated Build Pipeline:**
```
1. Create tags via GTM MCP
2. Create preview version
3. Run debug validation with screenshots
4. If passed → Publish live
5. If failed → Generate fix recommendations with annotated screenshots
6. Verify server-side delivery via Stape MCP
```

## Screenshot Annotation Workflow

### Capture & Annotate Process

**Step 1: Take Screenshot**
```python
# Using browser automation
screenshot = await page.screenshot(full_page=False)
# Save to working directory
save_path = f"screenshots/{timestamp}_{event_name}.png"
```

**Step 2: Annotate with Red Arrows**
```python
# Use scripts/annotate_screenshot.py
from annotate_screenshot import ScreenshotAnnotator

annotator = ScreenshotAnnotator(screenshot_path)

# Add red arrow pointing to success element
annotator.add_arrow(
    start=(x1, y1),  # Arrow tail
    end=(x2, y2),    # Arrow head (points to element)
    label="✓ GA4 Purchase Tag Fired"
)

# Save annotated version
annotator.save(f"annotated_{screenshot_name}.png")
```

**Step 3: Annotation Targets**
```
TAG SUCCESS:
- Arrow points to green checkmark next to tag name
- Label: "✓ {Tag Name} fired on {Trigger}"

VARIABLE VALUE:
- Arrow points to variable value cell
- Label: "{Variable Name} = {Value}"

CONSENT GRANTED:
- Arrow points to consent status indicator
- Label: "✓ {storage_type} = granted"

DATALAYER EVENT:
- Arrow points to event row in dataLayer tab
- Label: "✓ Event: {event_name}"
```

### Visual Report Generation

Each debug session produces:
1. `baseline.png` - Initial page state
2. `{action}_before.png` - State before each action
3. `{action}_after_annotated.png` - Annotated result showing successes
4. `final_summary_annotated.png` - Overview with all validations marked

## MCP Server Integration

### google-tag-manager MCP

Use for container configuration before testing:

```python
# Get container info
gtm_mcp.get_container(account_id, container_id)

# List all tags in container
tags = gtm_mcp.list_tags(account_id, container_id, workspace_id)

# Get specific tag configuration
tag_config = gtm_mcp.get_tag(account_id, container_id, workspace_id, tag_id)

# Create new tag (then validate with debug agent)
new_tag = gtm_mcp.create_tag(account_id, container_id, workspace_id, tag_config)

# Publish container version
gtm_mcp.publish_version(account_id, container_id, version_id)
```

**Automated Build Workflow:**
1. Create/modify tags via GTM MCP
2. Publish to preview (not live)
3. Run GTM Debug Agent to validate
4. If passed → Publish live version
5. If failed → Generate fix recommendations

### Stape MCP Integration

Validate server-side tagging alongside client-side:

```python
# Get Stape container status
stape_mcp.stape_container_crud(action="list")

# Check container analytics
stape_mcp.stape_container_analytics(container_id)

# Verify CAPI endpoint is receiving events
stape_mcp.stape_container_statistics(container_id, date_range)
```

**Server-Side Validation Flow:**
1. Trigger client-side event via browser automation
2. Capture dataLayer push
3. Verify Stape container received the event
4. Cross-reference Meta CAPI / GA4 Measurement Protocol delivery
5. Annotate screenshots showing end-to-end flow

### End-to-End Automation Example

```python
# Full automated GTM build and validate workflow

async def automated_gtm_build_and_test(config):
    # 1. Create tag via GTM MCP
    tag = await gtm_mcp.create_tag(
        account_id=config.account_id,
        container_id=config.container_id,
        workspace_id=config.workspace_id,
        tag_body={
            "name": "GA4 - Purchase Event",
            "type": "gaawe",  # GA4 Event tag
            "parameter": [...]
        }
    )
    
    # 2. Create preview version
    preview = await gtm_mcp.create_version(
        account_id=config.account_id,
        container_id=config.container_id,
        workspace_id=config.workspace_id
    )
    
    # 3. Run GTM Debug Agent
    debug_results = await gtm_debug_agent.run_test({
        "gtmContainerId": config.container_id,
        "targetUrl": config.test_url,
        "actions": config.test_actions,
        "expectedOutcomes": {
            "tagsFired": ["GA4 - Purchase Event"],
            "dataLayerEvents": ["purchase"]
        }
    })
    
    # 4. Check Stape delivery (if server-side)
    if config.uses_stape:
        stape_stats = await stape_mcp.stape_container_statistics(
            container_id=config.stape_container_id
        )
        debug_results.server_side_validation = stape_stats
    
    # 5. Generate annotated report
    annotated_screenshots = await annotate_all_screenshots(
        debug_results.screenshots,
        debug_results.successes
    )
    
    # 6. Publish if all validations passed
    if debug_results.all_passed:
        await gtm_mcp.publish_version(
            account_id=config.account_id,
            container_id=config.container_id,
            version_id=preview.version_id
        )
        return {"status": "published", "report": annotated_screenshots}
    else:
        return {"status": "failed", "report": annotated_screenshots, 
                "recommendations": debug_results.fix_recommendations}
```
