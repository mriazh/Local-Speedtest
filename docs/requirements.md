# Requirements: Local Speedtest on Debian Server

## 1. Problem Statement
User requires a self-hosted, lightweight, high-performance local network speedtest server running on a Debian production machine. Client devices on the local area network (LAN/WLAN) including PCs, Laptops, Android, and iOS devices must be able to benchmark bandwidth, latency, and jitter directly against the Debian host without consuming public internet bandwidth or routing traffic out of the LAN. Test results must be logged with unique shareable result IDs.

## 2. User Stories
- **US-1 (Client Speedtest):** As a LAN user on mobile (Android/iOS) or desktop (PC/Mac), I want to open `speedtest.mriazh.my.id` in my web browser to immediately test upload, download, ping, and jitter against the local Debian server.
- **US-2 (Shareable Result ID):** As a user completing a test, I want a unique shareable link (e.g. `speedtest.mriazh.my.id/results/?id=...`) to review or share the exact test metric card.
- **US-3 (Admin Log & Telemetry):** As an administrator, I want historical speedtest results stored locally in an embedded database (SQLite) on Debian so I can inspect past tests and identify network degradation without external cloud dependencies.
- **US-4 (Local Network Integrity):** As a network operator, all speedtest payloads must stay 100% inside the local network (PC Debian connected to Core Switch) so that ISP quotas and WAN bandwidth are untouched.

## 3. Technical Constraints & Boundaries
1. **Domain Routing:** `speedtest.mriazh.my.id` must point directly to Debian's local IP (e.g., `192.168.x.x`) via Cloudflare DNS Only ("Grey Cloud"). Must NOT route through Cloudflare Proxy or Cloudflare Tunnel (Argo) to prevent WAN bottlenecking.
2. **Platform:** Debian Linux (amd64). Deployment organized under `~/Github-PC/Local-Speedtest`.
3. **Engine Choice:** LibreSpeed (Go backend) with embedded SQLite telemetry.
4. **Daemon Management:** Native `systemd` service unit for zero-overhead background execution and automatic boot persistence.
5. **Client Compatibility:** Pure HTML5 / JavaScript (no plugins, no native apps required; works on Safari iOS, Chrome Android, Desktop browsers).

## 4. Acceptance Criteria
- [ ] LibreSpeed Go backend configured with SQLite database telemetry.
- [ ] Responsive, clean, non-bloated HTML5 frontend configured.
- [ ] Unique hash ID generated and persisted on each test completion; accessible via `/results/?id=<hash>`.
- [ ] Systemd service file (`speedtest.service`) prepared for Debian.
- [ ] Nginx / reverse proxy configuration or direct port binding documented with DNS instructions for Cloudflare Grey Cloud.
- [ ] Automated verification script or test harness included to validate HTTP endpoints and result logging.
