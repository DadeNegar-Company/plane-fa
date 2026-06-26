#!/usr/bin/env bash
# =============================================================================
# Plane-FA Server Provisioning Script
# Domain: plane.faroos.app
# Run this ONCE on the target server to prepare it for automated deployments.
# Usage: bash setup-server.sh
# =============================================================================
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
DEPLOY_DIR="$HOME/apps/plane-fa/deploy"
DOMAIN="plane.faroos.app"
CERT_EMAIL="info@partodata.com"

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Helper: generate random string ──────────────────────────────────────────
rand_string() {
  local len=${1:-32}
  head -c 256 /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c "$len"
}

# ── Step 1: Install Docker ──────────────────────────────────────────────────
install_docker() {
  if command -v docker &>/dev/null; then
    log "Docker already installed: $(docker --version)"
  else
    warn "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    log "Docker installed: $(docker --version)"
  fi

  # Ensure current user is in docker group
  if ! groups "$USER" | grep -q docker; then
    sudo usermod -aG docker "$USER"
    warn "Added $USER to docker group. You may need to re-login for this to take effect."
  fi

  # Enable and start Docker service
  sudo systemctl enable docker
  sudo systemctl start docker
  log "Docker service enabled and running"

  # Docker daemon defaults: log rotation for ALL containers
  if [ ! -f /etc/docker/daemon.json ]; then
    sudo tee /etc/docker/daemon.json > /dev/null << 'DAEMON_JSON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5",
    "tag": "{{.Name}}"
  }
}
DAEMON_JSON
    sudo systemctl restart docker
    log "Docker daemon.json created — default log rotation enabled"
  else
    log "daemon.json already exists, skipping"
  fi
}

# ── Step 2: Configure Firewall ──────────────────────────────────────────────
configure_firewall() {
  if command -v ufw &>/dev/null; then
    warn "Configuring UFW firewall..."
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw --force enable
    log "Firewall configured (SSH, HTTP, HTTPS)"
  else
    warn "UFW not found — skipping firewall config. Ensure ports 22, 80, 443 are open."
  fi
}

# ── Step 3: Create directory structure ──────────────────────────────────────
create_directories() {
  mkdir -p "$DEPLOY_DIR"
  log "Deploy directory created: $DEPLOY_DIR"
}

# ── Step 4: Copy docker-compose.yml ─────────────────────────────────────────
copy_compose() {
  local SCRIPT_DIR
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  if [[ -f "$SCRIPT_DIR/docker-compose.yml" ]]; then
    cp "$SCRIPT_DIR/docker-compose.yml" "$DEPLOY_DIR/docker-compose.yml"
    log "docker-compose.yml copied to $DEPLOY_DIR"
  elif [[ -f "$DEPLOY_DIR/docker-compose.yml" ]]; then
    log "docker-compose.yml already exists in $DEPLOY_DIR"
  else
    err "docker-compose.yml not found. Please copy it manually to $DEPLOY_DIR"
  fi
}

# ── Step 5: Generate .env file ──────────────────────────────────────────────
generate_env() {
  local ENV_FILE="$DEPLOY_DIR/.env"

  if [[ -f "$ENV_FILE" ]]; then
    warn ".env file already exists at $ENV_FILE — skipping generation."
    warn "Delete it manually and re-run if you want to regenerate."
    return
  fi

  local SECRET_KEY
  SECRET_KEY="$(rand_string 50)"
  local PG_PASSWORD
  PG_PASSWORD="$(rand_string 24)"
  local RMQ_PASSWORD
  RMQ_PASSWORD="$(rand_string 24)"
  local MINIO_ACCESS
  MINIO_ACCESS="$(rand_string 20)"
  local MINIO_SECRET
  MINIO_SECRET="$(rand_string 40)"
  local LIVE_SECRET
  LIVE_SECRET="$(rand_string 32)"

  cat > "$ENV_FILE" <<EOF
# =============================================================================
# Plane-FA Production Environment — ${DOMAIN}
# Generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# =============================================================================

# ── Domain & SSL ─────────────────────────────────────────────────────────────
APP_DOMAIN=${DOMAIN}
WEB_URL=https://${DOMAIN}
CORS_ALLOWED_ORIGINS=https://${DOMAIN}
SITE_ADDRESS=${DOMAIN}
CERT_EMAIL=email ${CERT_EMAIL}
CERT_ACME_CA=https://acme-v02.api.letsencrypt.org/directory
TRUSTED_PROXIES=0.0.0.0/0

# ── Ports ────────────────────────────────────────────────────────────────────
LISTEN_HTTP_PORT=80
LISTEN_HTTPS_PORT=443

# ── Application ──────────────────────────────────────────────────────────────
SECRET_KEY=${SECRET_KEY}
DEBUG=0
GUNICORN_WORKERS=4
API_KEY_RATE_LIMIT=60/minute

# ── Database (PostgreSQL) ────────────────────────────────────────────────────
PGHOST=plane-db
PGDATABASE=plane
POSTGRES_USER=plane
POSTGRES_PASSWORD=${PG_PASSWORD}
POSTGRES_DB=plane
POSTGRES_PORT=5432
DATABASE_URL=postgresql://plane:${PG_PASSWORD}@plane-db/plane

# ── Cache (Valkey/Redis) ────────────────────────────────────────────────────
REDIS_HOST=plane-redis
REDIS_PORT=6379
REDIS_URL=redis://plane-redis:6379/

# ── Message Queue (RabbitMQ) ────────────────────────────────────────────────
RABBITMQ_HOST=plane-mq
RABBITMQ_PORT=5672
RABBITMQ_USER=plane
RABBITMQ_PASSWORD=${RMQ_PASSWORD}
RABBITMQ_VHOST=plane
AMQP_URL=amqp://plane:${RMQ_PASSWORD}@plane-mq:5672/plane

# ── Object Storage (MinIO) ──────────────────────────────────────────────────
USE_MINIO=1
AWS_REGION=
AWS_ACCESS_KEY_ID=${MINIO_ACCESS}
AWS_SECRET_ACCESS_KEY=${MINIO_SECRET}
AWS_S3_ENDPOINT_URL=http://plane-minio:9000
AWS_S3_BUCKET_NAME=uploads
FILE_SIZE_LIMIT=5242880
MINIO_ENDPOINT_SSL=0

# ── Live Collaboration ──────────────────────────────────────────────────────
LIVE_SERVER_SECRET_KEY=${LIVE_SECRET}
API_BASE_URL=http://api:8000
EOF

  chmod 600 "$ENV_FILE"
  log ".env file generated with secure random passwords at $ENV_FILE"
}

# ── Step 6: Pull images and start services ──────────────────────────────────
start_services() {
  cd "$DEPLOY_DIR"

  warn "Pulling Docker images from GHCR (this may take a while)..."
  docker compose pull

  warn "Starting services..."
  docker compose up -d --remove-orphans

  log "Services started. Waiting for health check..."

  # Wait for API to be ready (up to 3 minutes)
  local retries=36
  local i=0
  while [ $i -lt $retries ]; do
    if docker compose exec -T api curl -sf http://localhost:8000/ > /dev/null 2>&1; then
      log "API is healthy!"
      break
    fi
    i=$((i + 1))
    sleep 5
  done

  if [ $i -eq $retries ]; then
    warn "API health check timed out. Check logs with: docker compose logs api"
  fi

  echo ""
  log "All services:"
  docker compose ps
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  echo "==========================================="
  echo "  Plane-FA Server Setup — ${DOMAIN}"
  echo "==========================================="
  echo ""

  install_docker
  configure_firewall
  create_directories
  copy_compose
  generate_env
  start_services

  echo ""
  echo "==========================================="
  log "Setup complete!"
  echo ""
  echo "  Domain:  https://${DOMAIN}"
  echo "  Deploy:  ${DEPLOY_DIR}"
  echo ""
  echo "  Next steps:"
  echo "  1. Ensure DNS A record points ${DOMAIN} → $(curl -sf ifconfig.me || echo '<server-ip>')"
  echo "  2. Add SSH public key for GitHub Actions"
  echo "  3. Update GitHub Secrets (SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY)"
  echo "  4. Push to 'main' branch to trigger auto-deploy"
  echo "==========================================="
}

main "$@"
