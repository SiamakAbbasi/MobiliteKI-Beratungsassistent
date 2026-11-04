#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/mobility-pulse"
REPOSITORY="https://github.com/SiamakAbbasi/MobiliteKI-Beratungsassistent.git"

test "$(id -u)" -eq 0 || { echo "Run as root" >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker is not installed" >&2; exit 1; }
docker compose version >/dev/null || { echo "Docker Compose plugin is not installed" >&2; exit 1; }
if ss -ltn | grep -q ':3050 '; then echo "Port 3050 is already occupied" >&2; exit 1; fi

if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch develop "$REPOSITORY" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin develop
git checkout develop
git reset --hard origin/develop
mkdir -p data
touch data/mobility-pulse.db
chmod 600 data/mobility-pulse.db

if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
  echo "Created $APP_DIR/.env; configure credentials before deployment." >&2
fi

echo "Bootstrap prepared $APP_DIR without changing existing containers or reverse proxies."

