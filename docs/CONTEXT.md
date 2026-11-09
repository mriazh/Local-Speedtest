# Active Context: Local Speedtest

## Session Status
- **Current State:** Opsi 1 (Ookla / Speedtest.net-inspired Single Gauge Dark UI) delivered and deployed.
- **Backend & Network:** Running on Debian (`172.16.171.23:8989`), DNS `speedtest.mriazh.my.id` (Cloudflare DNS-Only).
- **Frontend Architecture:**
  - Centerpiece: 1 Single large 240-degree tachometer speedometer gauge with glowing neon needle and gradient sweep.
  - Heart of Gauge: Circular "GO" button with pulse hover animation.
  - Active Transition: "GO" button smoothly morphs into digital live speed readout during test.
  - Telemetry Bar: Top horizontal panel with Ping (amber), Jitter (amber), Download (cyan), and Upload (purple) metrics.
  - Engine: Multi-threaded LibreSpeed Web Workers (`web/speedtest.js` + `web/speedtest_worker.js`) with SQLite persistence.
  - Result Card: Full metric summary with 1-click shareable link copy and direct link to PNG card (`/results/?id=<id>`).
  - LAN Friendly: 100% offline, zero external CDNs, responsive for mobile & desktop.
