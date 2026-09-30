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
echo "WRITE checks (filtered to a non-existent id, changes nothing):"
NONE="00000000-0000-0000-0000-000000000000"
for t in cv_user_data subscriptions generated_cv; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 -X PATCH \
    "$URL/rest/v1/$t?id=eq.$NONE" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '{}')
  # 2xx means the write was permitted; 401/403/404 means RLS refused it.
  if [ "${code:0:1}" = "2" ]; then
    printf '  UPDATE %-38s EXPOSED  HTTP %s\n' "$t" "$code"
    fail=1
  else
    printf '  UPDATE %-38s OK       HTTP %s\n' "$t" "$code"
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
