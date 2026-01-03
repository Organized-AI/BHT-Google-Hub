#!/bin/bash
# Organized Codebase Applicator - Reorganization Script
# Usage: ./reorganize.sh [OPTIONS]
#
# Options:
#   --dry-run       Preview changes without applying
#   --keep-plugin   Preserve .claude-plugin/ directory
#   --no-archive    Skip archiving deprecated content
#   --yes           Skip confirmation prompts

set -e

# Parse arguments
DRY_RUN=false
KEEP_PLUGIN=false
NO_ARCHIVE=false
AUTO_YES=false

for arg in "$@"; do
    case $arg in
        --dry-run) DRY_RUN=true ;;
        --keep-plugin) KEEP_PLUGIN=true ;;
        --no-archive) NO_ARCHIVE=true ;;
        --yes|-y) AUTO_YES=true ;;
    esac
done

run_cmd() {
    if [ "$DRY_RUN" == true ]; then
        echo "  [DRY RUN] $1"
    else
        eval "$1"
    fi
}

confirm() {
    if [ "$AUTO_YES" == true ] || [ "$DRY_RUN" == true ]; then
        return 0
    fi
    read -p "$1 [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

echo ""
echo "============================================"
echo "  Organized Codebase Applicator"
echo "============================================"
echo ""
echo "Options:"
echo "  Dry Run:      $DRY_RUN"
echo "  Keep Plugin:  $KEEP_PLUGIN"
echo "  No Archive:   $NO_ARCHIVE"
echo "  Auto Yes:     $AUTO_YES"
echo ""

if [ "$DRY_RUN" == true ]; then
    echo ">>> DRY RUN MODE - No changes will be made <<<"
    echo ""
fi

# Phase 1: Create .claude structure
echo "Phase 1: Creating .claude structure..."
run_cmd "mkdir -p .claude/{agents,commands,hooks,skills}"
echo "  ✓ Created .claude/ subdirectories"

# Phase 2: Create documentation directories
echo ""
echo "Phase 2: Creating documentation directories..."
run_cmd "mkdir -p PLANNING/implementation-phases"
run_cmd "mkdir -p ARCHITECTURE DOCUMENTATION SPECIFICATIONS"
run_cmd "mkdir -p AGENT-HANDOFF CONFIG scripts .archive"
echo "  ✓ Created standard directories"

# Phase 3: Move root Claude components to .claude/
echo ""
echo "Phase 3: Consolidating Claude components to .claude/..."

moved_count=0

# Handle agents, commands (*.md files)
for dir in agents commands; do
    if [ -d "$dir" ]; then
        echo "  Found $dir/ at root"
        if ls "$dir"/*.md 1>/dev/null 2>&1; then
            run_cmd "mv $dir/*.md .claude/$dir/ 2>/dev/null || true"
            echo "    → Moved *.md files to .claude/$dir/"
            moved_count=$((moved_count + 1))
        fi
        run_cmd "rmdir $dir 2>/dev/null || true"
    fi
done

# Handle hooks (*.json and *.md files)
if [ -d "hooks" ]; then
    echo "  Found hooks/ at root"
    if ls hooks/*.json 1>/dev/null 2>&1; then
        run_cmd "mv hooks/*.json .claude/hooks/ 2>/dev/null || true"
        echo "    → Moved *.json files to .claude/hooks/"
    fi
    if ls hooks/*.md 1>/dev/null 2>&1; then
        run_cmd "mv hooks/*.md .claude/hooks/ 2>/dev/null || true"
        echo "    → Moved *.md files to .claude/hooks/"
    fi
    run_cmd "rmdir hooks 2>/dev/null || true"
    moved_count=$((moved_count + 1))
fi

# Handle skills (directories)
if [ -d "skills" ]; then
    echo "  Found skills/ at root"
    run_cmd "mv skills/* .claude/skills/ 2>/dev/null || true"
    run_cmd "rmdir skills 2>/dev/null || true"
    echo "    → Moved all skills to .claude/skills/"
    moved_count=$((moved_count + 1))
fi

[ $moved_count -eq 0 ] && echo "  ✓ No root components to move"

# Phase 4: Handle plugin structure
echo ""
echo "Phase 4: Checking for plugin structure..."
if [ -d ".claude-plugin" ]; then
    if [ "$KEEP_PLUGIN" == true ]; then
        echo "  📦 Keeping .claude-plugin/ (--keep-plugin specified)"
    else
        if confirm "  Remove .claude-plugin/? (Not needed for local projects)"; then
            run_cmd "rm -rf .claude-plugin"
            echo "  ✓ Removed .claude-plugin/"
        else
            echo "  ⏭️  Skipped .claude-plugin/ removal"
        fi
    fi
else
    echo "  ✓ No plugin structure found"
fi

# Phase 5: Archive deprecated content
echo ""
echo "Phase 5: Archiving deprecated content..."

if [ "$NO_ARCHIVE" == true ]; then
    echo "  ⏭️  Skipping archive (--no-archive specified)"
else
    archived_count=0

    # Archive prompts if exists
    if [ -d "prompts" ]; then
        run_cmd "mv prompts .archive/prompts-deprecated"
        echo "  📦 Archived prompts/ → .archive/prompts-deprecated/"
        archived_count=$((archived_count + 1))
    fi

    # Move docs to DOCUMENTATION (not archive)
    if [ -d "docs" ]; then
        run_cmd "mv docs/* DOCUMENTATION/ 2>/dev/null || true"
        run_cmd "rmdir docs 2>/dev/null || true"
        echo "  📁 Moved docs/* → DOCUMENTATION/"
        archived_count=$((archived_count + 1))
    fi

    # Archive version/backup directories
    for pattern in *-old *-backup; do
        if [ -d "$pattern" ] 2>/dev/null; then
            run_cmd "mv '$pattern' .archive/"
            echo "  📦 Archived $pattern → .archive/"
            archived_count=$((archived_count + 1))
        fi
    done

    # Handle versioned directories more carefully
    for dir in *-v[0-9]*; do
        if [ -d "$dir" ] 2>/dev/null; then
            if confirm "  Archive $dir?"; then
                run_cmd "mv '$dir' .archive/"
                echo "  📦 Archived $dir → .archive/"
                archived_count=$((archived_count + 1))
            fi
        fi
    done

    [ $archived_count -eq 0 ] && echo "  ✓ No deprecated content found"
fi

# Phase 6: Fix naming conventions
echo ""
echo "Phase 6: Checking naming conventions..."
renamed_count=0

if [ -d ".claude/skills" ]; then
    find .claude/skills -maxdepth 1 -type d -name "* *" 2>/dev/null | while read dir; do
        newname=$(echo "$dir" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
        if confirm "  Rename '$dir' to '$newname'?"; then
            run_cmd "mv '$dir' '$newname'"
            echo "  ✓ Renamed to $newname"
            renamed_count=$((renamed_count + 1))
        fi
    done
fi

[ $renamed_count -eq 0 ] && echo "  ✓ Naming conventions OK"

# Phase 7: Clean up empty directories
echo ""
echo "Phase 7: Cleaning up empty directories..."
empty_before=$(find . -type d -empty -not -path "./.git/*" 2>/dev/null | wc -l | tr -d ' ')
run_cmd "find . -type d -empty -not -path './.git/*' -delete 2>/dev/null || true"
echo "  ✓ Cleaned up $empty_before empty directories"

# Summary
echo ""
echo "============================================"
echo "  Reorganization Complete!"
echo "============================================"
echo ""
echo "Final structure:"
echo "  .claude/"
for subdir in agents commands hooks skills; do
    if [ -d ".claude/$subdir" ]; then
        count=$(ls -1 ".claude/$subdir" 2>/dev/null | wc -l | tr -d ' ')
        echo "    ├── $subdir/ ($count items)"
    fi
done
echo ""
echo "Next steps:"
echo "  1. Review the changes"
echo "  2. Update CLAUDE.md with new structure"
echo "  3. Create REORGANIZATION-SUMMARY.md"
echo "  4. Commit: git add -A && git commit -m 'Apply Organized Codebase template'"
echo ""
