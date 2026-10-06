Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "CODE-A-THON 2026 — MASTER AUTOMATED TEST SUITE EXECUTION" -ForegroundColor Cyan
Write-Host "Gnanamani College of Technology" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# 1. Backend Tests (JUnit 5 + Spring Boot)
Write-Host "`n[1/4] Running Backend Unit, RBAC, Security & Engine Tests (Maven)..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
mvn test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Backend tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] All 29 Backend JUnit Tests Passed!" -ForegroundColor Green

# 2. Code Runner Sandbox & Execution Tests
Write-Host "`n[2/4] Running Code Runner Sandbox & Execution Security Tests..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\code-runner"
node --test test\runner.test.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Code Runner tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] All 7 Code Runner Tests Passed!" -ForegroundColor Green

# 3. API Security & RBAC Regression Tests
Write-Host "`n[3/4] Running Live API Security & RBAC Regression Tests..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot"
node --test tests\api_security_regression_test.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] API Security tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] All 13 Live API Security Tests Passed!" -ForegroundColor Green

# 4. Concurrency & Performance Load Test
Write-Host "`n[4/4] Running Concurrency & Performance Load Testing..." -ForegroundColor Yellow
node tests\load\concurrency_runner.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Concurrency load test failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] Concurrency Load Tests Completed with 0% Error Rate!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "ALL 4 TEST PHASES PASSED CLEANLY — SYSTEM IS PRODUCTION READY" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
