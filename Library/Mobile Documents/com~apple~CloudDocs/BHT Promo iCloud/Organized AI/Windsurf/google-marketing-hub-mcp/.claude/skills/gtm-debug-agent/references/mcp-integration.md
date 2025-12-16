# MCP Server Integration Reference

Integration patterns for using GTM Debug Agent with google-tag-manager MCP and Stape MCP servers.

## google-tag-manager MCP

### Connection Setup

The GTM MCP server connects to Google Tag Manager API v2.

```
MCP Server: google-tag-manager
Auth: OAuth2 (Google Cloud credentials)
Scopes: tagmanager.edit.containers, tagmanager.publish
```

### Common Operations

#### List Containers
```python
# Get all containers in an account
containers = gtm_mcp.list_containers(account_id="accounts/XXXXXX")
```

#### Get Container Details
```python
# Get specific container
container = gtm_mcp.get_container(
    path="accounts/XXXXXX/containers/XXXXXXX"
)

# Response includes:
# - containerId
# - publicId (GTM-XXXXXXX)
# - name
# - usageContext
# - tagManagerUrl
```

#### Workspace Operations
```python
# List workspaces
workspaces = gtm_mcp.list_workspaces(
    parent="accounts/XXXXXX/containers/XXXXXXX"
)

# Create workspace for testing
workspace = gtm_mcp.create_workspace(
    parent="accounts/XXXXXX/containers/XXXXXXX",
    body={
        "name": "Debug Test Workspace",
        "description": "Automated testing workspace"
    }
)
```

### Tag Management

#### List Tags
```python
tags = gtm_mcp.list_tags(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX"
)

# Each tag includes:
# - tagId
# - name
# - type (e.g., "gaawe" for GA4, "html" for Custom HTML)
# - parameter
# - firingTriggerId
# - blockingTriggerId
# - paused
```

#### Create Tag
```python
# GA4 Event Tag
ga4_tag = gtm_mcp.create_tag(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX",
    body={
        "name": "GA4 - Purchase",
        "type": "gaawe",  # Google Analytics 4 Event
        "parameter": [
            {"type": "template", "key": "measurementId", "value": "G-XXXXXXX"},
            {"type": "template", "key": "eventName", "value": "purchase"},
            {"type": "list", "key": "eventParameters", "list": [
                {"type": "map", "map": [
                    {"type": "template", "key": "name", "value": "transaction_id"},
                    {"type": "template", "key": "value", "value": "{{DLV - transaction_id}}"}
                ]}
            ]}
        ],
        "firingTriggerId": ["TRIGGER_ID"]
    }
)

# Meta Pixel Tag
meta_tag = gtm_mcp.create_tag(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX",
    body={
        "name": "Meta Pixel - Purchase",
        "type": "html",
        "parameter": [
            {"type": "template", "key": "html", "value": """
                <script>
                    fbq('track', 'Purchase', {
                        value: {{DLV - value}},
                        currency: '{{DLV - currency}}'
                    });
                </script>
            """}
        ],
        "firingTriggerId": ["TRIGGER_ID"]
    }
)
```

#### Update Tag
```python
updated_tag = gtm_mcp.update_tag(
    path="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX/tags/XXX",
    body={
        "name": "GA4 - Purchase (Updated)",
        "parameter": [...]
    }
)
```

### Trigger Management

#### List Triggers
```python
triggers = gtm_mcp.list_triggers(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX"
)
```

#### Create Custom Event Trigger
```python
trigger = gtm_mcp.create_trigger(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX",
    body={
        "name": "CE - purchase",
        "type": "customEvent",
        "customEventFilter": [
            {
                "type": "equals",
                "parameter": [
                    {"type": "template", "key": "arg0", "value": "{{_event}}"},
                    {"type": "template", "key": "arg1", "value": "purchase"}
                ]
            }
        ]
    }
)
```

### Variable Management

#### Create Data Layer Variable
```python
dlv = gtm_mcp.create_variable(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX",
    body={
        "name": "DLV - transaction_id",
        "type": "v",  # Data Layer Variable
        "parameter": [
            {"type": "template", "key": "name", "value": "ecommerce.transaction_id"},
            {"type": "integer", "key": "dataLayerVersion", "value": "2"}
        ]
    }
)
```

### Version & Publishing

#### Create Version
```python
version = gtm_mcp.create_version(
    parent="accounts/XXXXXX/containers/XXXXXXX/workspaces/XX",
    body={
        "name": "v1.2.0 - Added purchase tracking",
        "notes": "Created via automated build"
    }
)
```

#### Publish Version
```python
# Only publish after debug validation passes!
published = gtm_mcp.publish_version(
    path="accounts/XXXXXX/containers/XXXXXXX/versions/XXX"
)
```

## Stape MCP

### Connection Setup

```
MCP Server: stape
Auth: API Key
Base URL: https://app.stape.io/api/v1
```

### Container Operations

#### List Containers
```python
containers = stape_mcp.stape_container_crud(
    action="list"
)
```

#### Get Container Details
```python
container = stape_mcp.stape_container_crud(
    action="get",
    container_id="CONTAINER_ID"
)

# Response includes:
# - id
# - name
# - status (running/stopped)
# - domain
# - region
# - gtm_server_container_id
```

#### Create Container
```python
new_container = stape_mcp.stape_container_crud(
    action="create",
    body={
        "name": "Production sGTM",
        "region": "europe-west1",  # For GDPR compliance
        "gtm_server_container_id": "GTM-SERVER-XXXXXX"
    }
)
```

### Domain Configuration

```python
# Add custom domain for first-party data
domain = stape_mcp.stape_container_domains(
    container_id="CONTAINER_ID",
    action="add",
    domain="track.yourdomain.com"
)
```

### Analytics & Statistics

#### Container Analytics
```python
analytics = stape_mcp.stape_container_analytics(
    container_id="CONTAINER_ID",
    start_date="2024-01-01",
    end_date="2024-01-31"
)

# Response includes:
# - requests_total
# - requests_by_client (GA4, Meta, etc.)
# - response_times
# - error_rates
```

#### Request Statistics
```python
stats = stape_mcp.stape_container_statistics(
    container_id="CONTAINER_ID",
    period="24h"
)

# Use to verify events are flowing through sGTM
```

### Power-Ups

```python
# Enable enhanced features
powerups = stape_mcp.stape_container_power_ups(
    container_id="CONTAINER_ID",
    action="enable",
    powerup="meta_capi_gateway"
)
```

## Integration Workflow

### Automated Build & Validate Pattern

```python
async def automated_gtm_pipeline(config):
    """
    Full automation pipeline:
    1. Create/update GTM configuration
    2. Create preview version
    3. Run debug validation
    4. If passed, publish to live
    5. Verify server-side delivery
    """
    
    results = {
        "status": "pending",
        "steps": []
    }
    
    # Step 1: Configure GTM
    try:
        # Create or update tags via GTM MCP
        for tag_config in config.tags:
            tag = await gtm_mcp.create_tag(
                parent=config.workspace_path,
                body=tag_config
            )
            results["steps"].append({
                "action": "create_tag",
                "name": tag_config["name"],
                "status": "success"
            })
    except Exception as e:
        results["steps"].append({"action": "create_tag", "error": str(e)})
        results["status"] = "failed"
        return results
    
    # Step 2: Create preview version
    try:
        version = await gtm_mcp.create_version(
            parent=config.workspace_path,
            body={"name": f"Auto-build {datetime.now().isoformat()}"}
        )
        results["version_id"] = version["containerVersionId"]
        results["steps"].append({
            "action": "create_version",
            "status": "success"
        })
    except Exception as e:
        results["steps"].append({"action": "create_version", "error": str(e)})
        results["status"] = "failed"
        return results
    
    # Step 3: Run debug validation
    debug_config = GTMMonitorConfig(
        container_id=config.container_id,
        target_url=config.test_url,
        expected_tags=config.expected_tags,
        expected_events=config.expected_events,
        actions=config.test_actions
    )
    
    debug_results = await run_monitoring_session(debug_config)
    results["debug"] = debug_results
    
    if not debug_results["summary"]["success"]:
        results["status"] = "validation_failed"
        results["recommendations"] = generate_fix_recommendations(debug_results)
        return results
    
    # Step 4: Publish if validation passed
    if config.auto_publish:
        try:
            published = await gtm_mcp.publish_version(
                path=f"{config.container_path}/versions/{version['containerVersionId']}"
            )
            results["steps"].append({
                "action": "publish",
                "status": "success"
            })
        except Exception as e:
            results["steps"].append({"action": "publish", "error": str(e)})
            results["status"] = "publish_failed"
            return results
    
    # Step 5: Verify server-side (if using Stape)
    if config.stape_container_id:
        await asyncio.sleep(30)  # Wait for events to propagate
        
        stape_stats = await stape_mcp.stape_container_statistics(
            container_id=config.stape_container_id,
            period="1h"
        )
        
        results["server_side"] = {
            "requests_received": stape_stats.get("requests_total", 0),
            "verification": "Events flowing" if stape_stats.get("requests_total", 0) > 0 else "No events detected"
        }
    
    results["status"] = "success"
    return results


def generate_fix_recommendations(debug_results):
    """Generate actionable fix recommendations from failed validations."""
    recommendations = []
    
    for capture in debug_results.get("captures", []):
        for failure in capture.get("validations", {}).get("failed", []):
            if "Tag NOT fired" in failure:
                tag_name = failure.replace("Tag NOT fired: ", "")
                recommendations.append({
                    "issue": f"Tag '{tag_name}' did not fire",
                    "checks": [
                        "Verify trigger conditions match the test scenario",
                        "Check if consent mode is blocking the tag",
                        "Verify tag is not paused in GTM",
                        "Check tag sequencing dependencies"
                    ]
                })
            
            elif "Event NOT found" in failure:
                event_name = failure.replace("Event NOT found: ", "")
                recommendations.append({
                    "issue": f"Event '{event_name}' not in dataLayer",
                    "checks": [
                        "Verify dataLayer.push() is being called",
                        "Check event name spelling matches exactly",
                        "Verify the action that triggers this event was executed",
                        "Check for JavaScript errors blocking dataLayer"
                    ]
                })
            
            elif "Consent mismatch" in failure:
                recommendations.append({
                    "issue": failure,
                    "checks": [
                        "Check CMP (Consent Management Platform) configuration",
                        "Verify consent initialization timing",
                        "Check default consent state in GTM"
                    ]
                })
    
    return recommendations
```

## Best Practices

### 1. Always Test Before Publishing
```
Create Version → Debug Validate → Publish (only if passed)
```

### 2. Use Separate Workspaces for Testing
```python
# Create isolated workspace for automated testing
test_workspace = gtm_mcp.create_workspace(
    parent=container_path,
    body={"name": f"Auto-Test-{datetime.now().strftime('%Y%m%d')}"}
)
```

### 3. Clean Up Test Artifacts
```python
# Delete test workspace after validation
gtm_mcp.delete_workspace(path=test_workspace["path"])
```

### 4. Monitor Server-Side Latency
```python
# Check Stape response times
analytics = stape_mcp.stape_container_analytics(container_id)
if analytics["avg_response_time_ms"] > 500:
    print("Warning: High latency detected")
```

### 5. Version Naming Convention
```
v{major}.{minor}.{patch} - {description}
Example: v2.1.0 - Added purchase tracking with CAPI
```
