#!/usr/bin/env bash
#
# install.sh — Set up the LibreSpeed Go (speedtest-go) backend for Local Speedtest.
#
# Detects host architecture (amd64/arm64), downloads the official release
# binary from github.com/librespeed/speedtest-go, makes it executable, and
# creates the required directory layout. Intended for Debian Linux.
#
# Usage (run as the target app user, from the project root):
#   ./scripts/install.sh
#
set -euo pipefail

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
REPO="librespeed/speedtest-go"
# Pinned release. Update this value when a newer stable release is available.
RELEASE_VERSION="v1.1.6"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BINARY_NAME="speedtest-backend"
CONFIG_DIR="$APP_DIR/config"
DATA_DIR="$APP_DIR/data"
WEB_DIR="$APP_DIR/web"
BIN_PATH="$APP_DIR/$BINARY_NAME"

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
log()  { printf '[install] %s\n' "$*"; }
err()  { printf '[install] ERROR: %s\n' "$*" >&2; }

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        err "required command not found: $1"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Pre-flight
# -----------------------------------------------------------------------------
require_cmd curl
require_cmd tar

case "$(uname -s)" in
    Linux*)  OS="linux" ;;
    *)       err "unsupported OS: $(uname -s) (only Linux is supported)"; exit 1 ;;
esac

# Detect architecture: amd64 or arm64 (others map to closest official build).
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)   PLATFORM_ARCH="amd64" ;;
    aarch64|arm64)  PLATFORM_ARCH="arm64" ;;
    armv7l)         PLATFORM_ARCH="armv7" ;;
    armv6l)         PLATFORM_ARCH="armv6" ;;
    armv5l)         PLATFORM_ARCH="armv5" ;;
    i386|i686|386)  PLATFORM_ARCH="386" ;;
    *)              err "unsupported architecture: $ARCH (expected amd64/arm64)"; exit 1 ;;
esac

log "OS=$OS  ARCH=$PLATFORM_ARCH  APP_DIR=$APP_DIR"

# -----------------------------------------------------------------------------
# Directory layout
# -----------------------------------------------------------------------------
log "Creating directory layout"
mkdir -p "$CONFIG_DIR" "$DATA_DIR" "$WEB_DIR"

# -----------------------------------------------------------------------------
# Check if binary already exists locally
# -----------------------------------------------------------------------------
if [[ -f "$BIN_PATH" && -s "$BIN_PATH" ]]; then
    log "Binary already present: $BIN_PATH (skipping download)"
    chmod 0755 "$BIN_PATH"
else
    # -----------------------------------------------------------------------------
    # Download official release binary
    # -----------------------------------------------------------------------------
    TARBALL="speedtest-go_${RELEASE_VERSION#v}_${OS}_${PLATFORM_ARCH}.tar.gz"
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$RELEASE_VERSION/$TARBALL"

    WORK_DIR="$(mktemp -d)"
    trap 'rm -rf "$WORK_DIR"' EXIT

    log "Downloading $DOWNLOAD_URL"
    if ! curl -fsSL --max-time 120 -o "$WORK_DIR/$TARBALL" "$DOWNLOAD_URL"; then
        log "Direct release download failed. Trying GitHub API release asset fallback..."
        API_ASSET_URL="https://api.github.com/repos/$REPO/releases/assets/408809764"
        if ! curl -fsSL -H "Accept: application/octet-stream" --max-time 120 -o "$WORK_DIR/$TARBALL" "$API_ASSET_URL"; then
            err "download failed for $DOWNLOAD_URL"
            exit 1
        fi
    fi

    log "Extracting tarball"
    tar -xzf "$WORK_DIR/$TARBALL" -C "$WORK_DIR"

    if [[ ! -f "$WORK_DIR/$BINARY_NAME" ]]; then
        err "expected binary '$BINARY_NAME' not found in tarball"
        exit 1
    fi

    # Install binary and make executable.
    install -m 0755 "$WORK_DIR/$BINARY_NAME" "$BIN_PATH"
    log "Installed binary: $BIN_PATH"
fi

# -----------------------------------------------------------------------------
# Verify config exists (settings.toml should already be present in config/)
# -----------------------------------------------------------------------------
if [[ ! -f "$CONFIG_DIR/settings.toml" ]]; then
    err "config/settings.toml not found — create it before running install.sh"
    exit 1
fi

log "Installation complete."
log "Next: run deploy.sh to install the systemd unit and start the service."
echo
echo "  sudo ./deploy.sh --app-user \$USER --app-dir $APP_DIR"
