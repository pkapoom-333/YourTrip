# /night — Night Review

Run this at the end of every work session before closing.

```
## NIGHT REVIEW — $ARGUMENTS

### What was built today
(Claude: list features/files completed this session)

### Review checklist
Check each item built today:
- [ ] TypeScript errors? (run tsc --noEmit)
- [ ] Mobile responsive?
- [ ] Error states handled?
- [ ] Loading states added?
- [ ] Any "any" types used?
- [ ] Committed to git? (format: "Day N: feat: ...")

### Output required
1. Flag any bad patterns or bugs found
2. Suggest improvements (but don't implement yet)
3. Write tomorrow's task list
4. Update PROGRESS.md with today's session log
5. Are we on track for Phase deadline?
```
