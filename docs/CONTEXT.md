# Active Context: Local Speedtest

## Session Status
- **Current State:** OpenSpeedTest genuine vector UI integration complete and live.
- **Backend & Network:** Running on Debian (`172.16.171.23:8989`), DNS `speedtest.mriazh.my.id` (Cloudflare DNS-Only).
- **Frontend Architecture:**
  - Official OpenSpeedTest UI: High-res SVG tachometer dial, vector needle, neon glow animations, dark mode.
  - Endpoints wired to Debian LibreSpeed Go: `Download: "garbage"`, `Upload: "empty"`, `ping: "empty"`.
  - SQLite Telemetry Bridge: Mutation observer detects test completion, posts metrics to `/results/telemetry`, and displays floating dark share card with copyable link (`/results/?id=<id>`).
  - 100% offline LAN compatible.
