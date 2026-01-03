#!/bin/bash
# Organized Codebase Applicator - Diagnostic Script
# Usage: ./diagnose.sh

echo ""
echo "================================"
echo "Codebase Structure Diagnosis"
echo "================================"
echo ""

# Check current directory
echo "Current directory: $(pwd)"
echo ""

# 1. Check for duplicate locations
echo "1. DUPLICATE LOCATIONS"
echo "   -------------------"
issues_found=0
for dir in agents commands skills hooks; do
    if [ -d "$dir" ] && [ -d ".claude/$dir" ]; then
        echo "   ⚠️  ISSUE: Both $dir/ and .claude/$dir/ exist"
        issues_found=$((issues_found + 1))
    fi
done
[ $issues_found -eq 0 ] && echo "   ✅ No duplicates found"
echo ""

# 2. Check plugin structure
echo "2. PLUGIN STRUCTURE"
echo "   -----------------"
if [ -d ".claude-plugin" ]; then
    echo "   📦 .claude-plugin/ exists"
    echo "      → OK if distributing as plugin"
    echo "      → Remove if local project only"
else
    echo "   ✅ No plugin structure (using local .claude/)"
fi
echo ""

# 3. Check .claude structure
echo "3. .CLAUDE STRUCTURE"
echo "   ------------------"
if [ -d ".claude" ]; then
    echo "   📁 .claude/ exists"
    for subdir in agents commands hooks skills; do
        if [ -d ".claude/$subdir" ]; then
            count=$(ls -1 ".claude/$subdir" 2>/dev/null | wc -l | tr -d ' ')
            echo "      ├── $subdir/ ($count items)"
        else
            echo "      ├── $subdir/ (missing)"
        fi
    done
    [ -f ".claude/settings.json" ] && echo "      └── settings.json ✅" || echo "      └── settings.json (missing)"
else
    echo "   ⚠️  .claude/ directory missing"
fi
echo ""

# 4. Check standard directories
echo "4. STANDARD DIRECTORIES"
echo "   ----------------------"
for dir in PLANNING CONFIG DOCUMENTATION ARCHITECTURE SPECIFICATIONS AGENT-HANDOFF scripts .archive; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir/"
    else
        echo "   ❌ $dir/ (missing)"
    fi
done
echo ""

# 5. Check for deprecated content
echo "5. DEPRECATED CONTENT"
echo "   --------------------"
deprecated_found=0
for dir in prompts docs experiments; do
    if [ -d "$dir" ]; then
        echo "   ⚠️  $dir/ should be archived or moved"
        deprecated_found=$((deprecated_found + 1))
    fi
done
for pattern in *-old *-backup *-v[0-9]*; do
    if [ -d "$pattern" ] 2>/dev/null; then
        echo "   ⚠️  $pattern should be archived"
        deprecated_found=$((deprecated_found + 1))
    fi
done
[ $deprecated_found -eq 0 ] && echo "   ✅ No deprecated content found"
echo ""

# 6. Check naming conventions
echo "6. NAMING CONVENTIONS"
echo "   --------------------"
naming_issues=0
find .claude -maxdepth 3 -type d -name "* *" 2>/dev/null | while read dir; do
    echo "   ⚠️  '$dir' has spaces (should be kebab-case)"
    naming_issues=$((naming_issues + 1))
done
find .claude -maxdepth 3 -type f -name "* *" 2>/dev/null | while read file; do
    echo "   ⚠️  '$file' has spaces (should be kebab-case)"
    naming_issues=$((naming_issues + 1))
done
[ $naming_issues -eq 0 ] && echo "   ✅ Naming conventions OK"
echo ""

# 7. Check empty directories
echo "7. EMPTY DIRECTORIES"
echo "   -------------------"
empty_dirs=$(find . -type d -empty -not -path "./.git/*" 2>/dev/null | head -10)
if [ -n "$empty_dirs" ]; then
    echo "$empty_dirs" | while read dir; do
        echo "   ⚠️  $dir is empty"
    done
else
    echo "   ✅ No empty directories"
fi
echo ""

# Summary
echo "================================"
echo "SUMMARY"
echo "================================"
echo ""
echo "To fix issues, run:"
echo "  ./scripts/reorganize.sh --dry-run  # Preview changes"
echo "  ./scripts/reorganize.sh            # Apply changes"
echo ""
