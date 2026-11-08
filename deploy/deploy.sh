#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/mobility-pulse"
BRANCH="develop"
COMPOSE_FILE="compose.production.yml"

cd "$APP_DIR"
test -f .env || { echo "Missing $APP_DIR/.env" >&2; exit 1; }
test -f data/mobility-pulse.db || { echo "Missing persistent SQLite database" >&2; exit 1; }

git fetch --prune origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

docker compose -f "$COMPOSE_FILE" build
docker compose -f "$COMPOSE_FILE" run --rm --no-deps app npx prisma db push
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

for attempt in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T app \
    node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    docker compose -f "$COMPOSE_FILE" ps
    echo "Mobility Pulse deployment healthy on port 3050"
    exit 0
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" ps
docker compose -f "$COMPOSE_FILE" logs --tail=100 app
echo "Mobility Pulse health check failed" >&2
exit 1

