# /validate-sko — Validate SKO Schema Integrity

The SKO is the semantic hub. Changing it breaks all downstream outputs.

1. Read `src/lib/ai/schemas/sko.ts`
2. Verify all 5 required keys exist: `core_thesis`, `audience_persona`, `viral_hooks`, `semantic_chunks`, `brand_tone_fingerprint`
3. Check that `zod-to-json-schema` is used to derive the Gemini `responseSchema` (not a hand-written schema)
4. Verify Agent 2's prompt references the SKO structure
5. Verify Agent 3 receives `sko` as input (not raw content)
6. Print pass/fail for each check
