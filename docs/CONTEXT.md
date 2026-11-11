# Active Context: Local Speedtest

## Session Status
- **Current State:** Metric reconciliation, client IP fallback persistence, and clean label polishing complete and verified in real browser via Playwright. Live on Debian host.
- **Access URL:** `https://speedtest.mriazh.my.id` (Let's Encrypt SSL, Apache Reverse Proxy port 443).

## Delivered Fixes & Refinements
1. **Word "(PNG)" Removed:**
   - Buttons now cleanly state `Open Result Card` and `Download Card` (Bahasa Indonesia: `Buka Kartu Hasil` and `Unduh Kartu`).
2. **Exact Metric Reconciliation:**
   - `showShareableTelemetry` now reconciles headline speed with the exact SQLite database record (`/results/json?id=<id>`).
   - Ensures the numbers on `index.html` and `results.html` match 100.0% to the exact decimal point.
3. **Client IP Persistence:**
   - Client IP passed via share link parameter `&ip=<client_ip>` and fallback to `/getIP`.
   - Client IP on `results.html` displays the actual IP (e.g. `172.31.136.118`) and is never left blank as `--`.
4. **Verified via Playwright:**
   - Zero console errors across both pages.
