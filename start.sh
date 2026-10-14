#!/bin/sh
set -e

SERVER_PORT=${PORT:-8080}

echo "================================================="
echo "   CODE-A-THON 2026 UNIFIED BACKEND CONTAINER    "
echo "================================================="

# Start Isolated Code Runner on internal port 5050
echo "[Boot] Starting Code Runner Sandbox on internal port 5050..."
RUNNER_PORT=5050 PORT=5050 node /app/runner/server.js &

# Give the runner time to initialize and verify health check
echo "[Boot] Waiting for Code Runner on http://127.0.0.1:5050/health..."
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:5050/health > /dev/null 2>&1 || wget -q -O - http://127.0.0.1:5050/health > /dev/null 2>&1; then
    echo "[Boot] Code Runner is online and healthy!"
    break
  fi
  sleep 1
done

# Start Spring Boot Backend with memory constraints tailored for 512MB RAM free cloud instances
echo "[Boot] Starting Spring Boot Backend on external port ${SERVER_PORT}..."
export PORT=${SERVER_PORT}
exec java -XX:+UseSerialGC -Xms128m -Xmx240m -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Dserver.port=${SERVER_PORT} -jar /app/app.jar
