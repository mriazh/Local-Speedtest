# Active Context: Local Speedtest

## Session Status
- **Current State:** Cloudflare Speed Test (`speed.cloudflare.com`) full layout replicated, verified, and live on Debian host.
- **Backend & Network:** Running on Debian (`172.16.171.23:8989`), DNS `speedtest.mriazh.my.id` (Cloudflare DNS-Only).

## Replicated Cloudflare Speed Features
1. **2-Column Layout (Matching speed.cloudflare.com):**
   - **Left Hero Card ("Your Internet Speed"):**
     * Headline metrics: Download (Mbps), Upload (Mbps), Latency (ms with down/up arrows), Jitter (ms with down/up arrows), Packet Loss (0%).
     * Dual-area spline chart: Orange gradient fill for Download, Purple gradient fill for Upload, with `90th percentile` horizontal dotted line.
     * Bottom action toolbar: Restart, Share, Copy Link, and timestamp.
   - **Right Hero Card ("Server & Network Path"):**
     * Topology visual: Client Device -> Switch Core -> Debian Host.
     * Details: IPv4 address, Server location (Local Debian 172.16.171.23), Local LAN Gigabit status.
2. **Network Quality Score (Calibrated for LAN & WiFi):**
   - **Streaming:** Bandwidth-focused. DL >= 50 Mbps & Jitter < 30ms -> 5 Stars (Ultra HD 4K/8K ready without buffering).
   - **Gaming:** Latency-focused. Ping < 15ms & Jitter < 25ms -> 5 Stars (Tournament-grade LAN response).
   - **Video Calls:** WebRTC-focused. Ping < 30ms & Jitter < 25ms -> 5 Stars (Crystal clear HD video & audio).
3. **Measurement Breakdown Cards:**
   - Download Measurements (Peak, Avg, Transferred).
   - Upload Measurements (Peak, Avg, Transferred).
   - Latency Measurements (Unloaded ping vs Loaded bufferbloat).
4. **Data Accuracy:**
   - Real Layer-7 HTTP transfer throughput measured directly via multi-threaded Web Workers.
   - Exact mathematical integration for byte accumulation and latency jitter calculation.
