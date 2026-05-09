---
type: concept
domain: pipeline
source_file: src/lib/pipeline/c2pa-signer.ts, src/lib/pipeline/c2pa-generator.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - concept
  - pipeline
  - v3
  - provenance
related:
  - "[[Wiki/Data/Schema - C2PA Manifest]]"
  - "[[Wiki/Pipeline/Agent - Authenticator]]"
  - "[[Wiki/Components/Component - C2PA UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Docs/V3 Market research.md]]"
---

# C2PA Signing

> V3 Phase 5 added real ECDSA P-256 cryptographic signing to C2PA manifests. Replaces the v2.0 metadata-only approach. Uses Node.js built-in `crypto` — no native deps.

## Why Not `c2pa-node`

The official C2PA library (`c2pa-node`) is a Rust NAPI binding designed for binary media (JPEG, MP4, PNG). It binds signatures to file bytes. Our outputs are JSON text — the binary signing approach doesn't apply. ECDSA P-256 via Node.js `crypto` gives real cryptographic provenance.

## Key Generation

On first pipeline run, `getOrCreateSigningKey()` in `src/lib/pipeline/c2pa-signer.ts`:

1. Checks `system/c2pa_signing_key` in Firestore (via `readSigningKey()`)
2. If absent: generates ECDSA P-256 keypair via `crypto.generateKeyPairSync("ec", { namedCurve: "P-256" })`
3. Exports as PEM strings, writes to `system/c2pa_signing_key` via `writeSigningKey()`
4. Caches in-memory — subsequent pipeline runs skip Firestore read

**Key persists across deployments** (stored in Firestore). Only generated once per project lifetime.

## Signing Process

```typescript
// src/lib/pipeline/c2pa-signer.ts
async function createSignedManifest(
  outputJson: string,
  platform: string
): Promise<SignedC2PAManifest>
```

1. SHA-256 hash of output JSON content → `content_hash`
2. Create manifest object (`C2PAManifestSchema`)
3. Sign manifest JSON with ECDSA private key → base64url signature
4. Compute certificate thumbprint (SHA-256 of public key PEM)
5. Returns `SignedC2PAManifest` with `signing_status: "signed"`

**On any error** (key generation fail, signing fail): falls back to `signing_status: "metadata_only"` — never throws, never blocks pipeline.

## Manifest Schema

```typescript
// SignedC2PAManifest fields added in V3 Phase 5
interface SignedC2PAManifest extends C2PAManifest {
  signing_status: "signed" | "metadata_only";
  signature?: string;            // base64url ECDSA-P256 signature
  certificate_thumbprint?: string; // SHA-256 of public key PEM
  public_key_pem?: string;       // for independent verification
  manifest_uri?: string;         // download URL hint
}
```

## `claim_generator` Versioning

```
"Zapocalypse/3.0"  ← V3 Phase 5 (signed manifests)
"Zapocalypse/2.0"  ← V2 (metadata_only, still parseable)
```

Old 2.0 manifests parse correctly — the extended fields are all optional.

## Firestore Storage

```
projects/{id}/c2pa/{platform}   ← per-platform manifest (all 5 platforms)
system/c2pa_signing_key          ← { privateKeyPem, publicKeyPem, createdAt }
```

## UI Display

- **`C2PABadge`** — per-tab pill in `OutputTabs`. Green "Signed credentials" if signed; gray "Content credentials" if metadata-only. `<details>` panel with hash, timestamp, cert thumbprint, download.
- **`C2PAManifestViewer`** — project-level `<details>` panel on project detail page. Shows "N/M signed" summary, per-platform status, "Download all" button.
- Not shown in native preview mode (preserves authentic platform appearance).

## Cross-References

- Schema: [[Wiki/Data/Schema - C2PA Manifest]]
- Authenticator agent: [[Wiki/Pipeline/Agent - Authenticator]]
- UI components: [[Component - C2PA UI]]
- Hooks: [[Wiki/Hooks/Hook - useC2PAManifests]]
- Rendered by: [[Wiki/Pages/Page - Project Detail]]
