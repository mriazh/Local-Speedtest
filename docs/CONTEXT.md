# Active Context: Local Speedtest

## Session Status
- **Current State:** 5 Network Quality Score items and MIT License fully implemented, tested via Playwright, and live on Debian host.
- **Access URL:** `https://speedtest.mriazh.my.id` (Enforced HTTPS, Let's Encrypt SSL, Port 443).
- **License:** MIT License, Copyright (c) 2026 Muhammad Riyadh Azhar (`LICENSE`).

## Network Quality Score (5 Workloads):
1. **Streaming:** 4K/8K Media & Live Buffers (DL >= 50 Mbps, Jitter < 30ms -> 5 Stars).
2. **Video Calls:** Real-time WebRTC & Audio (Ping < 30ms, Jitter < 25ms -> 5 Stars).
3. **AnyDesk:** Remote Desktop & Control (Ping < 20ms, Jitter < 15ms -> 5 Stars).
4. **File Transfer:** Gigabit NAS & Data Sync (DL >= 100 Mbps, UL >= 80 Mbps -> 5 Stars).
5. **Cloud & Office:** SaaS & Intranet Portals (Ping < 40ms, DL >= 25 Mbps -> 5 Stars).
*Note: "Gaming" completely removed across all UI cards, i18n dictionaries, and results export.*

## Technical Hardening:
- Backend binds strictly to `127.0.0.1:8989` (unencrypted port 8989 completely blocked from LAN/WAN).
- Apache Reverse Proxy terminates TLS on port 443 with valid Let's Encrypt certificates.
- Responsive mobile & tablet layout with touch-friendly controls.
- Playwright verified: 0 console errors on both `index.html` and `results.html`.
