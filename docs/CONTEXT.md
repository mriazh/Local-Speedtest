# Active Context: Local Speedtest

## Session Status
- **Current State:** Cloudflare Speed Test (`speed.cloudflare.com`) Dark Theme completely implemented, verified, committed, pushed to GitHub (`origin/master`), and deployed live on Debian host.
- **Backend & Network:** Running on Debian (`172.16.171.23:8989`), DNS `speedtest.mriazh.my.id` (Cloudflare DNS-Only).
- **Frontend Architecture (Cloudflare Speed Style):**
  - **Visuals:** Obsidian black background (`#0a0a0c`), sleek card surfaces (`#121316`), sharp 1px borders (`#22242c`).
  - **Color Accents:** Cloudflare Iconic Orange (`#f6821f`), Electric Cyan (`#00a4e4`), Vivid Purple (`#8a63d2`), Amber (`#f59e0b`).
  - **Top Banner:** Cloudflare brand cloud logo, server indicator pill (`Debian PC • 172.16.171.23 • 100% Local LAN`), and Client IP badge.
  - **Stepper Navigation:** 4-stage active indicator: `[1. Latency]` ➔ `[2. Download]` ➔ `[3. Upload]` ➔ `[4. Complete]`.
  - **Hero Section:** Large glowing "START SPEED TEST" button transitioning into big digital readout with live real-time sparkline area chart.
  - **The 4-Card Matrix:**
    * DOWNLOAD (Mbps) + sparkline graph + Peak/Average breakdown.
    * UPLOAD (Mbps) + sparkline graph + Peak/Average breakdown.
    * LATENCY (ms) + Min/Avg breakdown.
    * JITTER (ms) + connection rating badge ("Ultra Stable").
  - **Share & Telemetry Card:** Pops up on completion with shareable SQLite link (`http://speedtest.mriazh.my.id:8989/results/?id=<id>`), 1-click Copy button, and direct PNG card link.
  - **Offline LAN Ready:** 100% self-contained, zero external CDNs or Google Fonts.
