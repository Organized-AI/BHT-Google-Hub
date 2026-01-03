#!/bin/bash
# GTM MCP Query Script
# Usage: ./gtm-query.sh <action> <container_type>

ACTION="${1:-list_tags}"
CONTAINER="${2:-server}"

# Container IDs
WEB_CONTAINER="42412215"
SERVER_CONTAINER="175099610"
ACCOUNT_ID="4702245012"
WEB_WORKSPACE="86"
SERVER_WORKSPACE="3"

if [ "$CONTAINER" = "server" ]; then
    CONTAINER_ID="$SERVER_CONTAINER"
    WORKSPACE_ID="$SERVER_WORKSPACE"
else
    CONTAINER_ID="$WEB_CONTAINER"
    WORKSPACE_ID="$WEB_WORKSPACE"
fi

echo "Querying GTM - Account: $ACCOUNT_ID, Container: $CONTAINER_ID, Workspace: $WORKSPACE_ID"
echo "Action: $ACTION"
echo ""

# Build JSON-RPC request
case "$ACTION" in
    list_tags)
        REQUEST='{"jsonrpc":"2.0","method":"tools/call","params":{"name":"gtm_tag","arguments":{"action":"list","accountId":"'$ACCOUNT_ID'","containerId":"'$CONTAINER_ID'","workspaceId":"'$WORKSPACE_ID'"}},"id":1}'
        ;;
    list_variables)
        REQUEST='{"jsonrpc":"2.0","method":"tools/call","params":{"name":"gtm_variable","arguments":{"action":"list","accountId":"'$ACCOUNT_ID'","containerId":"'$CONTAINER_ID'","workspaceId":"'$WORKSPACE_ID'"}},"id":1}'
        ;;
    list_triggers)
        REQUEST='{"jsonrpc":"2.0","method":"tools/call","params":{"name":"gtm_trigger","arguments":{"action":"list","accountId":"'$ACCOUNT_ID'","containerId":"'$CONTAINER_ID'","workspaceId":"'$WORKSPACE_ID'"}},"id":1}'
        ;;
    *)
        echo "Unknown action: $ACTION"
        exit 1
        ;;
esac

echo "Request: $REQUEST"
echo ""
echo "Running mcp-remote..."

# Run mcp-remote with timeout
timeout 60 npx -y mcp-remote https://gtm-mcp.stape.ai/mcp <<< "$REQUEST"
