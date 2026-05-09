---
type: entity
entity_kind: api-route
domain: pipeline
source_file: app/api/pipeline/
created: 2026-04-11
updated: 2026-04-18
status: current
tags:
  - entity
  - api-route
  - pipeline
related:
  - "[[Wiki/Pipeline/Orchestrator]]"
  - "[[Wiki/Architecture/Fire and Forget Pattern]]"
  - "[[Wiki/Pages/Page - Create]]"
  - "[[Wiki/Infrastructure/Auth & Firestore Security]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# API Routes

> Two Next.js App Router route handlers for the pipeline. Both require a valid Firebase ID token (Bearer auth) and return `202 Accepted` immediately, firing pipeline work async (fire-and-forget).

## `POST /api/pipeline/run`

**File:** `app/api/pipeline/run/route.ts`

### Request Body

```typescript
interface RunRequestBody {
  mode: "url" | "text" | "file";
  value: string;            // URL, raw text, or file content as string
  fileName?: string;        // only for file mode
  fileType?: string;        // MIME type, only for file mode
  fileSize?: number;        // bytes, only for file mode
}
```

### Logic

```typescript
export async function POST(request: Request) {
  // 0. await requireAllowedUser(request)  ← throws ApiAuthError(401/403) if not valid
  // 1. Parse JSON body
  // 2. Validate: mode and value required
  // 3. Input validation (throws InputValidationError on failure → 422):
  //    - URL mode: await validateUrl(value)
  //    - Text mode: validateText(value)
  //    - File mode: validateFile({ size, type, name }) + validateText(value)
  // 4. initFirebaseAdmin() (idempotent)
  // 5. projectId = randomUUID()
  // 6. await createProject(projectId, mode)  ← Firestore doc created
  // 7. void runPipeline({ projectId, mode, value })  ← fire-and-forget
  // 8. return NextResponse.json({ projectId }, { status: 202 })
}
```

### Response

| Status | Body | When |
|--------|------|------|
| `202 Accepted` | `{ projectId: string }` | Success — pipeline fired |
| `400 Bad Request` | `{ error: string }` | Invalid JSON or missing fields |
| `401 Unauthorized` | `{ error: string }` | Missing or invalid Bearer token |
| `403 Forbidden` | `{ error: string }` | Token valid but email not in allowlist |
| `422 Unprocessable Entity` | `{ error: string }` | Input validation failed |

### Validation Rules (from `src/lib/pipeline/input-validator.ts`)

- **URL**: `fetch()` with 10s timeout; reject if `>500KB` or non-`text/html` content-type; YouTube URLs → friendly error
- **Text**: reject if `<100 chars` or `>50,000 chars`
- **File**: reject if `>5MB` or not `text/pdf/docx`; also validates extracted text length

---

## `POST /api/pipeline/regenerate`

**File:** `app/api/pipeline/regenerate/route.ts`

### Request Body

```typescript
interface RegenerateRequestBody {
  projectId: string;
  platform: SupportedPlatform;   // "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social"
  feedback?: string;              // tone refinement feedback (required unless retry: true)
  retry?: boolean;                // true = skip tone refinement, just re-synthesize
}
```

### Logic

```typescript
const MAX_REGENS_PER_PLATFORM = 3;

export async function POST(request: Request) {
  // 0. await requireAllowedUser(request)  ← throws ApiAuthError(401/403) if not valid
  // 1. Parse JSON body
  // 2. Validate: projectId and platform required
  // 3. Validate: feedback required unless retry: true
  // 4. Validate: platform must be one of SUPPORTED_PLATFORMS
  // 5. initFirebaseAdmin()
  // 6. regenCount = await getRegenerationCount(projectId, platform)
  //    - if regenCount >= 3 → 429
  // 7. void runSelectiveRegeneration(projectId, platform, feedback ?? "", !!retry)
  // 8. return NextResponse.json({ status: "processing" }, { status: 202 })
}
```

### Response

| Status | Body | When |
|--------|------|------|
| `202 Accepted` | `{ status: "processing" }` | Regeneration fired |
| `400 Bad Request` | `{ error: string }` | Missing fields or invalid request |
| `401 Unauthorized` | `{ error: string }` | Missing or invalid Bearer token |
| `403 Forbidden` | `{ error: string }` | Token valid but email not in allowlist |
| `429 Too Many Requests` | `{ error: string }` | ≥3 regenerations already for this platform |

### Regeneration Modes

| `retry` | `feedback` | Behavior |
|---------|------------|---------|
| `false` | string | Full cycle: tone refinement (`runRefineToneAgent`) → re-synthesis |
| `true` | ignored | Skip refinement; re-run synthesis with existing SKO + fingerprint |

---

## Fire-and-Forget Pattern

Both routes use `void fn()` (not `await fn()`) to start async work. The client never waits for pipeline completion — it monitors progress via Firestore `onSnapshot` in [[Hook - useProject]]. See [[Wiki/Architecture/Fire and Forget Pattern]] for full details.

## Auth Flow

Both routes require an `Authorization: Bearer <idToken>` header. The client sends this via `authedFetch()` (`src/lib/auth/authedFetch.ts`), which calls `getClientAuth().currentUser.getIdToken()` before each request. The server verifies with `requireAllowedUser()` (`src/lib/auth/requireUser.ts`) using `getAdminAuth().verifyIdToken()` + email allowlist check.

See [[Wiki/Infrastructure/Auth & Firestore Security]] for the full auth architecture.

## Cross-References

- Orchestrator: [[Wiki/Pipeline/Orchestrator]]
- Regenerate logic: [[Wiki/Pipeline/Agent - Refine Tone]]
- Pattern: [[Wiki/Architecture/Fire and Forget Pattern]]
- Auth: [[Wiki/Infrastructure/Auth & Firestore Security]]
- Called by: [[Wiki/Pages/Page - Create]], [[Wiki/Components/Component - FeedbackForm]], [[Wiki/Components/Component - OutputTabs]]
