/* ==========================================================================
   Local Speedtest — Cloudflare Speed Test Frontend Logic
   Inspired by speed.cloudflare.com.
   100% Offline LAN Compatible.
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Internationalization (i18n) Dictionary
  // ---------------------------------------------------------------------------
  const I18N = {
    en: {
      brand_desc: 'LAN speedtest &bull; speedtest.mriazh.my.id',
      server_pill: 'Debian PC • 172.16.171.23 • 100% Local LAN',
      badge_client_ip: 'CLIENT IP',
      your_network_speed: 'Your Network Speed',
      btn_start_test: 'Start Test',
      btn_testing: 'Testing...',
      btn_restart_test: 'Restart Test',
      btn_copy_link: 'Copy Share Link',
      label_download: 'DOWNLOAD',
      label_upload: 'UPLOAD',
      label_latency: 'LATENCY',
      label_jitter: 'JITTER',
      label_packet_loss: 'PACKET LOSS',
      peak_colon: 'Peak:',
      min_colon: 'Min:',
      lan_buffer_colon: 'LAN Buffer:',
      optimal: 'Optimal',
      stable: 'Stable',
      optimal_sub3: 'Optimal (<3ms)',
      zero_dropped: '0 dropped',
      legend_download: 'Download',
      legend_p90: '90th %ile',
      legend_upload: 'Upload',
      measured_at: 'Measured at',
      server_network_path: 'Server & Network Path',
      node_client: 'Client Device',
      node_switch: 'Switch Core',
      node_server: 'Debian Host',
      meta_connected_ipv4: 'Connected via IPv4',
      meta_server_location: 'Server location',
      val_server_location: 'Local Debian Host (172.16.171.23)',
      meta_network: 'Network',
      val_network: 'Local LAN Gigabit (Zero Internet Quota)',
      meta_latency_quality: 'Latency Quality',
      val_latency_quality: 'LAN Sub-millisecond',
      section_quality_score: 'Network Quality Score',
      section_quality_subtitle: 'Real-time Cloudflare AIM quality assessment for LAN workloads',
      quality_streaming: 'Streaming',
      desc_streaming: '4K/8K Media & Live Buffers',
      quality_gaming: 'Gaming',
      desc_gaming: 'Low Tick-rate & Competitive',
      quality_video: 'Video Calls',
      desc_video: 'Real-time WebRTC & Audio',
      ready: 'Ready',
      status_ready: 'READY',
      status_running: 'RUNNING',
      status_completed: 'COMPLETED',
      status_download: 'DOWNLOAD',
      status_upload: 'UPLOAD',
      badge_great: 'Great',
      badge_good: 'Good',
      badge_fair: 'Fair',
      badge_poor: 'Poor',
      reason_streaming_init: 'Requires Jitter < 5ms, DL > 50M',
      reason_streaming_5: 'Ultra HD 4K/8K ready without buffering',
      reason_streaming_4: 'Smooth 1080p Full HD streaming',
      reason_streaming_3: 'Standard 720p streaming',
      reason_streaming_2: 'Low throughput or high jitter',
      reason_gaming_init: 'Requires Ping < 10ms, Jitter < 3ms',
      reason_gaming_5: 'Tournament-grade LAN response (< 15ms)',
      reason_gaming_4: 'Competitive multiplayer ready',
      reason_gaming_3: 'Casual gaming acceptable',
      reason_gaming_2: 'High latency or noticeable jitter',
      reason_video_init: 'Requires Ping < 20ms, Jitter < 5ms',
      reason_video_5: 'Crystal clear HD video & audio',
      reason_video_4: 'Smooth video calls with minor delay',
      reason_video_3: 'Occasional talk-over or delay',
      reason_video_2: 'Noticeable lag or packet stutter',
      section_breakdown: 'Measurement Breakdown',
      section_breakdown_subtitle: 'Detailed throughput, latency, and buffer statistics',
      card_download_measurements: 'Download Measurements',
      card_upload_measurements: 'Upload Measurements',
      card_latency_measurements: 'Latency Measurements',
      peak_speed: 'Peak speed',
      average_speed: 'Average speed',
      data_transferred: 'Data transferred',
      unloaded_ping: 'Unloaded ping (Idle)',
      loaded_bufferbloat: 'Loaded bufferbloat',
      jitter_stability: 'Jitter stability',
      result_saved: 'Result Saved',
      test_id_label: 'Test ID:',
      persisted_sqlite: 'Persisted in local SQLite database',
      copy: 'Copy',
      copied: 'Copied!',
      open_result_card: 'Open Result Card (PNG)',
      footer_powered: 'Local Speedtest • Powered by LibreSpeed Go backend',
      footer_lan: 'Zero Internet Quota • 100% Offline LAN Benchmark'
    },
    id: {
      brand_desc: 'Uji Kecepatan LAN &bull; speedtest.mriazh.my.id',
      server_pill: 'PC Debian • 172.16.171.23 • 100% LAN Lokal',
      badge_client_ip: 'IP KLIEN',
      your_network_speed: 'Kecepatan Jaringan Anda',
      btn_start_test: 'MULAI UJI KECEPATAN',
      btn_testing: 'Menguji...',
      btn_restart_test: 'Uji Ulang',
      btn_copy_link: 'Salin Tautan',
      label_download: 'UNDUH',
      label_upload: 'UNGGAH',
      label_latency: 'LATENSI',
      label_jitter: 'JITTER',
      label_packet_loss: 'PAKET HILANG',
      peak_colon: 'Puncak:',
      min_colon: 'Min:',
      lan_buffer_colon: 'Buffer LAN:',
      optimal: 'Optimal',
      stable: 'Stabil',
      optimal_sub3: 'Optimal (<3ms)',
      zero_dropped: '0 hilang',
      legend_download: 'Unduh',
      legend_p90: 'Persentil ke-90',
      legend_upload: 'Unggah',
      measured_at: 'Diukur pada',
      server_network_path: 'Jalur Server & Jaringan',
      node_client: 'Perangkat Klien',
      node_switch: 'Inti Switch',
      node_server: 'Host Debian',
      meta_connected_ipv4: 'Terhubung melalui IPv4',
      meta_server_location: 'Lokasi Server',
      val_server_location: 'Host Debian Lokal (172.16.171.23)',
      meta_network: 'Jaringan',
      val_network: 'LAN Gigabit Lokal (Tanpa Kuota Internet)',
      meta_latency_quality: 'Kualitas Latensi',
      val_latency_quality: 'LAN Sub-milidetik',
      section_quality_score: 'Skor Kualitas Jaringan',
      section_quality_subtitle: 'Penilaian kualitas Cloudflare AIM waktu nyata untuk beban kerja LAN',
      quality_streaming: 'Streaming Video',
      desc_streaming: 'Media 4K/8K & Buffer Siaran Langsung',
      quality_gaming: 'Game Online',
      desc_gaming: 'Tick-rate Rendah & Kompetitif',
      quality_video: 'Panggilan Video',
      desc_video: 'WebRTC & Audio Waktu Nyata',
      ready: 'Siap',
      status_ready: 'SIAP',
      status_running: 'MENGUJI',
      status_completed: 'SELESAI',
      status_download: 'UNDUH',
      status_upload: 'UNGGAH',
      badge_great: 'Bagus Sekali',
      badge_good: 'Baik',
      badge_fair: 'Cukup',
      badge_poor: 'Kurang',
      reason_streaming_init: 'Membutuhkan Jitter < 5ms, DL > 50M',
      reason_streaming_5: 'Siap Ultra HD 4K/8K tanpa buffering',
      reason_streaming_4: 'Streaming lancar 1080p Full HD',
      reason_streaming_3: 'Streaming standar 720p',
      reason_streaming_2: 'Throughput rendah atau jitter tinggi',
      reason_gaming_init: 'Membutuhkan Ping < 10ms, Jitter < 3ms',
      reason_gaming_5: 'Respons LAN tingkat turnamen (< 15ms)',
      reason_gaming_4: 'Siap multiplayer kompetitif',
      reason_gaming_3: 'Dapat diterima untuk game kasual',
      reason_gaming_2: 'Latensi tinggi atau jitter terasa',
      reason_video_init: 'Membutuhkan Ping < 20ms, Jitter < 5ms',
      reason_video_5: 'Video & audio HD sangat jernih',
      reason_video_4: 'Panggilan video lancar dengan jeda minim',
      reason_video_3: 'Terkadang terjadi tabrakan suara atau jeda',
      reason_video_2: 'Lag terasa atau stutter paket',
      section_breakdown: 'Rincian Pengukuran',
      section_breakdown_subtitle: 'Statistik throughput, latensi, dan buffer terperinci',
      card_download_measurements: 'Pengukuran Unduh',
      card_upload_measurements: 'Pengukuran Unggah',
      card_latency_measurements: 'Pengukuran Latensi',
      peak_speed: 'Kecepatan Puncak',
      average_speed: 'Kecepatan Rata-rata',
      data_transferred: 'Data Ditransfer',
      unloaded_ping: 'Ping Tanpa Beban (Idle)',
      loaded_bufferbloat: 'Bufferbloat Saat Terbebani',
      jitter_stability: 'Stabilitas Jitter',
      result_saved: 'Hasil Disimpan',
      test_id_label: 'ID Uji:',
      persisted_sqlite: 'Tersimpan di basis data SQLite lokal',
      copy: 'Salin',
      copied: 'Tersalin!',
      open_result_card: 'Buka Kartu Hasil (PNG)',
      footer_powered: 'Local Speedtest • Ditenagai oleh backend LibreSpeed Go',
      footer_lan: 'Tanpa Kuota Internet • Tolok Ukur LAN Offline 100%'
    }
  };

  // ---------------------------------------------------------------------------
  // Dual-Area Spline Chart (Download Orange + Upload Purple + P90 Guide Line)
  // ---------------------------------------------------------------------------
  class DualAreaChart {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = window.devicePixelRatio || 1;
      this.dlData = [];
      this.ulData = [];
      this.p90Val = null;
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || this.canvas.width || 600;
      const h = rect.height || this.canvas.height || 220;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.w = w;
      this.h = h;
      this.draw();
    }

    pushDl(val) {
      this.dlData.push(val);
      this.calcP90();
      this.draw();
    }

    pushUl(val) {
      this.ulData.push(val);
      this.draw();
    }

    calcP90() {
      if (this.dlData.length < 3) {
        this.p90Val = null;
        return;
      }
      const sorted = [...this.dlData].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.9);
      this.p90Val = sorted[idx];
    }

    clear() {
      this.dlData = [];
      this.ulData = [];
      this.p90Val = null;
      this.draw();
    }

    draw() {
      const ctx = this.ctx;
      const w = this.w;
      const h = this.h;
      if (!ctx || !w || !h) return;

      ctx.clearRect(0, 0, w, h);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const padTop = 16;
      const padBot = 20;
      const drawH = h - padTop - padBot;

      // Draw horizontal grid lines adapting to theme
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padTop + (drawH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const allData = [...this.dlData, ...this.ulData];
      if (allData.length === 0) {
        // Draw idle baseline
        ctx.beginPath();
        ctx.moveTo(0, h - padBot);
        ctx.lineTo(w, h - padBot);
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
      }

      const maxVal = Math.max(...allData, 10);
      const minVal = 0;
      const range = maxVal - minVal || 1;

      // Helper to compute curve points
      const computePoints = (data) => {
        if (!data || data.length === 0) return [];
        return data.map((v, i) => {
          const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
          const y = h - padBot - ((v - minVal) / range) * drawH;
          return { x, y };
        });
      };

      // Helper to draw smooth spline path
      const drawSplinePath = (pts) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i - 1].x + pts[i].x) / 2;
          const yc = (pts[i - 1].y + pts[i].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      };

      // 1. Draw Download Series (Cloudflare Orange: #f6821f)
      if (this.dlData.length > 1) {
        const dlPts = computePoints(this.dlData);

        // Fill gradient
        ctx.beginPath();
        ctx.moveTo(dlPts[0].x, dlPts[0].y);
        for (let i = 1; i < dlPts.length; i++) {
          const xc = (dlPts[i - 1].x + dlPts[i].x) / 2;
          const yc = (dlPts[i - 1].y + dlPts[i].y) / 2;
          ctx.quadraticCurveTo(dlPts[i - 1].x, dlPts[i - 1].y, xc, yc);
        }
        ctx.lineTo(dlPts[dlPts.length - 1].x, dlPts[dlPts.length - 1].y);
        ctx.lineTo(w, h - padBot);
        ctx.lineTo(0, h - padBot);
        ctx.closePath();

        const dlGrad = ctx.createLinearGradient(0, padTop, 0, h - padBot);
        dlGrad.addColorStop(0, isLight ? 'rgba(246, 130, 31, 0.22)' : 'rgba(246, 130, 31, 0.35)');
        dlGrad.addColorStop(1, 'rgba(246, 130, 31, 0.0)');
        ctx.fillStyle = dlGrad;
        ctx.fill();

        // Stroke line
        drawSplinePath(dlPts);
        ctx.strokeStyle = '#f6821f';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isLight ? 'rgba(246, 130, 31, 0.3)' : 'rgba(246, 130, 31, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 2. Draw 90th Percentile Guide Line (Dotted Amber/Orange)
      if (this.p90Val !== null && this.dlData.length > 2) {
        const p90Y = h - padBot - ((this.p90Val - minVal) / range) * drawH;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(0, p90Y);
        ctx.lineTo(w, p90Y);
        ctx.strokeStyle = isLight ? 'rgba(217, 119, 6, 0.75)' : 'rgba(250, 173, 63, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isLight ? '#d97706' : '#faad3f';
        ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
        ctx.fillText('90%ile: ' + this.p90Val.toFixed(1) + ' Mbps', 8, Math.max(p90Y - 4, 14));
        ctx.restore();
      }

      // 3. Draw Upload Series (Cloudflare Purple: #8a63d2)
      if (this.ulData.length > 1) {
        const ulPts = computePoints(this.ulData);

        // Fill gradient
        ctx.beginPath();
        ctx.moveTo(ulPts[0].x, ulPts[0].y);
        for (let i = 1; i < ulPts.length; i++) {
          const xc = (ulPts[i - 1].x + ulPts[i].x) / 2;
          const yc = (ulPts[i - 1].y + ulPts[i].y) / 2;
          ctx.quadraticCurveTo(ulPts[i - 1].x, ulPts[i - 1].y, xc, yc);
        }
        ctx.lineTo(ulPts[ulPts.length - 1].x, ulPts[ulPts.length - 1].y);
        ctx.lineTo(w, h - padBot);
        ctx.lineTo(0, h - padBot);
        ctx.closePath();

        const ulGrad = ctx.createLinearGradient(0, padTop, 0, h - padBot);
        ulGrad.addColorStop(0, isLight ? 'rgba(138, 99, 210, 0.22)' : 'rgba(138, 99, 210, 0.35)');
        ulGrad.addColorStop(1, 'rgba(138, 99, 210, 0.0)');
        ctx.fillStyle = ulGrad;
        ctx.fill();

        // Stroke line
        drawSplinePath(ulPts);
        ctx.strokeStyle = '#8a63d2';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isLight ? 'rgba(138, 99, 210, 0.3)' : 'rgba(138, 99, 210, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Speedtest Parameters & Endpoints
  // ---------------------------------------------------------------------------
  const SPEEDTEST_PARAMS = {
    telemetry_level: 'basic',
    url_telemetry: 'results/telemetry',
    url_dl: 'garbage',
    url_ul: 'empty',
    url_ping: 'empty',
    url_getIp: 'getIP',
    test_order: 'IPDU'
  };

  const isResultsPage =
    location.pathname.endsWith('results.html') || location.pathname.includes('/results.html');

  // ---------------------------------------------------------------------------
  // Results Page Handler (web/results.html)
  // ---------------------------------------------------------------------------
  async function initResultsPageView() {
    const statusEl = document.getElementById('resultStatus');
    const gaugesEl = document.getElementById('gauges');
    const rDl = document.getElementById('rDl');
    const rUl = document.getElementById('rUl');
    const rPing = document.getElementById('rPing');
    const rJitter = document.getElementById('rJitter');
    const rMeta = document.getElementById('rMeta');
    const rCard = document.getElementById('rCard');

    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      if (statusEl) statusEl.textContent = 'No result ID provided. Example: /results.html?id=<id>';
      return;
    }

    try {
      const res = await fetch('/results/json?id=' + encodeURIComponent(id) + '&n=' + Date.now(), {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Result not found');
      const data = await res.json();

      if (rDl) rDl.textContent = data.download || '--';
      if (rUl) rUl.textContent = data.upload || '--';
      if (rPing) rPing.textContent = data.ping || '--';
      if (rJitter) rJitter.textContent = data.jitter || '--';
      if (rMeta) {
        rMeta.textContent =
          (data.ispinfo ? data.ispinfo + ' • ' : '') + (data.timestamp || '');
      }
      if (rCard) {
        rCard.src = '/results?id=' + encodeURIComponent(id);
        rCard.hidden = false;
      }
      if (gaugesEl) gaugesEl.hidden = false;
      if (statusEl) statusEl.hidden = true;
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Could not load result: ' + err.message;
    }
  }

  if (isResultsPage) {
    document.addEventListener('DOMContentLoaded', initResultsPageView);
    return;
  }

  // ---------------------------------------------------------------------------
  // Main Index Page Logic (Cloudflare Speed Style)
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    // Header & Control Elements
    const clientIpVal = document.getElementById('clientIpVal');
    const metaClientIp = document.getElementById('metaClientIp');
    const topoClientIp = document.getElementById('topoClientIp');
    const langToggleBtn = document.getElementById('langToggleBtn');
    const langOptId = document.getElementById('langOptId');
    const langOptEn = document.getElementById('langOptEn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // Hero Speed Elements
    const testStateBadge = document.getElementById('testStateBadge');
    const primaryHeroBtn = document.getElementById('primaryHeroBtn');
    const primaryHeroBtnLabel = document.getElementById('primaryHeroBtnLabel');
    const restartTestBtn = document.getElementById('restartTestBtn');
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    const copyBtnText = document.getElementById('copyBtnText');
    const timestampDisplay = document.getElementById('timestampDisplay');

    // Hero Metric Elements
    const heroValDl = document.getElementById('heroValDl');
    const heroValDlPeak = document.getElementById('heroValDlPeak');
    const heroValUl = document.getElementById('heroValUl');
    const heroValUlPeak = document.getElementById('heroValUlPeak');
    const heroValPing = document.getElementById('heroValPing');
    const heroValPingMin = document.getElementById('heroValPingMin');
    const heroValJitter = document.getElementById('heroValJitter');
    const heroValBuffer = document.getElementById('heroValBuffer');

    // Canvas Chart
    const dualAreaCanvas = document.getElementById('dualAreaChart');
    const dualChart = dualAreaCanvas ? new DualAreaChart(dualAreaCanvas) : null;

    // Quality Score Elements
    const starsStreaming = document.getElementById('starsStreaming');
    const badgeStreaming = document.getElementById('badgeStreaming');
    const reasonStreaming = document.getElementById('reasonStreaming');

    const starsGaming = document.getElementById('starsGaming');
    const badgeGaming = document.getElementById('badgeGaming');
    const reasonGaming = document.getElementById('reasonGaming');

    const starsVideo = document.getElementById('starsVideo');
    const badgeVideo = document.getElementById('badgeVideo');
    const reasonVideo = document.getElementById('reasonVideo');

    // Measurement Breakdown Elements
    const bValDlPeak = document.getElementById('bValDlPeak');
    const bValDlAvg = document.getElementById('bValDlAvg');
    const bValDlBytes = document.getElementById('bValDlBytes');

    const bValUlPeak = document.getElementById('bValUlPeak');
    const bValUlAvg = document.getElementById('bValUlAvg');
    const bValUlBytes = document.getElementById('bValUlBytes');

    const bValPingUnloaded = document.getElementById('bValPingUnloaded');
    const bValLoadedBuffer = document.getElementById('bValLoadedBuffer');
    const bValJitterStat = document.getElementById('bValJitterStat');

    // Telemetry Bar Elements
    const telemetrySection = document.getElementById('telemetrySection');
    const telemetryIdDisplay = document.getElementById('telemetryIdDisplay');
    const shareUrlInput = document.getElementById('shareUrlInput');
    const btnCopyShareTelemetry = document.getElementById('btnCopyShareTelemetry');
    const copyTelemetryBtnText = document.getElementById('copyTelemetryBtnText');
    const linkViewResultCard = document.getElementById('linkViewResultCard');

    window.addEventListener('resize', () => {
      if (dualChart) dualChart.resize();
    });

    // -------------------------------------------------------------------------
    // Theme Management
    // -------------------------------------------------------------------------
    function getInitialTheme() {
      try {
        const stored = localStorage.getItem('cf_theme');
        if (stored === 'light' || stored === 'dark') return stored;
      } catch (_) {}
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
      return 'dark';
    }

    function applyTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      try {
        localStorage.setItem('cf_theme', theme);
      } catch (_) {}
      if (dualChart) {
        dualChart.draw();
      }
    }

    applyTheme(getInitialTheme());

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        const isCurrentLight = document.documentElement.getAttribute('data-theme') === 'light';
        applyTheme(isCurrentLight ? 'dark' : 'light');
      });
    }

    // -------------------------------------------------------------------------
    // Language / i18n Management
    // -------------------------------------------------------------------------
    function getInitialLang() {
      try {
        const stored = localStorage.getItem('cf_lang');
        if (stored === 'id' || stored === 'en') return stored;
      } catch (_) {}
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      return navLang.startsWith('id') ? 'id' : 'en';
    }

    let currentLang = getInitialLang();

    function t(key) {
      const dict = I18N[currentLang] || I18N.en;
      return dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
    }

    // Cached measurement metrics for language rerendering
    let lastDlVal = null;
    let lastPingVal = null;
    let lastJitterVal = null;
    let lastMeasuredTime = null;

    function applyLanguage(lang) {
      currentLang = lang === 'id' ? 'id' : 'en';
      document.documentElement.setAttribute('lang', currentLang);
      try {
        localStorage.setItem('cf_lang', currentLang);
      } catch (_) {}

      // Update [ ID | EN ] button active state
      if (langOptId && langOptEn) {
        if (currentLang === 'id') {
          langOptId.classList.add('active');
          langOptEn.classList.remove('active');
        } else {
          langOptEn.classList.add('active');
          langOptId.classList.remove('active');
        }
      }

      // Translate all static data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val) {
          if (val.includes('&bull;')) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        }
      });

      // Update dynamic elements
      if (primaryHeroBtnLabel) {
        primaryHeroBtnLabel.textContent = isRunning ? t('btn_testing') : t('btn_start_test');
      }

      if (testStateBadge) {
        if (!isRunning && dlSamples.length === 0) {
          testStateBadge.textContent = t('status_ready');
        } else if (isRunning) {
          testStateBadge.textContent = t('status_running');
        } else {
          testStateBadge.textContent = t('status_completed');
        }
      }

      if (timestampDisplay) {
        if (lastMeasuredTime) {
          timestampDisplay.textContent = `${t('measured_at')} ${lastMeasuredTime}`;
        } else {
          timestampDisplay.textContent = `${t('measured_at')} --:--:--`;
        }
      }

      if (copyBtnText) copyBtnText.textContent = t('btn_copy_link');
      if (copyTelemetryBtnText) copyTelemetryBtnText.textContent = t('copy');

      // Recompute quality score descriptions in active language
      updateQualityScores(lastDlVal, lastPingVal, lastJitterVal);
    }

    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', function () {
        applyLanguage(currentLang === 'id' ? 'en' : 'id');
      });
    }

    // -------------------------------------------------------------------------
    // Initial Client IP Pre-fetch
    // -------------------------------------------------------------------------
    function updateIpUI(ip) {
      if (!ip) return;
      const cleanIp = ip.split(' ')[0] || ip;
      if (clientIpVal) clientIpVal.textContent = cleanIp;
      if (metaClientIp) metaClientIp.textContent = cleanIp;
      if (topoClientIp) topoClientIp.textContent = cleanIp;
    }

    function fetchClientIp() {
      fetch('/getIP')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.processedString) {
            updateIpUI(data.processedString);
          }
        })
        .catch(() => {
          updateIpUI('172.16.x.x');
        });
    }
    fetchClientIp();

    // -------------------------------------------------------------------------
    // Test Tracking State
    // -------------------------------------------------------------------------
    let currentTest = null;
    let isRunning = false;

    let dlSamples = [];
    let ulSamples = [];
    let pingSamples = [];
    let lastValidPing = null;
    let lastValidJitter = null;
    let currentTestId = null;

    // Helper: update 5-star rating UI
    function renderStars(container, rating) {
      if (!container) return;
      let html = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          html += '<span class="star filled">&#9733;</span>';
        } else {
          html += '<span class="star">&#9733;</span>';
        }
      }
      container.innerHTML = html;
      container.setAttribute('aria-label', `${rating} of 5 stars`);
    }

    // Helper: dynamic calculation of Cloudflare AIM style Quality Scores
    function updateQualityScores(dl, ping, jitter) {
      lastDlVal = dl;
      lastPingVal = ping;
      lastJitterVal = jitter;

      if (dl === null || ping === null || jitter === null) {
        renderStars(starsStreaming, 5);
        if (badgeStreaming) {
          badgeStreaming.textContent = t('ready');
          badgeStreaming.className = 'quality-status-badge badge-green';
        }
        if (reasonStreaming) reasonStreaming.textContent = t('reason_streaming_init');

        renderStars(starsGaming, 5);
        if (badgeGaming) {
          badgeGaming.textContent = t('ready');
          badgeGaming.className = 'quality-status-badge badge-green';
        }
        if (reasonGaming) reasonGaming.textContent = t('reason_gaming_init');

        renderStars(starsVideo, 5);
        if (badgeVideo) {
          badgeVideo.textContent = t('ready');
          badgeVideo.className = 'quality-status-badge badge-green';
        }
        if (reasonVideo) reasonVideo.textContent = t('reason_video_init');
        return;
      }

      // 1. Streaming: Bandwidth-bound (video buffers ahead), not micro-jitter sensitive
      let sStars = 2;
      let sBadge = t('badge_poor');
      let sBadgeClass = 'badge-amber';
      let sReason = t('reason_streaming_2');

      if (dl >= 50 && jitter < 30) {
        sStars = 5;
        sBadge = t('badge_great');
        sBadgeClass = 'badge-green';
        sReason = t('reason_streaming_5');
      } else if (dl >= 25) {
        sStars = 4;
        sBadge = t('badge_good');
        sBadgeClass = 'badge-green';
        sReason = t('reason_streaming_4');
      } else if (dl >= 10) {
        sStars = 3;
        sBadge = t('badge_fair');
        sBadgeClass = 'badge-amber';
        sReason = t('reason_streaming_3');
      }
      renderStars(starsStreaming, sStars);
      if (badgeStreaming) {
        badgeStreaming.textContent = sBadge;
        badgeStreaming.className = 'quality-status-badge ' + sBadgeClass;
      }
      if (reasonStreaming) reasonStreaming.textContent = sReason;

      // 2. Gaming: Latency-bound (ping is king)
      let gStars = 2;
      let gBadge = t('badge_poor');
      let gBadgeClass = 'badge-amber';
      let gReason = t('reason_gaming_2');

      if (ping < 15 && jitter < 25) {
        gStars = 5;
        gBadge = t('badge_great');
        gBadgeClass = 'badge-green';
        gReason = t('reason_gaming_5');
      } else if (ping < 35 && jitter < 35) {
        gStars = 4;
        gBadge = t('badge_good');
        gBadgeClass = 'badge-green';
        gReason = t('reason_gaming_4');
      } else if (ping < 60) {
        gStars = 3;
        gBadge = t('badge_fair');
        gBadgeClass = 'badge-amber';
        gReason = t('reason_gaming_3');
      }
      renderStars(starsGaming, gStars);
      if (badgeGaming) {
        badgeGaming.textContent = gBadge;
        badgeGaming.className = 'quality-status-badge ' + gBadgeClass;
      }
      if (reasonGaming) reasonGaming.textContent = gReason;

      // 3. Video Calls: WebRTC / Zoom / Teams needs < 100ms ping and > 5 Mbps
      let vStars = 2;
      let vBadge = t('badge_poor');
      let vBadgeClass = 'badge-amber';
      let vReason = t('reason_video_2');

      if (ping < 30 && jitter < 25) {
        vStars = 5;
        vBadge = t('badge_great');
        vBadgeClass = 'badge-green';
        vReason = t('reason_video_5');
      } else if (ping < 60 && jitter < 40) {
        vStars = 4;
        vBadge = t('badge_good');
        vBadgeClass = 'badge-green';
        vReason = t('reason_video_4');
      } else if (ping < 100) {
        vStars = 3;
        vBadge = t('badge_fair');
        vBadgeClass = 'badge-amber';
        vReason = t('reason_video_3');
      }
      renderStars(starsVideo, vStars);
      if (badgeVideo) {
        badgeVideo.textContent = vBadge;
        badgeVideo.className = 'quality-status-badge ' + vBadgeClass;
      }
      if (reasonVideo) reasonVideo.textContent = vReason;
    }

    function resetUI() {
      if (testStateBadge) {
        testStateBadge.textContent = t('status_ready');
        testStateBadge.className = 'status-indicator-badge';
      }
      if (primaryHeroBtn) {
        primaryHeroBtn.disabled = false;
        primaryHeroBtnLabel.textContent = t('btn_start_test');
      }

      heroValDl.textContent = '--';
      heroValDlPeak.textContent = '--';
      heroValUl.textContent = '--';
      heroValUlPeak.textContent = '--';
      heroValPing.textContent = '--';
      heroValPingMin.textContent = '--';
      heroValJitter.textContent = '--';
      heroValBuffer.textContent = t('optimal');

      if (bValDlPeak) bValDlPeak.textContent = '--';
      if (bValDlAvg) bValDlAvg.textContent = '--';
      if (bValDlBytes) bValDlBytes.textContent = '--';

      if (bValUlPeak) bValUlPeak.textContent = '--';
      if (bValUlAvg) bValUlAvg.textContent = '--';
      if (bValUlBytes) bValUlBytes.textContent = '--';

      if (bValPingUnloaded) bValPingUnloaded.textContent = '--';
      if (bValLoadedBuffer) bValLoadedBuffer.textContent = '--';
      if (bValJitterStat) bValJitterStat.textContent = '--';

      if (telemetrySection) telemetrySection.hidden = true;
      if (shareUrlInput) shareUrlInput.value = '';
      if (telemetryIdDisplay) telemetryIdDisplay.textContent = '--';

      dlSamples = [];
      ulSamples = [];
      pingSamples = [];
      lastValidPing = null;
      lastValidJitter = null;
      currentTestId = null;
      lastMeasuredTime = null;

      updateQualityScores(null, null, null);

      if (dualChart) dualChart.clear();
    }

    function formatTime(date) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function showShareableTelemetry(resolvedId) {
      currentTestId = resolvedId;
      if (telemetryIdDisplay) telemetryIdDisplay.textContent = resolvedId;

      const host = location.host || 'speedtest.mriazh.my.id:8989';
      const proto = location.protocol || 'http:';
      const shareUrl = `${proto}//${host}/results/?id=${encodeURIComponent(resolvedId)}`;

      if (shareUrlInput) shareUrlInput.value = shareUrl;
      if (linkViewResultCard) linkViewResultCard.href = `/results/?id=${encodeURIComponent(resolvedId)}`;
      if (telemetrySection) telemetrySection.hidden = false;
    }

    // -------------------------------------------------------------------------
    // Speedtest Execution
    // -------------------------------------------------------------------------
    function startSpeedtest() {
      if (isRunning) return;
      isRunning = true;
      resetUI();

      if (testStateBadge) {
        testStateBadge.textContent = t('status_running');
        testStateBadge.className = 'status-indicator-badge status-testing';
      }
      if (primaryHeroBtn) {
        primaryHeroBtn.disabled = true;
        primaryHeroBtnLabel.textContent = t('btn_testing');
      }

      const s = new Speedtest();
      Object.entries(SPEEDTEST_PARAMS).forEach(([k, v]) => s.setParameter(k, v));
      currentTest = s;

      s.onupdate = function (data) {
        const st = data.testState;

        // Update Client IP if reported
        if (data.clientIp) {
          updateIpUI(data.clientIp);
        }

        // Cache testId if worker delivers it
        if (data.testId) {
          currentTestId = data.testId;
        }

        // Latency & Jitter Update (State 0, 2, or any state that carries valid numbers)
        const rawPing = parseFloat(data.pingStatus);
        const rawJitter = parseFloat(data.jitterStatus);

        if (!isNaN(rawPing) && rawPing > 0) {
          lastValidPing = rawPing;
          pingSamples.push(rawPing);
          heroValPing.textContent = rawPing.toFixed(1);
          const minPing = Math.min(...pingSamples);
          heroValPingMin.textContent = minPing.toFixed(1);
          if (bValPingUnloaded) bValPingUnloaded.textContent = minPing.toFixed(1);
          if (bValLoadedBuffer) {
            const bufferDiff = (rawPing - minPing).toFixed(1);
            bValLoadedBuffer.textContent = `${rawPing.toFixed(1)} (+${bufferDiff}ms)`;
          }
        } else if (lastValidPing !== null) {
          heroValPing.textContent = lastValidPing.toFixed(1);
        }

        if (!isNaN(rawJitter) && rawJitter >= 0) {
          lastValidJitter = rawJitter;
          heroValJitter.textContent = rawJitter.toFixed(1);
          if (bValJitterStat) bValJitterStat.textContent = rawJitter.toFixed(1);
          if (rawJitter < 3) {
            heroValBuffer.textContent = t('optimal_sub3');
          } else {
            heroValBuffer.textContent = t('stable');
          }
        } else if (lastValidJitter !== null) {
          heroValJitter.textContent = lastValidJitter.toFixed(1);
        }

        // State 1: Download phase
        if (st === 1) {
          if (testStateBadge) testStateBadge.textContent = t('status_download');
          const dl = parseFloat(data.dlStatus);
          if (!isNaN(dl) && dl > 0) {
            dlSamples.push(dl);
            heroValDl.textContent = dl.toFixed(1);
            if (dualChart) dualChart.pushDl(dl);

            const peakDl = Math.max(...dlSamples);
            const avgDl = dlSamples.reduce((a, b) => a + b, 0) / dlSamples.length;
            heroValDlPeak.textContent = peakDl.toFixed(1);

            if (bValDlPeak) bValDlPeak.textContent = peakDl.toFixed(1);
            if (bValDlAvg) bValDlAvg.textContent = avgDl.toFixed(1);
            if (bValDlBytes) {
              const approxMB = ((avgDl * dlSamples.length * 0.2) / 8).toFixed(1);
              bValDlBytes.textContent = approxMB;
            }
          }
        }
        // State 3: Upload phase
        else if (st === 3) {
          if (testStateBadge) testStateBadge.textContent = t('status_upload');
          const ul = parseFloat(data.ulStatus);
          if (!isNaN(ul) && ul > 0) {
            ulSamples.push(ul);
            heroValUl.textContent = ul.toFixed(1);
            if (dualChart) dualChart.pushUl(ul);

            const peakUl = Math.max(...ulSamples);
            const avgUl = ulSamples.reduce((a, b) => a + b, 0) / ulSamples.length;
            heroValUlPeak.textContent = peakUl.toFixed(1);

            if (bValUlPeak) bValUlPeak.textContent = peakUl.toFixed(1);
            if (bValUlAvg) bValUlAvg.textContent = avgUl.toFixed(1);
            if (bValUlBytes) {
              const approxMB = ((avgUl * ulSamples.length * 0.2) / 8).toFixed(1);
              bValUlBytes.textContent = approxMB;
            }
          }
        }
      };

      s.onend = function (aborted) {
        isRunning = false;
        currentTest = null;

        if (primaryHeroBtn) {
          primaryHeroBtn.disabled = false;
          primaryHeroBtnLabel.textContent = t('btn_start_test');
        }

        if (aborted) {
          resetUI();
          return;
        }

        if (testStateBadge) {
          testStateBadge.textContent = t('status_completed');
          testStateBadge.className = 'status-indicator-badge status-done';
        }

        lastMeasuredTime = formatTime(new Date());
        if (timestampDisplay) {
          timestampDisplay.textContent = `${t('measured_at')} ${lastMeasuredTime}`;
        }

        // Preserve Latency & Jitter values on screen
        if (lastValidPing !== null) {
          heroValPing.textContent = lastValidPing.toFixed(1);
          if (bValPingUnloaded) bValPingUnloaded.textContent = lastValidPing.toFixed(1);
        }
        if (lastValidJitter !== null) {
          heroValJitter.textContent = lastValidJitter.toFixed(1);
          if (bValJitterStat) bValJitterStat.textContent = lastValidJitter.toFixed(1);
        }

        // Finalize Quality Scores
        const finalDl = dlSamples.length ? Math.max(...dlSamples) : 0;
        const finalPing = lastValidPing !== null ? lastValidPing : 1.0;
        const finalJitter = lastValidJitter !== null ? lastValidJitter : 0.2;
        updateQualityScores(finalDl, finalPing, finalJitter);

        // Shareable Telemetry: capture ID or poll
        const resolvedId = currentTestId || (s.worker && s.worker.testId) || null;
        if (resolvedId) {
          showShareableTelemetry(resolvedId);
        } else {
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            if (currentTestId) {
              clearInterval(poll);
              showShareableTelemetry(currentTestId);
            } else if (attempts > 8) {
              clearInterval(poll);
              showShareableTelemetry('local-lan');
            }
          }, 300);
        }
      };

      try {
        s.start();
      } catch (err) {
        console.error('Speedtest start failed:', err);
        isRunning = false;
        resetUI();
      }
    }

    // -------------------------------------------------------------------------
    // Event Handlers
    // -------------------------------------------------------------------------
    if (primaryHeroBtn) {
      primaryHeroBtn.addEventListener('click', startSpeedtest);
    }
    if (restartTestBtn) {
      restartTestBtn.addEventListener('click', startSpeedtest);
    }

    // Copy Share Link Helper
    async function copyToClipboard(text, btnElement, labelElement) {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const originalText = labelElement.textContent;
        labelElement.textContent = t('copied');
        setTimeout(() => {
          labelElement.textContent = originalText;
        }, 1800);
      } catch (_) {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        const originalText = labelElement.textContent;
        labelElement.textContent = t('copied');
        setTimeout(() => {
          labelElement.textContent = originalText;
        }, 1800);
      }
    }

    if (copyShareLinkBtn) {
      copyShareLinkBtn.addEventListener('click', function () {
        const url = (shareUrlInput && shareUrlInput.value) || `${location.origin}/results/?id=${currentTestId || 'local-lan'}`;
        copyToClipboard(url, copyShareLinkBtn, copyBtnText);
      });
    }

    if (btnCopyShareTelemetry && shareUrlInput) {
      btnCopyShareTelemetry.addEventListener('click', function () {
        copyToClipboard(shareUrlInput.value, btnCopyShareTelemetry, copyTelemetryBtnText);
      });
    }

    // Apply language on initial load
    applyLanguage(currentLang);
  });
})();
