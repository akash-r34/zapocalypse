---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/c2pa-manifest.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Pipeline/Agent - Authenticator]]"
  - "[[Wiki/Concepts/C2PA Signing]]"
  - "[[Wiki/Components/Component - C2PA UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - C2PA Manifest

> Schema for Content Provenance and Authenticity manifests. V3.0 includes cryptographic ECDSA P-256 signing; V2.0 manifests are metadata-only.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/c2pa-manifest.ts

export const C2PAManifestSchema = z.object({
  claim_generator: z.enum(["Zapocalypse/2.0", "Zapocalypse/3.0"]),
  tool_used: z.object({
    name: z.string(),
    version: z.string(),
    model: z.string(),
  }),
  creator_identity: z.object({
    type: z.literal("anonymous_app_user"),
  }),
  content_credentials: z.object({
    creation_timestamp: z.string(),
    content_hash: z.string(),   // SHA-256 of canonical output JSON
    do_not_train: z.literal(true),
    ai_generated: z.literal(true),
  }),
  assertions: z.array(
    z.object({
      label: z.string(),
      data: z.record(z.string(), z.unknown()),
    })
  ),
  // Phase 5 — cryptographic signing fields (optional for backwards compatibility with v2.0)
  signing_status: z.enum(["signed", "metadata_only"]).optional(),
  signature: z.string().nullable().optional(),           // base64url ECDSA P-256 signature
  certificate_thumbprint: z.string().nullable().optional(),
  public_key_pem: z.string().optional(),
  manifest_uri: z.string().optional(),
});

export type C2PAManifest = z.infer<typeof C2PAManifestSchema>;
```

## `SignedC2PAManifest` Type

A narrower type for fully-signed manifests — all signing fields are required and non-null:

```typescript
export type SignedC2PAManifest = C2PAManifest & {
  signing_status: "signed";
  signature: string;           // non-null
  certificate_thumbprint: string;  // non-null
  public_key_pem: string;
};
```

## Backwards Compatibility

V2.0 manifests (missing all signing fields) parse correctly — all Phase 5 signing fields are optional. This was a deliberate design decision to avoid migration complexity.

## `signing_status` Values

| Value | Meaning |
|-------|---------|
| `"signed"` | ECDSA P-256 signature present and valid |
| `"metadata_only"` | Signing failed; manifest contains metadata but no cryptographic proof |

The C2PA signer (`c2pa-signer.ts`) falls back to `metadata_only` on any error — it never throws.

## Content Hash

`content_credentials.content_hash` is a SHA-256 hash of the canonical JSON representation of the platform output data. Deterministic: same output → same hash.

## Firestore Storage

Written to `projects/{id}/c2pa/{platform}` for each platform. One document per platform.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Authenticator]] via `c2pa-signer.ts`
- Full signing concept: [[Wiki/Concepts/C2PA Signing]]
- UI: [[Wiki/Components/Component - C2PA UI]]
- Hooks: [[Wiki/Hooks/Hook - useC2PAManifests]] (covers both `useC2PAManifest` single-platform and `useC2PAManifests` all-platforms — both exported from the same file)
