# /morning — Start Daily Session

Run this at the start of every work session.

```
## START SESSION — $ARGUMENTS

### Load context
Read PROGRESS.md and tell me:
1. What was completed last session?
2. What is the NEXT task to start right now?
3. Are there any blockers or open questions?

### Today's goal
Complete the next task in DAILYWORK.md priority queue.

### Rules for this session
- Write real working TypeScript, not pseudocode
- Mobile-first Tailwind only — no custom CSS
- Server Components by default — "use client" only when interactivity needed
- Mock data if backend not ready
- Commit when each sub-task is done (format: "Day N: feat/fix/chore: description")
- When token usage hits 80% → run /handoff immediately
- Do NOT start a new feature if < 20% tokens left

### Start immediately
Read CLAUDE.md → Read PROGRESS.md → begin first task without asking.
```
