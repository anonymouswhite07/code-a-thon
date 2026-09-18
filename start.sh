#!/bin/sh
set -e

SERVER_PORT=${PORT:-8080}

echo "================================================="
echo "   CODE-A-THON 2026 UNIFIED BACKEND CONTAINER    "
echo "================================================="

# Start Isolated Code Runner on internal port 5050
echo "[Boot] Starting Code Runner Sandbox on internal port 5050..."
PORT=5050 node /app/runner/server.js &

# Give the runner a moment to bind
sleep 1

# Start Spring Boot Backend on Render's assigned port
echo "[Boot] Starting Spring Boot Backend on external port ${SERVER_PORT}..."
export PORT=${SERVER_PORT}
exec java -XX:+UseG1GC -XX:MaxRAMPercentage=75 -Dserver.port=${SERVER_PORT} -jar /app/app.jar
