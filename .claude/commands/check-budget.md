# /check-budget — Verify Budget Safety

Before any AI-related code change, verify:

1. `src/lib/budget/tracker.ts` exists and is imported by `orchestrator.ts`
2. Every agent call in the orchestrator is preceded by a budget check
3. `budget_exceeded` is handled as a terminal state (no retry)
4. The kill-switch Firestore path matches `budget/current`

Print a checklist with pass/fail for each point based on the current code.
