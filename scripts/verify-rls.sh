#!/usr/bin/env bash
# Verifies that the public anon key can no longer read or write application
# tables. Run after enabling RLS (supabase/migrations/20260930_enable_rls.sql).
#
#   ./scripts/verify-rls.sh
#
# Expected once RLS is on: every check reports OK.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

if [ ! -f .env.local ]; then
  echo "no .env.local found"
  exit 1
fi

URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2- | tr -d '"'\''\r')
KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2- | tr -d '"'\''\r')

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi

echo "target: ${URL#https://}"
echo

TABLES="cv_user_data education experience languages job_offers generated_cv \
generated_personal_data generated_education generated_experience \
generated_language generated_skills generated_prompt_plan \
generated_experience_rewrite_instruction subscriptions"

fail=0

echo "READ checks (anon key must not see rows):"
for t in $TABLES; do
  body=$(curl -s --max-time 20 "$URL/rest/v1/$t?select=*&limit=1" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
  result=$(printf '%s' "$body" | python3 -c "
import json,sys
raw = sys.stdin.read()
try:
    d = json.loads(raw)
except Exception:
    print('UNREADABLE|' + raw[:50]); raise SystemExit
if isinstance(d, list):
    print(('EXPOSED|%d row(s) returned' % len(d)) if d else 'OK|no rows')
else:
    print('OK|' + str(d.get('message', ''))[:45])
")
  status=${result%%|*}
  detail=${result#*|}
  [ "$status" = "EXPOSED" ] && fail=1
  printf '  %-45s %-8s %s\n' "$t" "$status" "$detail"
done

echo
echo "WRITE checks (INSERT of an empty row - rejected either way, nothing is stored):"
# UPDATE is not a usable probe: filtered to a non-existent id it matches zero
# rows, so PostgREST answers 204 whether RLS is on or off. INSERT is always
# evaluated against the policies, so it distinguishes the two.
for t in subscriptions cv_user_data job_offers generated_cv; do
  out=$(curl -s --max-time 20 -X POST "$URL/rest/v1/$t" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" \
    -w "\n%{http_code}" -d '{}')
  code=$(printf '%s' "$out" | tail -1)
  body=$(printf '%s' "$out" | head -1)
  if printf '%s' "$body" | grep -q "row-level security"; then
    printf '  INSERT %-38s OK       HTTP %s (blocked by RLS)\n' "$t" "$code"
  elif [ "$code" = "401" ] || [ "$code" = "403" ]; then
    printf '  INSERT %-38s OK       HTTP %s\n' "$t" "$code"
  else
    printf '  INSERT %-38s EXPOSED  HTTP %s\n' "$t" "$code"
    fail=1
  fi
done

echo
if [ "$fail" -eq 0 ]; then
  echo "PASS - the anon key can no longer read or write these tables."
else
  echo "FAIL - the database is still reachable with the public key."
  echo "Apply supabase/migrations/20260930_enable_rls.sql, but only after"
  echo "SUPABASE_SERVICE_ROLE_KEY is set in Vercel and the app redeployed."
fi
exit "$fail"
