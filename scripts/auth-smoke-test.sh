#!/usr/bin/env bash
# VidyGuideAI Auth Smoke Test
# Tests the complete authentication flow against a running API instance
# Usage: ./scripts/auth-smoke-test.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:8000

set -euo pipefail

BASE_URL="${1:-http://localhost:8000}"
TEST_EMAIL="smoketest-$(date +%s)@example.com"
TEST_USERNAME="smoketest_$(date +%s)"
TEST_PASSWORD="Test@123456"
TEST_FULLNAME="Smoke Test User"

PASS=0
FAIL=0

total() { PASS=$((PASS + 1)); echo "  PASS"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL: $1"; }

echo "=========================================="
echo " VidyGuideAI Auth Smoke Test"
echo " Base URL: $BASE_URL"
echo " Test Email: $TEST_EMAIL"
echo " Test User: $TEST_USERNAME"
echo "=========================================="
echo ""

# Step 1: Health check
echo "[1/7] Health check..."
HEALTH=$(curl -sf "$BASE_URL/health" 2>/dev/null || true)
if echo "$HEALTH" | grep -q '"healthy"'; then total; else fail "API not healthy. Got: $HEALTH"; fi

# Step 2: Register
echo "[2/7] Register new user..."
REG=$(curl -s -w '%{http_code}' -o /tmp/reg.json -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"fullName\":\"$TEST_FULLNAME\"}")
if [ "$REG" = "201" ] && cat /tmp/reg.json | grep -q '"message"'; then total; else fail "Register failed. HTTP $REG: $(cat /tmp/reg.json 2>/dev/null)"; fi

USER_ID=$(cat /tmp/reg.json | grep -o '"userId":[0-9]*' | cut -d: -f2 || echo "")
DEV_OTP=$(cat /tmp/reg.json | grep -o '"devOtp":"[0-9]*"' | cut -d'"' -f4 || echo "")

if [ -z "$DEV_OTP" ]; then
  echo "  WARN: No devOtp returned. Set NODE_ENV!=production to expose OTP in response."
  echo "  SKIPPING OTP verification steps (requires non-production mode)."
  echo ""
  echo "[3/7] OTP verification - SKIPPED"
  echo "[4/7] Login - SKIPPED"
  echo "[5/7] Refresh - SKIPPED"
  echo "[6/7] Protected endpoint - SKIPPED"
  echo "[7/7] Logout - SKIPPED"
  echo ""
  echo "=========================================="
  echo " Tests: $((PASS + FAIL)) | PASS: $PASS | FAIL: $FAIL"
  echo "=========================================="
  echo ""
  echo "NOTE: Re-run with NODE_ENV=development to test OTP/verify flow."
  echo "Set: export NODE_ENV=development && npx nest start"
  exit 0
fi

echo "  devOtp=$DEV_OTP"

# Step 3: Verify OTP
echo "[3/7] Verify OTP..."
VERIFY=$(curl -s -w '%{http_code}' -o /tmp/verify.json -X POST "$BASE_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"$DEV_OTP\",\"purpose\":\"register\"}")
if [ "$VERIFY" = "201" ] && cat /tmp/verify.json | grep -q '"accessToken"'; then total; else fail "OTP verify failed. HTTP $VERIFY: $(cat /tmp/verify.json 2>/dev/null)"; fi

ACCESS_TOKEN=$(cat /tmp/verify.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || echo "")

# Step 4: Login
echo "[4/7] Login..."
LOGIN=$(curl -s -w '%{http_code}' -c /tmp/cookies.txt -o /tmp/login.json -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
if [ "$LOGIN" = "201" ] && cat /tmp/login.json | grep -q '"accessToken"'; then total; else fail "Login failed. HTTP $LOGIN: $(cat /tmp/login.json 2>/dev/null)"; fi

REFRESH_TOKEN=$(grep 'refreshToken' /tmp/cookies.txt | awk '{print $NF}' || echo "")

# Step 5: Refresh
echo "[5/7] Refresh token..."
REFRESH=$(curl -s -w '%{http_code}' -b /tmp/cookies.txt -c /tmp/cookies2.txt -o /tmp/refresh.json -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json")
if [ "$REFRESH" = "201" ] && cat /tmp/refresh.json | grep -q '"accessToken"'; then total; else fail "Refresh failed. HTTP $REFRESH: $(cat /tmp/refresh.json 2>/dev/null)"; fi

NEW_ACCESS=$(cat /tmp/refresh.json | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || echo "")

# Step 6: Protected endpoint (GET /auth/me)
echo "[6/7] Protected endpoint..."
ME=$(curl -s -w '%{http_code}' -b /tmp/cookies2.txt -o /tmp/me.json "$BASE_URL/auth/me")
if [ "$ME" = "200" ] && cat /tmp/me.json | grep -q '"authenticated"'; then total; else fail "GET /auth/me failed. HTTP $ME: $(cat /tmp/me.json 2>/dev/null)"; fi

# Step 7: Logout
echo "[7/7] Logout..."
LOGOUT=$(curl -s -w '%{http_code}' -b /tmp/cookies2.txt -o /tmp/logout.json -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json")
if [ "$LOGOUT" = "201" ] && cat /tmp/logout.json | grep -q '"Logged out'; then total; else fail "Logout failed. HTTP $LOGOUT: $(cat /tmp/logout.json 2>/dev/null)"; fi

# Verify session invalidated
REFRESH_AFTER_LOGOUT=$(curl -s -w '%{http_code}' -b /tmp/cookies2.txt -o /tmp/refresh2.json -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json")
if [ "$REFRESH_AFTER_LOGOUT" != "201" ] || cat /tmp/refresh2.json | grep -q '"authenticated":false'; then
  total
else
  fail "Session not invalidated after logout. HTTP $REFRESH_AFTER_LOGOUT: $(cat /tmp/refresh2.json)"
fi

# Cleanup
rm -f /tmp/reg.json /tmp/verify.json /tmp/login.json /tmp/cookies.txt /tmp/cookies2.txt /tmp/refresh.json /tmp/me.json /tmp/logout.json /tmp/refresh2.json

echo ""
echo "=========================================="
echo " Tests: $((PASS + FAIL)) | PASS: $PASS | FAIL: $FAIL"
echo "=========================================="
if [ "$FAIL" -eq 0 ]; then
  echo " RESULT: ALL PASSED"
  exit 0
else
  echo " RESULT: $FAIL test(s) FAILED"
  exit 1
fi
