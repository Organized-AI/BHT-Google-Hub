# Common Issues Reference

## Issue Detection & Resolution

### 1. Duplicate Components

**Detection:**
```bash
# Check for duplicate agents
ls -la .claude/agents/ agents/ 2>/dev/null

# Check for duplicate commands
ls -la .claude/commands/ commands/ 2>/dev/null

# Compare specific files
diff .claude/agents/my-agent.md agents/my-agent.md
```

**Resolution:**
```bash
# If identical, remove root version
rm agents/my-agent.md && rmdir agents

# If different, merge or keep newer
# Then consolidate to .claude/
```

---

### 2. Unnecessary Plugin Structure

**Detection:**
```bash
# Check if .claude-plugin exists
ls -la .claude-plugin/ 2>/dev/null
```

**Resolution:**
```bash
# Remove if not distributing as plugin
rm -rf .claude-plugin/

# Move root components to .claude/
mv agents/*.md .claude/agents/
mv commands/*.md .claude/commands/
mv skills/* .claude/skills/
mv hooks/*.json .claude/hooks/
```

---

### 3. Mixed Skill Locations

**Detection:**
```bash
# Skills at root AND in .claude
ls -la skills/ .claude/skills/ 2>/dev/null
```

**Resolution:**
```bash
# Move all to .claude/skills/
mv skills/* .claude/skills/
rmdir skills
```

---

### 4. Empty Directories

**Detection:**
```bash
# Find empty directories
find . -type d -empty -not -path "./.git/*"
```

**Resolution:**
```bash
# Remove empty directories
find . -type d -empty -not -path "./.git/*" -delete
```

---

### 5. Wrong Naming Convention

**Detection:**
```bash
# Find directories with spaces
find . -type d -name "* *" -not -path "./.git/*"

# Find non-kebab-case
ls -la .claude/skills/ | grep -E "[A-Z ]"
```

**Resolution:**
```bash
# Rename to kebab-case
mv "Repo manager skill" "repo-manager"
mv "My Agent.md" "my-agent.md"
```

---

### 6. Deprecated Content Not Archived

**Detection:**
```bash
# Find common deprecated patterns
ls -la prompts/ docs/ experiments/ 2>/dev/null
ls -d *-old/ *-backup/ *-v[0-9]/ 2>/dev/null
```

**Resolution:**
```bash
# Create archive and move
mkdir -p .archive
mv prompts .archive/prompts-deprecated
mv docs .archive/docs-old
mv *-old .archive/
```

---

### 7. Missing Standard Directories

**Detection:**
```bash
# Check for missing directories
for dir in PLANNING CONFIG DOCUMENTATION ARCHITECTURE SPECIFICATIONS AGENT-HANDOFF scripts .archive; do
  [ ! -d "$dir" ] && echo "Missing: $dir"
done
```

**Resolution:**
```bash
# Create missing directories
mkdir -p PLANNING/implementation-phases
mkdir -p CONFIG DOCUMENTATION ARCHITECTURE SPECIFICATIONS
mkdir -p AGENT-HANDOFF scripts .archive
```

---

### 8. Non-Standard Documentation Location

**Detection:**
```bash
# Check for old doc locations
ls -la docs/ documentation/ 2>/dev/null
```

**Resolution:**
```bash
# Move to standard location
mv docs/* DOCUMENTATION/
mv documentation/* DOCUMENTATION/
rmdir docs documentation
```

---

## Quick Diagnostic Script

```bash
#!/bin/bash
# Run this to diagnose issues

echo "=== Checking for issues ==="

# Duplicates
echo -e "\n1. Duplicate locations:"
for dir in agents commands skills hooks; do
  [ -d "$dir" ] && [ -d ".claude/$dir" ] && echo "  ISSUE: Both $dir/ and .claude/$dir/ exist"
done

# Plugin structure
echo -e "\n2. Plugin structure:"
[ -d ".claude-plugin" ] && echo "  NOTE: .claude-plugin/ exists (OK if distributing)"

# Empty directories
echo -e "\n3. Empty directories:"
find . -type d -empty -not -path "./.git/*" 2>/dev/null | head -5

# Naming issues
echo -e "\n4. Naming issues:"
find . -type d -name "* *" -not -path "./.git/*" 2>/dev/null | head -5

# Missing directories
echo -e "\n5. Missing standard directories:"
for dir in PLANNING CONFIG DOCUMENTATION ARCHITECTURE SPECIFICATIONS AGENT-HANDOFF scripts .archive; do
  [ ! -d "$dir" ] && echo "  Missing: $dir"
done

echo -e "\n=== Diagnosis complete ==="
```
