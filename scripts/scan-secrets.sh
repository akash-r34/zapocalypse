#!/usr/bin/env bash
# scan-secrets.sh — block obvious secrets from being committed.
# Runs from a git pre-commit hook against the staged diff only.
# Exit 0 = clean, exit 1 = secret found (blocks commit).
#
# Allowed-but-public patterns (client-side Firebase config) can be listed
# per-file below.

set -euo pipefail

# --- Secret patterns --------------------------------------------------------
# Google API keys (AIzaSy + 35 chars) — Gemini, Cloud, Maps, etc.
# Firebase web API key uses the same format but is public by design; it's
# allow-listed per-file below.
GOOGLE_KEY_RE='AIzaSy[A-Za-z0-9_-]{33}'

# Private keys (service accounts, certs)
PRIVATE_KEY_RE='-----BEGIN [A-Z ]* PRIVATE KEY-----'

# GCP service account JSON fingerprint
GCP_SA_RE='"type":[[:space:]]*"service_account"'

# --- Files allowed to contain AIzaSy keys (public Firebase config only) ----
PUBLIC_FIREBASE_FILES=(
  "apphosting.yaml"
  ".env.example"
  ".env.local"
  "src/lib/firebase/client.ts"
)

is_public_firebase_file() {
  local file="$1"
  for allowed in "${PUBLIC_FIREBASE_FILES[@]}"; do
    [[ "$file" == "$allowed" ]] && return 0
  done
  return 1
}

# --- Scan staged content ---------------------------------------------------
staged_files=$(git diff --cached --name-only --diff-filter=ACM)
[[ -z "$staged_files" ]] && exit 0

violations=0

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  # Skip binary files
  git diff --cached --numstat -- "$file" | awk '{exit ($1=="-")?0:1}' 2>/dev/null && continue

  staged_content=$(git show ":$file" 2>/dev/null || true)
  [[ -z "$staged_content" ]] && continue

  # Private keys — never allowed
  # Use grep -E -- to prevent leading dashes in pattern being parsed as flags
  if echo "$staged_content" | grep -E -- "$PRIVATE_KEY_RE" > /dev/null 2>&1; then
    echo "BLOCKED: private key in $file" >&2
    violations=$((violations+1))
  fi

  # Service account JSON
  if echo "$staged_content" | grep -Eq "$GCP_SA_RE"; then
    echo "BLOCKED: service-account JSON in $file" >&2
    violations=$((violations+1))
  fi

  # Google API keys — block unless this file is on the public-config allow-list
  if echo "$staged_content" | grep -Eq "$GOOGLE_KEY_RE"; then
    if ! is_public_firebase_file "$file"; then
      echo "BLOCKED: Google API key (AIzaSy...) in $file" >&2
      echo "  If this is a NEXT_PUBLIC_FIREBASE_* key, add the file to PUBLIC_FIREBASE_FILES in scripts/scan-secrets.sh." >&2
      violations=$((violations+1))
    fi
  fi
done <<< "$staged_files"

if [[ $violations -gt 0 ]]; then
  echo "" >&2
  echo "Commit blocked — $violations secret(s) detected." >&2
  echo "If a match is a false positive, edit scripts/scan-secrets.sh." >&2
  exit 1
fi

exit 0
