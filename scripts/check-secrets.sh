#!/usr/bin/env bash
# =============================================================================
# secrets-scan.sh — fails CI if any of these patterns appear in src/:
#   - Hardcoded passwords / API keys / tokens
#   - Supabase service-role keys (must NEVER be VITE_*)
#   - Stripe secret keys (must NEVER be VITE_*)
#   - OpenAI / SendGrid / Twilio / AWS / Mongo / Postgres / Firebase keys
#   - JWT signing secrets
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Files we DO want to allow to mention these patterns (e.g. .env.example).
ALLOWLIST=(
  ".env.example"
  "SECURITY.md"
  "SUPABASE_SETUP.md"
  "scripts/secrets-scan.sh"
  "package-lock.json"
)

is_allowlisted() {
  local f="$1"
  for a in "${ALLOWLIST[@]}"; do
    [[ "$f" == *"$a" ]] && return 0
  done
  return 1
}

# Patterns.  Each must NOT appear (with the exception of allowlisted files).
# Use word boundaries where helpful.
PATTERNS=(
  # Generic API key shapes
  'sk_live_[A-Za-z0-9]{8,}'                # Stripe live secret
  'sk_test_[A-Za-z0-9]{8,}'                # Stripe test secret
  'pk_live_[A-Za-z0-9]{8,}'                # Stripe live publishable (suspicious in non-VITE_ context)
  'AKIA[0-9A-Z]{16}'                       # AWS access key
  'SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'   # SendGrid
  'sk-[A-Za-z0-9]{20,}'                    # OpenAI project key
  'AIza[0-9A-Za-z_-]{35}'                  # Google API key
  'xox[baprs]-[0-9A-Za-z-]{10,}'           # Slack token
  # Connection strings
  'postgres://[^"'\''[:space:]]+:[^"'\''[:space:]]+@'   # postgres://user:pass@host
  'mongodb(\+srv)?://[^"'\''[:space:]]+:[^"'\''[:space:]]+@'  # mongo uri with creds
  'mysql://[^"'\''[:space:]]+:[^"'\''[:space:]]+@'
  # Supabase service-role key (starts with eyJ but is NOT a public anon key)
  # Heuristic: any 'service_role' literal in code
  'service_role'
  # JWT signing-secret-looking assignment
  'JWT_SECRET[[:space:]]*=[[:space:]]*["'\''][^"'\'' ]{8,}'
)

violations=0
echo "[secrets-scan] scanning src/ and supabase/ ..."
for pattern in "${PATTERNS[@]}"; do
  while IFS=: read -r file line _; do
    if is_allowlisted "$file"; then
      continue
    fi
    echo "  ✗ $file:$line  pattern: $pattern"
    violations=$((violations + 1))
  done < <(grep -RInE "$pattern" src/ supabase/ 2>/dev/null || true)
done

if [[ $violations -gt 0 ]]; then
  echo "[secrets-scan] FAIL: $violations potential secret(s) found."
  exit 1
fi

echo "[secrets-scan] OK — no hardcoded secrets detected."
