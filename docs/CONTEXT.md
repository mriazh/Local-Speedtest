# Active Context: Local Speedtest

## Session Status
- **Current State:** Production Reverse Proxy (Apache port 80 & 443) with Let's Encrypt SSL (DNS-01 Challenge via Cloudflare API) fully active and operational.
- **Access URL:** `https://speedtest.mriazh.my.id` (Official Trusted SSL, no custom port needed).
- **Backend Service:** LibreSpeed Go (`127.0.0.1:8989`), SQLite telemetry (`data/telemetry.db`).

## Delivered Production Stack
1. **Domain & Routing:**
   - Cloudflare DNS-Only (Grey Cloud) -> Debian Local IP (`172.16.171.23`).
   - Reverse Proxy: Apache 2.4 VirtualHost on port 80 (auto 301 redirect to HTTPS) and port 443 (SSL termination).
   - Let's Encrypt SSL: DNS-01 verification via Cloudflare API token. Auto-renew enabled via `certbot.timer`.
2. **Frontend UI:**
   - Cloudflare Speed Test (`speed.cloudflare.com`) Dark/Light theme with Sun/Moon toggle.
   - Bilingual support: `[ ID | EN ]` toggle covering all labels and statuses.
   - Custom SVG Favicon.
   - Real-time dual-area spline chart (Download Orange #f6821f, Upload Purple #8a63d2, 90th %ile line).
   - Topology & AIM Quality Score matrix calibrated for Gigabit LAN / WiFi.
   - Shareable result card with 1-click Copy Link.
