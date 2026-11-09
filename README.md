# Local Speedtest

Self-hosted, lightweight LAN speedtest server for Debian Linux. Built on the
[LibreSpeed Go](https://github.com/librespeed/speedtest-go) backend with
embedded SQLite telemetry and an HTML5 frontend. All test traffic stays inside
your local network — no public internet bandwidth is consumed.

```
[ Client: Phone / Laptop ]
       │  (WLAN / WiFi 5/6)
[ Access Point / Switch ]
       │  (Gigabit Ethernet)
[ Switch Core ]
       │  (1 Gbps / 2.5 Gbps LAN)
[ PC Debian Host ]
   ├── Port 8989: LibreSpeed Go server
   ├── SQLite:   data/telemetry.db  (result logs + unique hashes)
   └── Web:      web/               (HTML5 frontend)
```

## Repository layout

```
config/        settings.toml   — LibreSpeed Go config (port 8989, SQLite, assets)
data/          telemetry.db    — SQLite telemetry (created at runtime)
scripts/       install.sh      — downloads official speedtest-go binary
systemd/       local-speedtest.service  — systemd unit template (@APP_DIR@, @APP_USER@)
web/           index.html, results.html, style.css, app.js — HTML5 frontend
tests/         test_local_speedtest.py — automated endpoint verification
deploy.sh      — production deploy script (MRTG-CMP pattern)
README.md      — this file
```

## Technology stack

- **Backend:** LibreSpeed Go (`speedtest-backend`), single static Go binary
- **Storage:** embedded SQLite (`data/telemetry.db`), one row per test
- **Frontend:** pure HTML5/CSS/JS (vanilla, no frameworks), served by the backend
- **Supervision:** systemd (`local-speedtest.service`), restart-on-failure
- **Port:** `8989` (configurable in `config/settings.toml`)

## DNS — Cloudflare Grey Cloud (DNS Only) for speedtest.mriazh.my.id

Speedtest traffic must NOT pass through Cloudflare's proxy (orange cloud) or a
Cloudflare Tunnel: that would route every test packet through Cloudflare WAN
edge nodes, throttling results to your ISP bandwidth and conflicting with
Cloudflare ToS.

Use a **DNS Only (Grey Cloud / Proxy Off)** A record so LAN clients resolve the
domain to the Debian host's private IP directly.

1. In Cloudflare DNS, add an **A** record:
   - Name: `speedtest`
   - IPv4 address: `<Debian private LAN IP>` (e.g. `192.168.1.100`, use a DHCP reservation/static IP)
   - Proxy status: **DNS Only** (grey cloud, off)
   - TTL: Auto

2. Verify from a LAN device:
   ```
   $ host speedtest.mriazh.my.id
   speedtest.mriazh.my.id has address 192.168.1.100
   $ curl http://speedtest.mriazh.my.id:8989/getIP
   ```

Only devices on the same LAN/WLAN (or VPN) can reach it, since the target is a
private IP.

## Local deployment on Debian (`~/Github-PC/Local-Speedtest`)

Clone (or copy) this repository to the Debian host:

```bash
# On the Debian PC
mkdir -p ~/Github-PC
cd ~/Github-PC
git clone <this-repo> Local-Speedtest
cd Local-Speedtest
```

### 1. Install the backend binary

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

`install.sh` detects `amd64`/`arm64`, downloads the official
`librespeed/speedtest-go` release tarball, extracts `speedtest-backend`,
makes it executable, and creates `config/`, `data/`, `web/`.

### 2. Deploy as a systemd service

Run as root (sudo):

```bash
sudo ./deploy.sh --app-user $USER --app-dir ~/Github-PC/Local-Speedtest
```

`deploy.sh` performs:
1. Dependency check (`curl`, `tar`, `systemctl`, `sudo`, `id`)
2. Directory prep under `@APP_DIR@`
3. Binary install via `scripts/install.sh`
4. systemd unit sed-templating (`@APP_DIR@`, `@APP_USER@`)
5. `daemon-reload`, `enable`, `restart`
6. Health verification (`/getIP` + `/results/telemetry` smoke test)

The service binds to `0.0.0.0:8989` and restarts on failure.

### 3. Verify

```bash
sudo systemctl status local-speedtest.service
sudo journalctl -u local-speedtest.service -f
curl http://<debian-ip>:8989/getIP
```

Open `http://speedtest.mriazh.my.id:8989` (or `http://<debian-ip>:8989`) from a
LAN device to run a test.

## Result sharing

When a test completes, the backend persists it to SQLite under a unique ULID
and returns an `id`. The frontend builds a shareable link:

```
http://speedtest.mriazh.my.id:8989/results/?id=<ulid>
```

Opening that link renders the result as a PNG card (download/upload/ping/jitter
+ ISP). The same result is available as JSON:

```
http://speedtest.mriazh.my.id:8989/results/json?id=<ulid>
```

The "Share" button on the completed test card copies this link to the clipboard,
so you can paste it into chat/email to share the exact metric card.

## Automated verification

```bash
python3 tests/test_local_speedtest.py             # localhost:8989
python3 tests/test_local_speedtest.py --host <ip> --port 8989
```

It asserts: frontend served, `/getIP` health, telemetry save returns an id,
`/results/json` renders metrics, and `/results` returns a PNG card.

## Security / network notes

- Service binds to `0.0.0.0:8989`. It is reachable only from your LAN/WLAN (or
  VPN) because `speedtest.mriazh.my.id` resolves to a private RFC1918 IP via
  Cloudflare DNS Only. No public WAN exposure.
- For hardening beyond the unit file's `ProtectSystem`/`NoNewPrivileges`
  settings, tune `systemd/local-speedtest.service` before deploying.
