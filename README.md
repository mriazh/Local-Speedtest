# Local Speedtest

Self-hosted, lightweight LAN speedtest server for Debian Linux. Built on the
[LibreSpeed Go](https://github.com/librespeed/speedtest-go) backend with
embedded SQLite telemetry and an HTML5 frontend. All test traffic stays inside
your local network — no public internet bandwidth is consumed.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Backend: Go](https://img.shields.io/badge/backend-Go-00ADD8.svg)](https://go.dev/)
[![Storage: SQLite](https://img.shields.io/badge/storage-SQLite-07405E.svg)](https://www.sqlite.org/)
[![Frontend: Cloudflare Speed UI](https://img.shields.io/badge/frontend-Cloudflare%20Speed%20UI-F6821F.svg)](https://speed.cloudflare.com/)

## Architecture

```text
[ Client Device: Phone / Laptop ]
       │  (WLAN / WiFi 5/6)
[ Access Point / Switch ]
       │  (Gigabit Ethernet)
[ Switch Core ]
       │  (1 Gbps / 2.5 Gbps LAN)
[ Debian / Linux Server ]
   ├── Port 8989:  LibreSpeed Go server
   ├── SQLite:     data/telemetry.db  (result logs + unique hashes)
   └── Web:        web/               (HTML5 frontend)
```

Clients reach the server through a private LAN IP (or a local DNS name such as
`speedtest.yourdomain.com` resolving to `192.168.1.100`). No traffic leaves
your network.

## Repository layout

```
config/        settings.toml   — LibreSpeed Go config (port 8989, SQLite, assets)
data/          telemetry.db    — SQLite telemetry (created at runtime)
scripts/       install.sh      — downloads official speedtest-go binary
systemd/       local-speedtest.service  — systemd unit template (@APP_DIR@, @APP_USER@)
web/           index.html, results.html, style.css, app.js — HTML5 frontend
tests/         test_local_speedtest.py — automated endpoint verification
deploy.sh      — production deploy script
LICENSE        — MIT License
README.md      — this file
```

## Technology stack

- **Backend:** LibreSpeed Go (`speedtest-backend`), single static Go binary
- **Storage:** embedded SQLite (`data/telemetry.db`), one row per test
- **Frontend:** pure HTML5/CSS/JS (vanilla, no frameworks), served by the backend
- **Supervision:** systemd (`local-speedtest.service`), restart-on-failure
- **Port:** `8989` (configurable in `config/settings.toml`)

## Key Features

- **Authentic Cloudflare Speed Test UI** — dark/light theme support, inspired by
  `speed.cloudflare.com`, with smooth transitions and responsive layout.
- **Dual-area spline chart** — download (orange) and upload (purple) areas with a
  90th-percentile guide line, rendered entirely in-browser on a HTML5 canvas.
- **5 Network Quality Workloads** — Streaming, Video Calls, Remote Desktop, File
  Transfer, and Cloud & Office, each scored on a 5-star scale with tailored
  readiness criteria.
- **Bilingual support** — English and Bahasa Indonesia, persisted in
  `localStorage`.
- **SQLite persistent telemetry** — every completed test is saved locally with a
  unique ULID-based ID and a shareable certificate link (`/results/?id=<id>`,
  `/results/json?id=<id>`).
- **Zero internet bandwidth usage (100% LAN)** — all test traffic stays inside
  your local network; no public WAN bandwidth is consumed.

## Installation & Deployment Guide

Deploy on a Debian/Linux host inside your LAN.

### Step 1: Clone the repository

```bash
# On the Debian server
mkdir -p ~/Github-PC
cd ~/Github-PC
git clone <this-repo> Local-Speedtest
cd Local-Speedtest
```

### Step 2: Run `deploy.sh`

Run as root (sudo):

```bash
chmod +x deploy.sh
sudo ./deploy.sh --app-user $USER --app-dir ~/Github-PC/Local-Speedtest
```

`deploy.sh` performs:

1. Dependency check (`curl`, `tar`, `systemctl`, `sudo`, `id`)
2. Directory preparation under `@APP_DIR@`
3. Binary install via `scripts/install.sh` (downloads the official
   `librespeed/speedtest-go` release)
4. systemd unit sed-templating (`@APP_DIR@`, `@APP_USER@`)
5. `daemon-reload`, `enable`, `restart`
6. Health verification (`/getIP` + `/results/telemetry` smoke test)

The service binds to `0.0.0.0:8989` and restarts on failure.

### Step 3: DNS Setup

Point a local name at your server so LAN clients can reach it without a custom
port in the URL. Use strictly placeholder values; replace with your own.

**Option A — Cloudflare DNS-Only (recommended for split-horizon LAN access)**

In Cloudflare DNS, add an **A** record:

- Name: `speedtest`
- IPv4 address: `<your-server-ip>` (e.g. `192.168.1.100`, use a DHCP reservation
  or static IP on the Debian host)
- Proxy status: **DNS Only** (grey cloud, off)
- TTL: Auto

This keeps test traffic off Cloudflare's WAN edge (orange cloud would route
every test packet through Cloudflare, throttling results and conflicting with
Cloudflare ToS).

Verify from a LAN device:

```bash
$ host speedtest.yourdomain.com
speedtest.yourdomain.com has address 192.168.1.100
$ curl http://speedtest.yourdomain.com:8989/getIP
```

**Option B — Split DNS / local hosts file**

Add to each LAN client's `hosts` file (or your LAN DNS server):

```
192.168.1.100  speedtest.yourdomain.com
```

Only devices on the same LAN/WLAN (or VPN) can reach the server, since the
target is a private RFC1918 IP.

### Step 4: Optional Apache Reverse Proxy (Port 80/443)

If you want clients to reach the speedtest on standard ports without typing
`:8989`, add an Apache reverse proxy on the Debian host:

```apache
<VirtualHost *:80>
    ServerName speedtest.yourdomain.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8989/
    ProxyPassReverse / http://127.0.0.1:8989/
</VirtualHost>
```

Bind the LibreSpeed backend to `127.0.0.1` only (set `bind_address =
"127.0.0.1"` in `config/settings.toml`) so direct unencrypted port-8989 access
from LAN is blocked and all traffic passes through the Apache HTTPS reverse
proxy on port 443.

Enable the modules and site:

```bash
sudo a2enmod proxy proxy_http
sudo a2ensite speedtest-yourdomain.com.conf
sudo systemctl restart apache2
```

### Step 5: Optional Let's Encrypt SSL via Cloudflare DNS Challenge

Obtain a certificate without opening port 80 to the public internet, using the
Cloudflare DNS challenge (works because the domain uses Cloudflare DNS):

```bash
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/secrets/cloudflare.ini \
  -d speedtest.yourdomain.com
```

Then point the Apache virtual host at port 443 with the issued
`fullchain.pem` / `privkey.pem`, and enable a redirect from port 80 to 443.

`~/secrets/cloudflare.ini` must contain your Cloudflare API token with DNS edit
permissions for `yourdomain.com`. Never commit this file to git.

```ini
dns_cloudflare_api_token = <your-cloudflare-api-token>
```

## Configuration options (`config/settings.toml`)

```toml
# Bind only to localhost so direct unencrypted access via port 8989
# is blocked from LAN. Traffic must pass through the Apache HTTPS reverse proxy.
bind_address = "127.0.0.1"

# Backend listen port.
listen_port = 8989

# Assets directory served by the backend.
# Leave empty ("") to use LibreSpeed's official built-in HTML5 frontend.
assets_path = "web"

# Persistent telemetry in SQLite.
database_type = "sqlite"
database_file = "data/telemetry.db"

# Statistics page access password.
statistics_password = "admin"

# Do not redact client IP addresses (results are local LAN only).
redact_ip_addresses = false
```

Change `statistics_password` before deploying. Result sharing is enabled
implicitly when `database_type != "none"`; each completed test receives a unique
ULID-based ID, viewable at `/results/?id=<id>` (PNG card) and
`/results/json?id=<id>` (JSON metrics).

## Verification test script (`tests/test_local_speedtest.py`)

Run against a running backend (e.g. after `deploy.sh`):

```bash
python3 tests/test_local_speedtest.py                 # http://127.0.0.1:8989
python3 tests/test_local_speedtest.py --host <ip> --port 8989
```

It asserts: frontend served, `/getIP` health, telemetry save returns an id,
`/results/json` renders metrics, and `/results` returns a PNG card.

Example output:

```text
[PASS] GET / serves frontend — status=200 ct=text/html
[PASS] GET /getIP returns client IP — status=200 ...
[PASS] POST /results/telemetry returns id — status=200 body="id <ulid>"
[PASS] GET /results/json?id= returns metrics — status=200 ...
[PASS] GET /results?id= returns PNG card — status=200 ct=image/png

5/5 checks passed
```

## Result sharing

When a test completes, the backend persists it to SQLite under a unique ULID and
returns an `id`. The frontend builds a shareable link:

```
https://speedtest.yourdomain.com/results/?id=<ulid>
```

Opening that link renders the result as a PNG card (download/upload/ping/jitter
+ ISP). The same result is available as JSON:

```
https://speedtest.yourdomain.com/results/json?id=<ulid>
```

The "Share" button on the completed test card copies this link to the clipboard,
so you can paste it into chat or email to share the exact metric card.

## Privacy & Security Note

- **100% offline.** All test traffic stays inside your LAN. Zero internet
  bandwidth is consumed, and no telemetry is sent to third parties.
- Results are stored only in the local SQLite database on your Debian host.
- The service binds to `0.0.0.0:8989` (or `127.0.0.1` when using the reverse
  proxy) and is reachable only from your LAN/WLAN or VPN, since the domain
  resolves to a private RFC1918 IP.
- For hardening beyond the unit file's `ProtectSystem`/`NoNewPrivileges`
  settings, tune `systemd/local-speedtest.service` before deploying.

## License

[MIT](LICENSE)

Copyright (c) 2026 Muhammad Riyadh Azhar