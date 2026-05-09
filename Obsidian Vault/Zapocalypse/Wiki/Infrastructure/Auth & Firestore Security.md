---
type: reference
domain: infrastructure
source_file: src/lib/auth/, firestore.rules, firebase.json
created: 2026-04-18
updated: 2026-04-18
status: current
tags:
  - reference
  - infrastructure
  - auth
  - security
related:
  - "[[Wiki/Infrastructure/Deployment]]"
  - "[[Wiki/Infrastructure/Environment Variables]]"
  - "[[Wiki/Pages/API Routes]]"
  - "[[Wiki/Components/Component - Layout]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/phase_status]]"
---

# Auth & Firestore Security

> Single-user Google Auth (V3.9.1). The app gates all workspace routes behind a Google sign-in restricted to one email address. Firebase Admin SDK (server-side) bypasses Firestore rules — pipeline writes are unaffected.

## Auth Library (`src/lib/auth/`)

### `allowed.ts`

```typescript
// Set NEXT_PUBLIC_ALLOWED_USER_EMAIL in your .env.local / apphosting.yaml
export const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_USER_EMAIL ?? "";
```

Reads from `NEXT_PUBLIC_ALLOWED_USER_EMAIL` at build time (embedded in the client bundle). API routes read from `process.env.ALLOWED_USER_EMAIL` (RUNTIME only, no rebuild needed). Both must be set to the same value.

### `AuthContext.tsx` — `"use client"`

```typescript
type AuthStatus = "loading" | "signed-out" | "signed-in" | "forbidden"

interface AuthContextValue {
  user: User | null;        // firebase/auth User
  status: AuthStatus;
  signIn: () => Promise<void>;   // signInWithPopup + GoogleAuthProvider
  signOut: () => Promise<void>;
}

function AuthProvider({ children }: { children: ReactNode }): JSX.Element
function useAuth(): AuthContextValue   // throws if used outside AuthProvider
```

- Driven entirely by `onAuthStateChanged` — no polling.
- `"forbidden"` fires immediately when `user.email !== ALLOWED_EMAIL`; user is signed out automatically.
- `AuthProvider` is mounted in `app/layout.tsx` (root, inside `ThemeProvider`) — context available everywhere.

### `AuthGate.tsx` — `"use client"` (`src/components/auth/`)

```typescript
function AuthGate({ children }: { children: ReactNode }): JSX.Element
```

Three render states:
- `loading` → centered spinner
- `signed-out` | `forbidden` → full-screen sign-in card (wordmark + Google popup button; "not authorized" copy for `forbidden`)
- `signed-in` → renders `{children}`

Mounted via thin per-route layout files:

| Layout | Route |
|--------|-------|
| `app/dashboard/layout.tsx` | `/dashboard` |
| `app/create/layout.tsx` | `/create` |
| `app/projects/layout.tsx` | `/projects` |
| `app/project/[projectId]/layout.tsx` | `/project/[id]` and nested output route |

The `(marketing)` route group has **no gate** — landing page stays publicly accessible.

### `requireUser.ts` — server-side only

```typescript
class ApiAuthError extends Error {
  readonly status: 401 | 403;
}

async function requireAllowedUser(req: Request): Promise<void>
// Reads "Authorization: Bearer <idToken>" header.
// Verifies via getAdminAuth().verifyIdToken(token).
// Checks decoded.email === process.env.ALLOWED_USER_EMAIL.
// Throws ApiAuthError(401) on missing/invalid token.
// Throws ApiAuthError(403) on wrong email.
```

Called at the top of both pipeline API routes before any other logic.

### `authedFetch.ts` — client-side

```typescript
async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
// Calls getClientAuth().currentUser.getIdToken() on every request (always fresh).
// Adds "Authorization: Bearer <idToken>" header.
// Throws if currentUser is null (user not signed in).
```

Replaces plain `fetch()` in:
- `app/create/page.tsx` → `POST /api/pipeline/run`
- `src/components/output/FeedbackForm.tsx` → `POST /api/pipeline/regenerate`
- `src/components/output/OutputTabs.tsx` → `POST /api/pipeline/regenerate` (fire-and-forget)

---

## Firebase SDK Auth Exports

### `src/lib/firebase/client.ts` (additions)

```typescript
function getClientAuth(): Auth             // singleton, same Firebase app as Firestore
export const googleProvider: GoogleAuthProvider
```

### `src/lib/firebase/admin.ts` (additions)

```typescript
function getAdminAuth(): Auth   // firebase-admin/auth singleton, used by requireAllowedUser
```

---

## Firestore Security Rules

**File:** `firestore.rules`

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner() {
      return request.auth != null
        && request.auth.token.email == "<owner-email>"
        && request.auth.token.email_verified == true;
    }

    // Server-only — never readable by the client (signing keys, etc.)
    match /system/{doc=**} {
      allow read, write: if false;
    }

    match /projects/{projectId}/{document=**} {
      allow read: if isOwner();
      allow write: if false;    // Admin SDK handles all writes
    }

    match /budget/{doc} {
      allow read: if isOwner();
      allow write: if false;
    }

    match /{document=**} {
      allow read, write: if false;  // default deny
    }
  }
}
```

**Key design choices:**
- `email_verified: true` required — prevents spoofed custom-token attacks where an attacker creates a Firebase user with a fabricated email claim.
- All `write` operations denied for the client SDK — the server-side Admin SDK handles all Firestore writes (it bypasses rules entirely).
- `system/**` fully blocked — contains the ECDSA private signing key used for C2PA manifests.
- `projects/**` rule covers all subcollections (`sko`, `outputs`, `tone_check`, `hook_scores`, `c2pa`, `tone_history`, `refund_log`, `cost_log`) via `{document=**}`.

### Deploy

```bash
firebase deploy --only firestore:rules --project your-firebase-project-id
```

`firebase.json` must have:
```json
{
  "firestore": { "rules": "firestore.rules" },
  "apphosting": { ... }
}
```

---

## Environment Variable

| Variable | Scope | Value |
|----------|-------|-------|
| `ALLOWED_USER_EMAIL` | RUNTIME only (no `NEXT_PUBLIC_`) | `<owner-email>` |

Set in `apphosting.yaml` and `.env.local`. Used by `requireAllowedUser()`. The client-side check uses `ALLOWED_EMAIL` from `allowed.ts` (hardcoded at build time).

---

## Sign-In Flow (end-to-end)

1. User navigates to `/dashboard` (or any gated route)
2. `AuthGate` reads `status: "loading"` → shows spinner
3. `onAuthStateChanged` fires: `status → "signed-out"` → `AuthGate` shows sign-in card
4. User clicks "Sign in with Google" → `signInWithPopup(getClientAuth(), googleProvider)`
5. Google popup completes; `onAuthStateChanged` fires with the new `User`
6. Email checked against `ALLOWED_EMAIL` → `status → "signed-in"` → `AuthGate` renders children
7. For API calls: `authedFetch` calls `user.getIdToken()` and adds `Bearer` header
8. Server calls `requireAllowedUser(request)` → `verifyIdToken` + email check → continues

---

## Cross-References

- Route guard components: [[Wiki/Components/Component - Layout]]
- API route auth: [[Wiki/Pages/API Routes]]
- Env var: [[Wiki/Infrastructure/Environment Variables]]
- Deployment: [[Wiki/Infrastructure/Deployment]]
