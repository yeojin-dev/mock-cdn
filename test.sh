#!/bin/bash
set -e
URL="${1:?Usage: $0 <BASE_URL>}"
PASS=0; FAIL=0
check() {
  if eval "$2"; then echo "  ✓ $1"; PASS=$((PASS+1))
  else echo "  ✗ $1"; FAIL=$((FAIL+1)); fi
}
echo "=== Mock CDN E2E Tests ($URL) ==="

echo "[1] Status & Health"
check "running" "curl -sf '$URL/' | grep -q 'running'"
check "health ok" "curl -sf '$URL/health' | grep -q 'ok'"

echo "[2] Image GET"
check "200" "[ \$(curl -so /dev/null -w '%{http_code}' '$URL/images/test-image-1.jpg') = 200 ]"
ETAG=$(curl -sI "$URL/images/test-image-1.jpg" | grep -i '^etag:' | tr -d '\r' | awk '{print $2}')
check "ETag present" "[ -n '$ETAG' ]"

echo "[3] HEAD request"
check "HEAD 200" "[ \$(curl -sI -o /dev/null -w '%{http_code}' '$URL/images/test-image-1.jpg') = 200 ]"

echo "[4] Consistent ETag"
curl -s -X POST "$URL/set-etag-mode" -H 'Content-Type: application/json' -d '{"mode":"consistent"}' >/dev/null
E1=$(curl -sI "$URL/images/test-image-1.jpg" | grep -i '^etag:' | tr -d '\r' | awk '{print $2}')
E2=$(curl -sI "$URL/images/test-image-1.jpg" | grep -i '^etag:' | tr -d '\r' | awk '{print $2}')
check "same ETag" "[ '$E1' = '$E2' ]"

echo "[5] Random ETag"
curl -s -X POST "$URL/set-etag-mode" -H 'Content-Type: application/json' -d '{"mode":"random"}' >/dev/null
R1=$(curl -sI "$URL/images/test-image-1.jpg" | grep -i '^etag:' | tr -d '\r' | awk '{print $2}')
R2=$(curl -sI "$URL/images/test-image-1.jpg" | grep -i '^etag:' | tr -d '\r' | awk '{print $2}')
check "different ETags" "[ '$R1' != '$R2' ]"
curl -s -X POST "$URL/set-etag-mode" -H 'Content-Type: application/json' -d '{"mode":"consistent"}' >/dev/null

echo "[6] Stats"
curl -s -X POST "$URL/reset-stats" >/dev/null
curl -s "$URL/images/test-image-1.jpg" >/dev/null
check "tracks gets" "curl -s '$URL/stats' | grep -q 'totalGets'"

echo "[7] 404"
check "not found" "[ \$(curl -so /dev/null -w '%{http_code}' '$URL/images/nope.jpg') = 404 ]"

echo "=== $((PASS+FAIL)) tests: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ]
