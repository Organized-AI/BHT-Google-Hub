#!/bin/bash
# Phase Execution Script for BLADE LinkedIn Insight Tag
# Usage: ./scripts/execute-phase.sh [phase_number]

set -e

PROJECT_DIR="/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/BLADE LinkedIn CAPI"
PHASES_DIR="$PROJECT_DIR/PLANNING/implementation-phases"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

phase_number=${1:-0}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  BLADE LinkedIn Insight Tag - Phase Executor               ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check if phase prompt exists
PHASE_PROMPT="$PHASES_DIR/PHASE-$phase_number-PROMPT.md"
if [ ! -f "$PHASE_PROMPT" ]; then
    echo -e "${YELLOW}Phase $phase_number prompt not found: $PHASE_PROMPT${NC}"
    exit 1
fi

# Check if previous phase is complete (skip for phase 0)
if [ $phase_number -gt 0 ]; then
    PREV_COMPLETE="$PHASES_DIR/PHASE-$((phase_number-1))-COMPLETE.md"
    if [ ! -f "$PREV_COMPLETE" ]; then
        echo -e "${YELLOW}Warning: Phase $((phase_number-1)) completion not found${NC}"
        echo -e "${YELLOW}Continue anyway? (y/n)${NC}"
        read -r response
        if [ "$response" != "y" ]; then
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}Phase $phase_number: Ready to execute${NC}"
echo ""
echo "Prompt file: PHASE-$phase_number-PROMPT.md"
echo ""
echo -e "${YELLOW}Starting Claude Code...${NC}"
echo ""

cd "$PROJECT_DIR"

# Launch Claude Code with the phase prompt
echo "Run this in Claude Code:"
echo ""
echo -e "${GREEN}Read PLANNING/implementation-phases/PHASE-$phase_number-PROMPT.md and execute all tasks${NC}"
echo ""

# Open Claude Code
claude --dangerously-skip-permissions
