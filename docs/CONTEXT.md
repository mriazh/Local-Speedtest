# Active Context: Local Speedtest

## Session Status
- **Current State:** Planning phase completed. All 4 core specification documents created and committed in `/docs`.
- **Worker Status:** Worker dispatch paused/stopped on user request (user closing laptop). No worker running.
- **Target Deployment:** Debian PC host (`~/Github-PC/Local-Speedtest`).
- **Domain Mapping:** `speedtest.mriazh.my.id` -> Local Debian IP via Cloudflare DNS-Only (Grey Cloud).
- **Core Technology Stack:**
  - Backend: LibreSpeed Go binary
  - Storage: Embedded SQLite (`data/telemetry.db`)
  - Frontend: Responsive HTML5 Speedtest UI with unique result hash URLs
  - Supervision: Systemd unit (`local-speedtest.service`)

## Key Decisions
1. **Engine Selection:** LibreSpeed Go selected over OpenSpeedTest because user explicitly requires shareable test result links/hash IDs and persistent logging.
2. **DNS Routing Strategy:** Must be Cloudflare DNS Only ("Grey Cloud"). Cloudflare Tunnel / Proxy rejected because speedtest traffic would bottleneck on WAN/ISP bandwidth and trigger rate limits.
3. **Switch Core Topology:** Test packets flow from Client -> Access Point -> Switch Core -> Debian PC. Testing against Debian PC automatically tests Switch Core throughput without overloading switch CPU.

## Next Actions (Resume When Ready)
- When resuming session, dispatch Orca Claude Code worker (`--agent claude --model sonnet`) using `docs/worker-spec.txt` in a fresh child worktree to execute Wave 1 through Wave 4.
