#!/bin/bash
# Quick Start Script for BLADE LinkedIn Insight Tag Agent
# Launches Claude Code in agent mode with all permissions

set -e

PROJECT_DIR="/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     BLADE LinkedIn Insight Tag - Agent Launcher          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_DIR"

echo -e "${GREEN}Project:${NC} BLADE LinkedIn CAPI"
echo -e "${GREEN}Path:${NC} $PROJECT_DIR"
echo ""

echo -e "${YELLOW}Starting Claude Code with agent mode...${NC}"
echo ""
echo "Once Claude Code starts, say one of these trigger phrases:"
echo ""
echo -e "  ${GREEN}• Deploy LinkedIn tracking${NC}"
echo -e "  ${GREEN}• Install LinkedIn Insight Tag${NC}"
echo -e "  ${GREEN}• Execute BLADE LinkedIn${NC}"
echo ""
echo -e "${YELLOW}The agent will execute all phases automatically.${NC}"
echo ""

# Launch Claude Code
claude --dangerously-skip-permissions
