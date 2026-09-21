#!/usr/bin/env bash
# Fail closed: public Library hub/search must not ship localhost CTAs.
set -euo pipefail
ROOT="${AIOS_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
fail=0
files=(
  "$ROOT/ops/status/public_pages/library.html"
  "$ROOT/ops/status/public_pages/library-search.html"
  /workspace/aios-heartbeat/library.html
  /workspace/aios-heartbeat/library-search.html
)
seen=
for f in "${files[@]}"; do
  [[ -f "$f" ]] || continue
  rp=$(realpath "$f" 2>/dev/null || echo "$f")
  case " $seen " in *" $rp "*) continue ;; esac
  seen="$seen $rp"
  if grep -qE '127\.0\.0\.1|localhost:[0-9]' "$f"; then
    echo "FAIL: localhost CTA in $f" >&2
    fail=1
  fi
done
for f in   "$ROOT/ops/status/public_pages/library.html"   /workspace/aios-heartbeat/library.html
do
  [[ -f "$f" ]] || continue
  if ! grep -q 'library-search.html' "$f"; then
    echo "FAIL: missing library-search.html link in $f" >&2
    fail=1
  fi
  if ! grep -q 'Search Library' "$f"; then
    echo "FAIL: missing Search Library CTA in $f" >&2
    fail=1
  fi
done
for f in   "$ROOT/ops/status/public_pages/library-search.html"   /workspace/aios-heartbeat/library-search.html
do
  [[ -f "$f" ]] || continue
  if ! grep -q 'Read transcript' "$f"; then
    echo "FAIL: missing Read transcript in $f" >&2
    fail=1
  fi
  if ! grep -q 'openTx' "$f"; then
    echo "FAIL: missing openTx handler in $f" >&2
    fail=1
  fi
  if ! grep -q 'data-id' "$f"; then
    echo "FAIL: missing id-based detail binding in $f" >&2
    fail=1
  fi
done
if [[ "$fail" -ne 0 ]]; then exit 1; fi
echo "OK: library public CTA gate"
