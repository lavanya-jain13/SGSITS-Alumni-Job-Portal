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

# Pull latest code
cd "$APP_DIR"
log "Pulling latest code from $BRANCH..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
log "Git pull complete."

# Backend: install dependencies
log "Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci --production
log "Backend dependencies installed."

# Frontend: install dependencies and build
log "Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm ci
log "Building frontend..."
npm run build
log "Frontend build complete."

# Restart backend with PM2
log "Restarting backend..."
pm2 restart alumni-backend --update-env
log "Backend restarted."

log "========== DEPLOYMENT COMPLETE =========="
