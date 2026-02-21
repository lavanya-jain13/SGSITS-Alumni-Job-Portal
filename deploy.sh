#!/bin/bash
set -e

APP_DIR="/var/www/html/alumni-portal"
LOG_FILE="$APP_DIR/logs/deploy.log"
BRANCH="main"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

mkdir -p "$APP_DIR/logs"

log "========== DEPLOYMENT STARTED =========="

# Capture current commit before pulling
cd "$APP_DIR"
OLD_COMMIT=$(git rev-parse HEAD)

# Pull latest code
log "Pulling latest code from $BRANCH..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
NEW_COMMIT=$(git rev-parse HEAD)
log "Git pull complete. $OLD_COMMIT -> $NEW_COMMIT"

# Detect what changed
CHANGED_FILES=$(git diff --name-only "$OLD_COMMIT" "$NEW_COMMIT")
log "Changed files:"
echo "$CHANGED_FILES" | tee -a "$LOG_FILE"

BACKEND_CHANGED=false
FRONTEND_CHANGED=false
BACKEND_DEPS_CHANGED=false
FRONTEND_DEPS_CHANGED=false

if echo "$CHANGED_FILES" | grep -q "^backend/"; then
  BACKEND_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -q "^frontend/"; then
  FRONTEND_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -q "^backend/package"; then
  BACKEND_DEPS_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -q "^frontend/package"; then
  FRONTEND_DEPS_CHANGED=true
fi

# Backend: install deps only if package.json/lock changed
if [ "$BACKEND_DEPS_CHANGED" = true ]; then
  log "Installing backend dependencies..."
  cd "$APP_DIR/backend"
  npm ci --production
  log "Backend dependencies installed."
else
  log "Skipping backend npm ci (no dependency changes)"
fi

# Frontend: install deps + build only if frontend files changed
if [ "$FRONTEND_CHANGED" = true ]; then
  cd "$APP_DIR/frontend"
  if [ "$FRONTEND_DEPS_CHANGED" = true ]; then
    log "Installing frontend dependencies..."
    npm ci
    log "Frontend dependencies installed."
  else
    log "Skipping frontend npm ci (no dependency changes)"
  fi
  log "Building frontend..."
  npm run build
  log "Frontend build complete."
else
  log "Skipping frontend build (no frontend changes)"
fi

# Restart backend only if backend files changed
if [ "$BACKEND_CHANGED" = true ]; then
  log "Restarting backend..."
  pm2 restart alumni-backend --update-env
  log "Backend restarted."
else
  log "Skipping backend restart (no backend changes)"
fi

log "========== DEPLOYMENT COMPLETE =========="
