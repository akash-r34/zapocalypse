# Rules: Firestore Data Model

## Collection paths (exact — do not deviate)

| Path | Contains |
|------|---------|
| `projects/{id}` | `status, sourceType, createdAt, updatedAt, error?, outputErrors?, regenerationCount?, regenerationState?` — `regenerationState.{platform}.intent?: "retry" \| "refine"` |
| `projects/{id}/analysis/current` | `InformationGainScore` + `savedAt` |
| `projects/{id}/sko/current` | Full SKO object + `savedAt` (subcollection — can exceed 1MB doc limit) |
| `projects/{id}/outputs/{platform}` | Platform output data + `generatedAt`, `isRegenerated?` |
| `projects/{id}/hook_scores/current` | `HookScoreResult` + `savedAt` |
| `projects/{id}/tone_check/current` | `ToneCheckResult` + `savedAt` |
| `projects/{id}/c2pa/{platform}` | `C2PAManifest` + `savedAt` |
| `projects/{id}/tone_history/{auto-id}` | `{ platform, feedback, original_fingerprint, refined_fingerprint, timestamp }` |
| `projects/{id}/refund_log/{auto-id}` | `{ platform, amount, reason: "synthesis_failed"\|"regen_failed", attempt, agentNames[], createdAt }` |
| `budget/current` | `{ spent, limit:100, killSwitch, budgetMonth:"YYYY-MM", updatedAt }` |

Platforms: `twitter | linkedin | newsletter | veo | dark_social`

## Rules
- Always go through typed helpers in `src/lib/firestore/helpers.ts` — never call `doc()`, `setDoc()`, `getDoc()` directly in orchestrator or component code.
- `budget/current` is a singleton document. Always use `setDoc` with `merge: true`. Use `FieldValue.increment()` for `spent` — never read-modify-write.
- `projects/{id}/sko/current` is a subcollection doc (not a field on the project doc). Written once by Agent 3 (extract), never updated. New run = new project doc.
- Timestamps must use `serverTimestamp()` — never `new Date()` or `Date.now()`.

## Typing
- All Firestore document shapes must have a corresponding TypeScript type in `src/types/`.
- Use `WithFieldValue<T>` for write types and `T` for read types.
- Never use `DocumentData` (untyped) — always pass the type parameter.
