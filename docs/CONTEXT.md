# Active Context: Local Speedtest

## Session Status
- **Current State:** Cloudflare Speed Test (`speed.cloudflare.com`) full layout replicated, verified, and live on Debian host.
- **Backend & Network:** Running on Debian (`172.16.171.23:8989`), DNS `speedtest.mriazh.my.id` (Cloudflare DNS-Only).

## Delivered Capabilities
1. **Light / Dark Mode Toggle (Speed.cloudflare.com Style):**
   - Sun/Moon icon in header controls.
   - Light Theme (`[data-theme="light"]`): Crisp clean white surfaces (#ffffff), light gray background (#f8fafc), dark typography, dual-area spline chart adapting with light fill gradients.
   - Dark Theme: Obsidian black background (#0b0c0e) and cards (#121316).
   - Persisted in `localStorage.getItem('cf_theme')`.
2. **Language Switcher (EN / ID):**
   - `[ ID | EN ]` toggle button in header.
   - Full bilingual dictionary covering all metrics, cards, labels, statuses, and explanations in English and Bahasa Indonesia.
   - Persisted in `localStorage.getItem('cf_lang')`.
3. **Custom Favicon:**
   - SVG vector favicon (`web/favicon.svg`) linked in `<head>` for browser tabs.
4. **Network Quality Score & Accurate Telemetry:**
   - Real-time layer-7 HTTP throughput via multi-threaded Web Workers.
   - Calibrated 5-star rating for Streaming, Gaming, and Video Calls.
