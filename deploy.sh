#!/usr/bin/env bash
#
# deploy.sh — Production deploy for Local Speedtest (Debian).
#
# Follows the MRTG-CMP deploy pattern:
#   1. Dependency check (curl, tar, systemctl, sudo, id)
#   2. Directory prep
#   3. Run scripts/install.sh to fetch the backend binary
#   4. sed-templating of the systemd unit (@APP_DIR@, @APP_USER@)
#   5. Install unit, daemon-reload, enable, restart
#   6. Health verification (HTTP /getIP and /results/telemetry smoke test)
#
# Usage:
#   sudo ./deploy.sh --app-user <user> --app-dir <dir>
#
# Example:
#   sudo ./deploy.sh --app-user mriazh --app-dir /home/mriazh/Github-PC/Local-Speedtest
#
set -euo pipefail

APP_USER=""
APP_DIR=""

usage() {
    echo "Usage: $0 --app-user <user> --app-dir <dir>"
    echo
    echo "Options:"
    echo "  --app-user <user>  System user that runs the speedtest service"
    echo "  --app-dir <dir>    Installation directory (e.g. ~/Github-PC/Local-Speedtest)"
    exit 1
}

# -----------------------------------------------------------------------------
# Argument parsing
# -----------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --app-user) APP_USER="$2"; shift 2 ;;
        --app-dir)  APP_DIR="$2"; shift 2 ;;
        -h|--help)  usage ;;
        *)          echo "Unknown option: $1" >&2; usage ;;
    esac
done

if [[ -z "$APP_USER" || -z "$APP_DIR" ]]; then
    echo "Both --app-user and --app-dir are required." >&2
    usage
fi

# Resolve to absolute path.
APP_DIR="$(cd "$APP_DIR" 2>/dev/null && pwd)" || {
    echo "ERROR: app-dir does not exist: $APP_DIR" >&2
    exit 1
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log()  { printf '[deploy] %s\n' "$*"; }
err()  { printf '[deploy] ERROR: %s\n' "$*" >&2; }

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        err "required command not found: $1"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# 1. Dependency check
# -----------------------------------------------------------------------------
log "Step 1/6 — Dependency check"
for c in curl tar systemctl sudo id bash; do
    require_cmd "$c"
done

if [[ "$(id -u)" -ne 0 ]]; then
    err "deploy.sh must be run as root (use sudo) so systemd can be installed."
    exit 1
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
    err "user '$APP_USER' does not exist on this system."
    exit 1
fi

log "Dependencies satisfied; running as user '$APP_USER' in '$APP_DIR'"

# -----------------------------------------------------------------------------
# 2. Directory prep
# -----------------------------------------------------------------------------
log "Step 2/6 — Directory prep"
install -d -o "$APP_USER" -g "$APP_USER" -m 0755 "$APP_DIR"
install -d -o "$APP_USER" -g "$APP_USER" -m 0755 "$APP_DIR/config"
install -d -o "$APP_USER" -g "$APP_USER" -m 0755 "$APP_DIR/data"
install -d -o "$APP_USER" -g "$APP_USER" -m 0755 "$APP_DIR/web"

# -----------------------------------------------------------------------------
# 3. Install backend binary (scripts/install.sh)
# -----------------------------------------------------------------------------
log "Step 3/6 — Install LibreSpeed Go backend binary"
# Run install.sh as the app user so the binary is owned by them.
sudo -u "$APP_USER" bash "$SCRIPT_DIR/scripts/install.sh"

# -----------------------------------------------------------------------------
# 4. Systemd unit sed templating (@APP_DIR@, @APP_USER@)
# -----------------------------------------------------------------------------
log "Step 4/6 — Install systemd unit"
UNIT_SRC="$SCRIPT_DIR/systemd/local-speedtest.service"
UNIT_DST="/etc/systemd/system/local-speedtest.service"

sed -e "s#@APP_DIR@#$APP_DIR#g" \
    -e "s#@APP_USER@#$APP_USER#g" \
    "$UNIT_SRC" > "$UNIT_DST"

chmod 0644 "$UNIT_DST"
log "Installed $UNIT_DST"

# -----------------------------------------------------------------------------
# 5. daemon-reload, enable, restart
# -----------------------------------------------------------------------------
log "Step 5/6 — daemon-reload, enable, restart"
systemctl daemon-reload
systemctl enable local-speedtest.service
systemctl restart local-speedtest.service

# -----------------------------------------------------------------------------
# 6. Health verification
# -----------------------------------------------------------------------------
log "Step 6/6 — Health verification"
PORT="$(grep -E '^listen_port' "$APP_DIR/config/settings.toml" | sed -E 's/.*= *//; s/"//g')"
PORT="${PORT:-8989}"
BASE_URL="http://127.0.0.1:$PORT"

# Wait for the service to bind the port.
for i in $(seq 1 30); do
    if curl -fsS --max-time 3 "$BASE_URL/getIP" >/dev/null 2>&1; then
        break
    fi
    if [[ "$i" -eq 30 ]]; then
        err "service did not become healthy on $BASE_URL/getIP"
        systemctl status local-speedtest.service --no-pager || true
        exit 1
    fi
    sleep 1
done

# Smoke test: telemetry endpoint accepts a result record.
RESP="$(curl -fsS --max-time 10 -X POST "$BASE_URL/results/telemetry" \
    -d "dl=100&ul=50&ping=5&jitter=1&log=smoketest&ispinfo={}" 2>/dev/null || true)"
if [[ -z "$RESP" ]]; then
    err "telemetry smoke test failed — no response from $BASE_URL/results/telemetry"
    exit 1
fi
log "Telemetry responded: $RESP"

log "Deployment complete."
echo
echo "Service:   local-speedtest.service"
echo "URL:       http://<debian-ip>:$PORT"
echo "Share link: http://<debian-ip>:$PORT/results/?id=<test-id>"
echo
echo "Check status:  sudo systemctl status local-speedtest.service"
echo "View logs:     sudo journalctl -u local-speedtest.service -f"
