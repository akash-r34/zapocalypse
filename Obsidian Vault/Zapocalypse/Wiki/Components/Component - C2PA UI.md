---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Hooks/Hook - useC2PAManifests]]"
  - "[[Wiki/Concepts/C2PA Signing]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - C2PA UI

> Two C2PA display components: per-platform badge (in output tabs) and full provenance panel (on project complete).

## `C2PABadge`

```typescript
// src/components/output/C2PABadge.tsx
interface C2PABadgeProps {
  projectId: string;
  platform: string;
}
```

Hook: `useC2PAManifest(projectId, platform)`. Returns `null` while loading or if no manifest.

**Collapsed view:** pill
- Green "Signed credentials" if `signing_status === "signed"`
- Gray "Content credentials" if `"metadata_only"`

**Expanded view (`<details>`):** creation timestamp, content hash (truncated), model, signing status, cert thumbprint (if signed), DownloadButton → `zapocalypse-content-credential-{platform}.json`

**Not shown** in native preview mode — intentional, to preserve the authentic platform appearance.

## `C2PAManifestViewer`

```typescript
// src/components/output/C2PAManifestViewer.tsx
interface C2PAManifestViewerProps {
  projectId: string;
}
```

Hook: `useC2PAManifests(projectId)`. Returns `null` while loading or if no manifests.

`<details>` with glass styling. Summary: shield icon + "Content provenance" + "N/M signed" count.

Expanded: one row per platform — platform label, "Signed"/"Metadata only" pill, truncated hash, timestamp, individual DownloadButton.

"Download all" button → `zapocalypse-credentials-all.json` (all platforms combined).

Rendered once on project page after `ToneCheckBadge`, gated on `status === "complete"`.

## Cross-References

- Concept: [[Wiki/Concepts/C2PA Signing]]
- Schema: [[Wiki/Data/Schema - C2PA Manifest]]
- Hooks: [[Hook - useC2PAManifests]]
- Rendered by: [[Component - OutputTabs]] (badge), [[Wiki/Pages/Page - Project Detail]] (viewer)
