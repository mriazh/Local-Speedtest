# Technical Design: Local Speedtest Architecture

## 1. Architecture Overview

```text
[ Client: Phone / Laptop ]
       │  (WLAN / WiFi 5/6)
[ Access Point / Switch ]
       │  (Gigabit Ethernet Cable)
[ Switch Core ]
       │  (1 Gbps / 2.5 Gbps LAN Cable)
[ PC Debian Host ]
   ├── Port 8989: LibreSpeed Go Server (speedtest-backend)
   ├── SQLite: telemetry.db (Result logs & unique test hashes)
   └── Web Assets: Lightweight HTML5 frontend (/assets, /results)
```

## 2. DNS & Traffic Routing Strategy

- **Domain:** `speedtest.mriazh.my.id`
- **DNS Provider:** Cloudflare DNS
- **Record Type:** `A`
- **Target Value:** Debian Private LAN IP (e.g. `192.168.1.100` or DHCP reservation)
- **Proxy Status:** **DNS Only (Grey Cloud / Off)**
  - *Rationale:* Enabling Cloudflare Proxy or Cloudflare Tunnel routes all speedtest packets through Cloudflare WAN edge nodes, throttling speed to ISP bandwidth and violating Cloudflare ToS section 2.8. DNS Only returns the local private IP directly to LAN devices.

## 3. Core Components

### 3.1 Backend Engine: LibreSpeed Go (`speedtest-go`)
- **Binary:** Standalone Go binary (compiled for `linux/amd64` or official release binary).
- **Resource Footprint:** ~15 MB RAM, negligible idle CPU.
- **Port:** Configurable (default `8989` or standard HTTP `80` if direct).
- **Configuration:** `settings.toml` controlling listen address, database connection, telemetry settings, and payload sizes.

### 3.2 Telemetry & Result Storage (SQLite)
- **Database File:** `data/telemetry.db`
- **Schema:**
  - `id`: Unique test result hash / integer ID
  - `timestamp`: UTC datetime
  - `ip`: Client local IP address
  - `dl`: Download speed (Mbps)
  - `ul`: Upload speed (Mbps)
  - `ping`: Latency (ms)
  - `jitter`: Jitter (ms)
  - `log`: Raw telemetry payload
- **Result Viewing:** Handled by backend `/results/?id=<hash>` returning rendered card or JSON metrics.

### 3.3 Frontend
- Clean HTML5 speedtest UI served statically by the Go backend or reverse proxy.
- Gauge / minimalist UI showing Download, Upload, Ping, and Jitter.
- Automatic result share button generating the unique link upon test completion.

### 3.4 Service Supervision (Systemd)
- Unit file: `systemd/local-speedtest.service`
- Restart on failure, auto-start on Debian boot.

## 4. Security & Network Considerations
- Service binds to LAN interface or `0.0.0.0:8989`.
- Since it points to private IP, outside internet users cannot reach the service without being connected to the local WiFi/LAN or VPN (WireGuard/Tailscale).
