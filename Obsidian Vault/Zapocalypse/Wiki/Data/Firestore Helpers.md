---
type: entity
entity_kind: utility
domain: data
source_file: src/lib/firestore/helpers.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - utility
  - data
  - firestore
related:
  - "[[Data Model Overview]]"
  - "[[Wiki/Pipeline/Orchestrator]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/firestore-schema]]"
---

# Firestore Helpers

> All typed Firestore read/write operations. The only place to call `doc()`, `setDoc()`, `getDoc()`, etc. Orchestrator and components must go through these helpers.

## Rule

**Never call Firestore SDK directly from orchestrator or component code.** Always use these typed helpers.

## Project Management

```typescript
projectRef(projectId: string): DocumentReference
createProject(projectId: string, sourceType: "url" | "text" | "file"): Promise<void>
updateProjectStatus(projectId: string, status: PipelineStatus, error?: string): Promise<void>
writeProjectMeta(projectId: string, meta: { title?: string, sourcePreview?: string }): Promise<void>
writeSourceContent(projectId: string, title: string, rawContent: string): Promise<void>
writeTotalCost(projectId: string, totalCost: number): Promise<void>
```

## Agent Output Writes

```typescript
writeAnalysis(projectId: string, score: InformationGainScore): Promise<void>
writeSKO(projectId: string, sko: SKO): Promise<void>
writeOutputs(projectId: string, outputs: SynthesisOutputs): Promise<void>

writeToneCheck(
  projectId: string,
  result: ToneCheckResult,
  outputErrors?: Record<string, string>  // strips failed platforms from per_platform before write
): Promise<void>
// → projects/{id}/tone_check/current + savedAt
// Filters out per_platform entries for any platform in outputErrors

writeHookScores(projectId: string, result: HookScoreResult): Promise<void>
writeC2PAManifests(projectId: string, manifests: Record<string, C2PAManifest>): Promise<void>
writeC2PAManifest(projectId: string, platform: string, manifest: C2PAManifest): Promise<void>
// Single-platform variant — used by post-regen cascade
```

## Regeneration Flow

```typescript
readSKO(projectId: string): Promise<SKO | null>

writeToneRefinement(
  projectId: string,
  refinement: Omit<ToneRefinement, "id" | "timestamp">
): Promise<void>
// → projects/{id}/tone_history/{auto-id}

writeRegeneratedOutput(projectId: string, platform: string, output: unknown): Promise<void>
// Transaction: reads project doc to check outputErrors[platform]
//   - If outputErrors[platform] exists: first success after failure
//     → does NOT set isRegenerated:true; clears outputErrors.${platform} via FieldValue.delete()
//   - If outputErrors[platform] absent: genuine refinement
//     → sets isRegenerated:true
//   + increments regenerationCount

updateRegenerationStatus(
  projectId: string, platform: string,
  status: "processing" | "complete" | "error",
  error?: string, refundedAmount?: number,
  intent?: "retry" | "refine"  // written only on "processing" transition
): Promise<void>

updateToneCheckForPlatform(
  projectId: string, platform: string,
  platformResult: { match_score: number; deviations: string[]; suggested_fixes: string[] },
  slopFlags?: AISlopFlag[]
): Promise<void>
// Used by post-regen cascade to update a single platform's tone score.
// Pattern: single read → merge per_platform in memory → set() full doc.
// set() (not update()) so it creates the document if tone_check/current is missing
// (happens when initial auth agent failed entirely).

getRegenerationCount(projectId: string, platform: string): Promise<number>
readAllPlatformOutputs(projectId: string): Promise<Record<string, unknown>>
// Reads all projects/{id}/outputs/{platform} docs — used for hook re-scoring after regen
```

## Refund Helpers

```typescript
interface RefundLogEntry {
  platform: string;
  amount: number;
  reason: "synthesis_failed" | "regen_failed";
  attempt: number;     // 0 = synthesis failure; N = regen attempt (1-based, matches CostBreakdown)
  agentNames: string[];
  createdAt: FieldValue;
}

writeRefundLogEntry(projectId: string, entry: Omit<RefundLogEntry, "createdAt">): Promise<void>
getRefundLogEntryCount(projectId: string, platform: string): Promise<number>
// NOTE: counts ALL refund entries including synthesis_failed — use cost_log count for attempt numbering
markProjectRefunded(projectId: string, amount: number, stage: "full" | "synthesis_only"): Promise<void>
getMonthlyRefundTotal(): Promise<number>
```

## Phase 5 — C2PA Key Persistence

```typescript
readSigningKey(): Promise<{ privateKeyPem, publicKeyPem, thumbprint } | null>
writeSigningKey(keyData: { privateKeyPem, publicKeyPem, thumbprint }): Promise<void>
```

## Firestore update() vs set() Gotcha

- `update({"nested.field": value})` — dot-notation works, targets nested path. Throws `NOT_FOUND` if document doesn't exist.
- `set({nested: {field: value}}, {merge: true})` — does NOT interpret dots as nested paths; `"nested.field"` becomes a literal top-level key.
- **Pattern for upsert**: read → merge in memory → `set()` full result.

## Cross-References

- Data shapes: [[Data Model Overview]]
- Callers: [[Wiki/Pipeline/Orchestrator]], `src/lib/pipeline/regenerate.ts`
- Budget writes: `src/lib/budget/tracker.ts` (writes `budget/current` directly)
