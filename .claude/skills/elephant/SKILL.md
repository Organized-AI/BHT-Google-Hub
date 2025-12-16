# Elephant - Codebase Recovery Skill

> "An elephant never forgets" - This skill remembers and can restore your entire codebase from memory.

## Purpose

Elephant is an emergency recovery skill that can reconstruct deleted files, directories, and entire codebases from Claude's conversation memory. Use this when catastrophic deletion occurs and you need to recover work that exists only in the current conversation context.

## When to Use This Skill

Invoke this skill when:
- Files or directories were accidentally deleted during the conversation
- A destructive command wiped out important code
- You need to recover work that was shown/created earlier in the conversation
- Git history is unavailable or corrupted
- You want to checkpoint the current state before risky operations

## Trigger Phrases

- "Restore the codebase"
- "Recover deleted files"
- "Elephant, remember this"
- "Elephant, restore everything"
- "I accidentally deleted..."
- "Can you recover..."
- "Bring back the code"

## How It Works

### Memory Sources

Elephant can recover from these memory sources within the conversation:

1. **Read Tool History** - Files that were read during the conversation
2. **Write Tool History** - Files that were created or modified
3. **Edit Tool History** - All edits made to files
4. **Bash Output** - Code shown in terminal output (cat, grep, etc.)
5. **User-Provided Code** - Code snippets shared by the user
6. **Generated Code** - Code I generated but may not have written to disk

### Recovery Modes

#### 1. Full Codebase Restore
Reconstruct the entire project structure from memory.

```
Elephant, restore the entire codebase to: /path/to/recovery/
```

#### 2. Selective File Recovery
Recover specific files or patterns.

```
Elephant, recover all TypeScript files
Elephant, restore src/services/*
Elephant, bring back package.json
```

#### 3. Memory Checkpoint
Create a snapshot before risky operations.

```
Elephant, remember the current state of src/
Elephant, checkpoint before refactoring
```

#### 4. Memory Audit
List everything remembered from the conversation.

```
Elephant, what files do you remember?
Elephant, show me your memory inventory
```

---

## Recovery Procedure

When invoked, follow this exact procedure:

### Step 1: Memory Inventory

First, audit what's remembered from the conversation:

```markdown
## Memory Inventory

### Files Read (Read Tool)
- [list all files read with timestamps if available]

### Files Written (Write Tool)
- [list all files created/overwritten]

### Files Edited (Edit Tool)
- [list all files that received edits]

### Code Shown (Bash/User)
- [list code snippets from terminal or user messages]

### Generated But Not Written
- [list any code I generated but didn't save]
```

### Step 2: Reconstruction Plan

Create a recovery plan:

```markdown
## Recovery Plan

Target Directory: [path]

Files to Restore:
1. [file] - Source: [Read/Write/Edit/Bash/User]
2. [file] - Source: [source]
...

Estimated Completeness: [X]%
Missing/Incomplete Files: [list any gaps]
```

### Step 3: Execute Recovery

For each file:
1. Reconstruct content from memory
2. Verify directory exists (create if needed)
3. Write file with original content
4. Confirm restoration

### Step 4: Verification

After restoration:
1. List restored files with `ls -la`
2. Compare against inventory
3. Report any files that couldn't be fully restored
4. Suggest next steps (git init, npm install, etc.)

---

## Usage Examples

### Example 1: Accidental Deletion Recovery

**User:** "I just ran `rm -rf src/` by accident! Can you restore it?"

**Elephant Response:**
```
Elephant Recovery Activated

Scanning conversation memory for src/ contents...

## Memory Inventory for src/
- src/index.ts (from Write Tool, 2 versions)
- src/lib/config.ts (from Read Tool)
- src/services/campaign.ts (from Edit Tool, 5 edits)
- src/types/index.ts (from Write Tool)

## Recovery Plan
Target: ./src/
Files: 4 files, 3 directories
Completeness: 100%

Proceeding with restoration...

Restored: src/index.ts (127 lines)
Restored: src/lib/config.ts (45 lines)
Restored: src/services/campaign.ts (203 lines)
Restored: src/types/index.ts (89 lines)

Recovery Complete - 4/4 files restored successfully
```

### Example 2: Pre-Operation Checkpoint

**User:** "Elephant, remember src/services/ before I refactor"

**Elephant Response:**
```
Checkpoint Created

Memorizing src/services/:
- campaign.ts (203 lines)
- submission.ts (156 lines)
- payout.ts (178 lines)

Checkpoint saved. Say "Elephant, restore checkpoint" to recover.
```

### Example 3: Memory Audit

**User:** "Elephant, what do you remember?"

**Elephant Response:**
```
Memory Audit

## Complete Files in Memory (can fully restore)
| File | Lines | Source | Last Seen |
|------|-------|--------|-----------|
| src/index.ts | 127 | Write | Recent |
| package.json | 45 | Read | Earlier |
| tsconfig.json | 23 | Read | Earlier |

## Partial Files (fragments only)
| File | Coverage | Source |
|------|----------|--------|
| README.md | ~60% | Edit snippets |

## Directory Structure Known
- src/
- src/lib/
- src/services/
- src/types/

Total: 15 files fully remembered, 3 partial
```

---

## Limitations

### What Elephant CAN Recover
- Any file read with the Read tool
- Any file written with the Write tool
- Files edited with the Edit tool (reconstructed from edits)
- Code displayed in Bash output
- Code shared by user in messages
- Code I generated in responses

### What Elephant CANNOT Recover
- Files never seen in this conversation
- Binary files (images, compiled code)
- Files from previous conversations
- Content that exceeded context limits and was summarized
- Files only mentioned by name but never shown

### Memory Degradation
- Very long conversations may have early content summarized
- Large files may have been truncated when read
- Multiple versions = only most recent fully remembered

---

## Best Practices

### For Users

1. **Invoke Early** - If you realize something was deleted, invoke Elephant immediately before context shifts

2. **Create Checkpoints** - Before risky operations (mass refactoring, migrations), ask Elephant to checkpoint

3. **Verify Inventory** - Run a memory audit before recovery to set expectations

4. **Use Git Too** - Elephant is a safety net, not a replacement for version control

### For Recovery

1. **Restore to New Directory** - Recover to a fresh path first, then compare/merge

2. **Check Completeness** - Review the completeness percentage before assuming full recovery

3. **Re-run Tests** - After restoration, validate with tests/linting

---

## Technical Notes

### Memory Priority (when multiple sources exist)
1. Write Tool output (most authoritative)
2. Edit Tool final state (reconstructed)
3. Read Tool content (may be stale)
4. Bash output (may be truncated)
5. User-provided snippets (may be incomplete)

### File Reconstruction from Edits

When a file was only seen through Edit operations:
1. Start with the first `old_string` as base
2. Apply each edit in sequence
3. Validate logical consistency
4. Flag any gaps in reconstruction

---

## Integration

### Adding to Project

Add to your project's `.claude/settings.json`:
```json
{
  "skills": [
    "/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Skills/elephant"
  ]
}
```

### Or Add Globally

Add to `~/.claude.json`:
```json
{
  "skills": [
    "/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Skills/elephant"
  ]
}
```

---

## Emergency Quick Reference

```
ELEPHANT QUICK COMMANDS

Full restore:     "Elephant, restore everything to /path/"
Selective:        "Elephant, recover [filename or pattern]"
Checkpoint:       "Elephant, remember [path]"
Audit:            "Elephant, what do you remember?"
Verify:           "Elephant, can you recover [file]?"
```

---

*"An elephant never forgets, and neither should your codebase."*
