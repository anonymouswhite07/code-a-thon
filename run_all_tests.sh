#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "CODE-A-THON 2026 — MASTER AUTOMATED TEST SUITE EXECUTION"
echo "Gnanamani College of Technology"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Backend Tests
echo -e "\n[1/4] Running Backend Unit, RBAC, Security & Engine Tests (Maven)..."
cd "$SCRIPT_DIR/backend"
mvn test

# 2. Code Runner Tests
echo -e "\n[2/4] Running Code Runner Sandbox & Execution Security Tests..."
cd "$SCRIPT_DIR/code-runner"
node --test test/runner.test.js

# 3. Live API Security Tests
echo -e "\n[3/4] Running Live API Security & RBAC Regression Tests..."
cd "$SCRIPT_DIR"
node --test tests/api_security_regression_test.js

# 4. Concurrency Load Test
echo -e "\n[4/4] Running Concurrency & Performance Load Testing..."
node tests/load/concurrency_runner.js

echo -e "\n=========================================================="
echo "ALL TEST SUITES PASSED SUCCESSFULLY"
echo "=========================================================="
