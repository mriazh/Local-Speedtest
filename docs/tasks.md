# Tasks: Local Speedtest Implementation

Target Executor: Orca Claude Code Worker (`--agent claude --model sonnet`)

## Wave 1: Repository Structure & Backend Configuration
- [x] Task 1.1: Create directory skeleton (`config/`, `systemd/`, `data/`, `web/`, `scripts/`).
- [x] Task 1.2: Prepare LibreSpeed Go configuration (`config/settings.toml`) with SQLite telemetry enabled, local LAN bind, and result sharing enabled.
- [x] Task 1.3: Provide automated setup/install script (`scripts/install.sh`) to download official LibreSpeed Go binary (`speedtest-backend-linux-amd64`) and initialize directories.

## Wave 2: Frontend & Telemetry Assets
- [x] Task 2.1: Bundle lightweight HTML5 speedtest assets in `web/` configured to report metrics back to the Go telemetry endpoint.
- [x] Task 2.2: Verify result sharing template and unique hash endpoint (`/results/?id=...`).

## Wave 3: Daemonization & Production Scripts
- [x] Task 3.1: Create systemd service template `systemd/local-speedtest.service` parameterized for Debian user and deployment directory (`~/Github-PC/Local-Speedtest`).
- [x] Task 3.2: Create deploy and management script `deploy.sh` (similar to MRTG-CMP pattern) to install binary, setup systemd, reload, and verify service status.

## Wave 4: Automated Verification
- [x] Task 4.1: Create local verification test script (`tests/test_local_speedtest.py`) to assert HTTP endpoints (ping, download chunk, upload sink, telemetry record, and results page).
- [x] Task 4.2: Add README documentation with Cloudflare Grey Cloud DNS setup guide for `speedtest.mriazh.my.id`.

## Wave 5: Modern Dark-Mode UI Redesign (Speedometer Gauge)
- [x] Task 5.1: Design premium dark UI (`web/index.html`, `web/style.css`) with deep obsidian palette (#0b0f19), glowing neon accents, and responsive layout.
- [x] Task 5.2: Implement animated Canvas/SVG speedometer gauge that tracks real-time throughput smoothly.
- [x] Task 5.3: Wire `web/app.js` with official multi-threaded engine (`speedtest.js` & `speedtest_worker.js`) to achieve full Gigabit link saturation.
- [x] Task 5.4: Implement phase status indicator (Ping, Download, Upload, Complete) and polished result box with 1-click shareable link copy.
- [x] Task 5.5: Switch `config/settings.toml` to `assets_path = "web"`, verify endpoints and sync to host.
