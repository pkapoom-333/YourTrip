# /handoff — Token Budget 80% — Generate Handoff

Run when token usage hits 80%. Claude generates this exact output, updates PROGRESS.md, and commits.

```
## HANDOFF — [DATE] [TIME]
## Token used: ~80% | Next session starts fresh

### ✅ Completed this session
- [task 1] → [file path]
- [task 2] → [file path]

### 🔧 Current state
- Working: [what works right now]
- Broken/WIP: [what is half-done]
- Mocked: [what uses mock data]

### 📁 Files changed this session
- src/[path].tsx — [why]
- src/[path].ts — [why]

### ▶️ Start here next session (copy this exactly)
Task: [exact task description]
File: [exact file path]
Context: [1-2 sentences of critical context]

### 🤝 Decisions made (do not revisit)
- [decision 1]: [rationale]

### ⚡ Shortcuts taken (fix later)
- [shortcut]: needs [proper solution]

### 📝 Update PROGRESS.md with above, then git commit
```
