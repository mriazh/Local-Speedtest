# Tasks: Local Speedtest Implementation

Target Executor: Orca Claude Code Worker (`--agent claude --model sonnet`)

## Wave 1: Repository Structure & Backend Configuration
- [ ] Task 1.1: Create directory skeleton (`config/`, `systemd/`, `data/`, `web/`, `scripts/`).
- [ ] Task 1.2: Prepare LibreSpeed Go configuration (`config/settings.toml`) with SQLite telemetry enabled, local LAN bind, and result sharing enabled.
- [ ] Task 1.3: Provide automated setup/install script (`scripts/install.sh`) to download official LibreSpeed Go binary (`speedtest-backend-linux-amd64`) and initialize directories.

## Wave 2: Frontend & Telemetry Assets
- [ ] Task 2.1: Bundle lightweight HTML5 speedtest assets in `web/` configured to report metrics back to the Go telemetry endpoint.
- [ ] Task 2.2: Verify result sharing template and unique hash endpoint (`/results/?id=...`).

## Wave 3: Daemonization & Production Scripts
- [ ] Task 3.1: Create systemd service template `systemd/local-speedtest.service` parameterized for Debian user and deployment directory (`~/Github-PC/Local-Speedtest`).
- [ ] Task 3.2: Create deploy and management script `deploy.sh` (similar to MRTG-CMP pattern) to install binary, setup systemd, reload, and verify service status.

## Wave 4: Automated Verification
- [ ] Task 4.1: Create local verification test script (`tests/verify_endpoints.sh` or Python healthcheck) to assert HTTP endpoints (ping, download chunk, upload sink, telemetry record, and results page).
- [ ] Task 4.2: Add README documentation with Cloudflare Grey Cloud DNS setup guide for `speedtest.mriazh.my.id`.
