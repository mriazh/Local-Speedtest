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
      brand_desc: 'LAN speedtest',
      server_pill: 'Local Server • 100% Local LAN',
      badge_client_ip: 'CLIENT IP',
      your_network_speed: 'Your Network Speed',
      btn_start_test: 'Start Test',
      btn_testing: 'Testing...',
      btn_restart_test: 'Restart Test',
      btn_copy_link: 'Copy Share Link',
      btn_download_card_png: 'Download Card',
      btn_share_whatsapp: 'Share to WhatsApp',
      btn_test_your_speed: 'Test Your Speed',
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
      node_client: 'You',
      node_switch: 'Core Switch',
      node_server: 'Server',
      meta_connected_ipv4: 'Connected via IPv4',
      meta_server_location: 'Server location',
      val_server_location: 'Local Server',
      meta_network: 'Network',
      val_network: 'Local LAN Gigabit (Zero Internet Quota)',
      meta_latency_quality: 'Latency Quality',
      val_latency_quality: 'LAN Sub-millisecond',
      section_quality_score: 'Network Quality Score',
      section_quality_subtitle: 'Real-time Cloudflare AIM quality assessment for LAN workloads',
      quality_streaming: 'Streaming',
      desc_streaming: '4K/8K Media & Live Buffers',
      quality_remote: 'Remote Desktop',
      desc_remote: 'RDP, VDI & Screen Sharing',
      quality_video: 'Video Calls',
      desc_video: 'Real-time WebRTC & Audio',
      quality_filetransfer: 'File Transfer',
      desc_filetransfer: 'Gigabit NAS & Data Sync',
      quality_cloud: 'Cloud & Office',
      desc_cloud: 'SaaS & Intranet Portals',
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
      reason_remote_init: 'Requires Ping < 20ms, Jitter < 15ms',
      reason_remote_5: 'Ultra-responsive remote desktop (< 20ms)',
      reason_remote_4: 'Smooth remote desktop control',
      reason_remote_3: 'Acceptable remote session with minor lag',
      reason_remote_2: 'Noticeable remote lag or input delay',
      reason_video_init: 'Requires Ping < 20ms, Jitter < 5ms',
      reason_video_5: 'Crystal clear HD video & audio',
      reason_video_4: 'Smooth video calls with minor delay',
      reason_video_3: 'Occasional talk-over or delay',
      reason_video_2: 'Noticeable lag or packet stutter',
      reason_filetransfer_init: 'Requires DL >= 100 Mbps, UL >= 80 Mbps',
      reason_filetransfer_5: 'High-speed LAN file transfer',
      reason_filetransfer_4: 'Fast large-file sync',
      reason_filetransfer_3: 'Usable for smaller files',
      reason_filetransfer_2: 'Slow transfer or imbalance',
      reason_cloud_init: 'Requires Ping < 40ms, DL >= 25 Mbps',
      reason_cloud_5: 'Instant response & cloud sync',
      reason_cloud_4: 'Responsive SaaS & intranet use',
      reason_cloud_3: 'Minor cloud-app delay',
      reason_cloud_2: 'Sluggish cloud response',
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
      tested_at: 'Tested at',
      persisted_sqlite: 'Persisted in local SQLite database',
      copy: 'Copy',
      copied: 'Copied!',
      open_result_card: 'Open Result Card',
      network_details: 'Network Details',
      server_ip: 'Server IP',
      result_certificate: 'Speedtest Result',
      footer_copy: '© 2026 M Riyadh Azhar • Local Speedtest • 100% Offline LAN'
    },
    id: {
      brand_desc: 'Uji Kecepatan LAN',
      server_pill: 'Server Lokal • 100% LAN Lokal',
      badge_client_ip: 'IP KLIEN',
      your_network_speed: 'Kecepatan Jaringan Anda',
      btn_start_test: 'MULAI UJI KECEPATAN',
      btn_testing: 'Menguji...',
      btn_restart_test: 'Uji Ulang',
      btn_copy_link: 'Salin Tautan',
      btn_download_card_png: 'Unduh Kartu',
      btn_share_whatsapp: 'Bagikan ke WhatsApp',
      btn_test_your_speed: 'Uji Kecepatan Anda',
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
      node_client: 'Anda',
      node_switch: 'Switch Inti',
      node_server: 'Server',
      meta_connected_ipv4: 'Terhubung melalui IPv4',
      meta_server_location: 'Lokasi Server',
      val_server_location: 'Server Lokal',
      meta_network: 'Jaringan',
      val_network: 'LAN Gigabit Lokal (Tanpa Kuota Internet)',
      meta_latency_quality: 'Kualitas Latensi',
      val_latency_quality: 'LAN Sub-milidetik',
      section_quality_score: 'Skor Kualitas Jaringan',
      section_quality_subtitle: 'Penilaian kualitas Cloudflare AIM waktu nyata untuk beban kerja LAN',
      quality_streaming: 'Streaming Video',
      desc_streaming: 'Media 4K/8K & Buffer Siaran Langsung',
      quality_remote: 'Desktop Jarak Jauh',
      desc_remote: 'Akses RDP, VDI & Layar Virtual',
      quality_video: 'Panggilan Video',
      desc_video: 'WebRTC & Audio Waktu Nyata',
      quality_filetransfer: 'Transfer File',
      desc_filetransfer: 'NAS Gigabit & Sinkronisasi',
      quality_cloud: 'Aplikasi Kantor & Cloud',
      desc_cloud: 'Portal Intranet & SaaS',
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
      reason_remote_init: 'Membutuhkan Ping < 20ms, Jitter < 15ms',
      reason_remote_5: 'Respons desktop jarak jauh sangat cepat (< 20ms)',
      reason_remote_4: 'Kontrol desktop jarak jauh lancar',
      reason_remote_3: 'Sesi remote dapat diterima dengan sedikit jeda',
      reason_remote_2: 'Jeda terasa atau input tertunda',
      reason_video_init: 'Membutuhkan Ping < 20ms, Jitter < 5ms',
      reason_video_5: 'Video & audio HD sangat jernih',
      reason_video_4: 'Panggilan video lancar dengan jeda minim',
      reason_video_3: 'Terkadang terjadi tabrakan suara atau jeda',
      reason_video_2: 'Lag terasa atau stutter paket',
      reason_filetransfer_init: 'Membutuhkan DL >= 100 Mbps, UL >= 80 Mbps',
      reason_filetransfer_5: 'Transfer file LAN kecepatan tinggi',
      reason_filetransfer_4: 'Sinkronisasi file besar cepat',
      reason_filetransfer_3: 'Dapat digunakan untuk file kecil',
      reason_filetransfer_2: 'Transfer lambat atau tidak seimbang',
      reason_cloud_init: 'Membutuhkan Ping < 40ms, DL >= 25 Mbps',
      reason_cloud_5: 'Respons instan & sinkronisasi cloud',
      reason_cloud_4: 'Penggunaan SaaS & intranet responsif',
      reason_cloud_3: 'Keterlambatan aplikasi cloud kecil',
      reason_cloud_2: 'Respons cloud lambat',
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
      tested_at: 'Diuji pada',
      persisted_sqlite: 'Tersimpan di basis data SQLite lokal',
      copy: 'Salin',
      copied: 'Tersalin!',
      open_result_card: 'Buka Kartu Hasil',
      network_details: 'Detail Jaringan',
      server_ip: 'IP Server',
      result_certificate: 'Hasil Speedtest',
      footer_copy: '© 2026 M Riyadh Azhar • Speedtest Lokal • 100% LAN Offline'
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

      const computePoints = (data) => {
        if (!data || data.length === 0) return [];
        return data.map((v, i) => {
          const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
          const y = h - padBot - ((v - minVal) / range) * drawH;
          return { x, y };
        });
      };

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

      if (this.dlData.length > 1) {
        const dlPts = computePoints(this.dlData);

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

        drawSplinePath(dlPts);
        ctx.strokeStyle = '#f6821f';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isLight ? 'rgba(246, 130, 31, 0.3)' : 'rgba(246, 130, 31, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

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

      if (this.ulData.length > 1) {
        const ulPts = computePoints(this.ulData);

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

        drawSplinePath(ulPts);
        ctx.strokeStyle = '#8a63d2';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isLight ? 'rgba(138, 99, 210, 0.3)' : 'rgba(138, 99, 210, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
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
  // Shared: Theme & i18n (runs on both index and results pages)
  // ---------------------------------------------------------------------------
  let currentLang;
  let isRunning = false;
  let currentTest = null;
  let dlSamples = [];
  let ulSamples = [];
  let pingSamples = [];
  let lastValidPing = null;
  let lastValidJitter = null;
  let currentTestId = null;
  let lastMeasuredTime = null;
  let lastDlVal = null;
  let lastPingVal = null;
  let lastJitterVal = null;
  let lastUlVal = null;
  let updateQualityScores;

  // Helper: render 5-star rating into a container by id
  function renderStarsById(containerId, rating) {
    const container = document.getElementById(containerId);
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

  // Helper: dynamic calculation of Cloudflare AIM style Quality Scores.
  // Works on both index and results pages by looking up elements by id.
  updateQualityScores = function (dl, ping, jitter, ul) {
    lastDlVal = dl;
    lastPingVal = ping;
    lastJitterVal = jitter;
    lastUlVal = ul;

    if (dl === null || ping === null || jitter === null) {
      renderStarsById('starsStreaming', 5);
      const b = document.getElementById('badgeStreaming');
      if (b) { b.textContent = t('ready'); b.className = 'quality-status-badge badge-green'; }
      const r = document.getElementById('reasonStreaming');
      if (r) r.textContent = t('reason_streaming_init');

      renderStarsById('starsRemote', 5);
      const b2 = document.getElementById('badgeRemote');
      if (b2) { b2.textContent = t('ready'); b2.className = 'quality-status-badge badge-green'; }
      const r2 = document.getElementById('reasonRemote');
      if (r2) r2.textContent = t('reason_remote_init');

      renderStarsById('starsVideo', 5);
      const b3 = document.getElementById('badgeVideo');
      if (b3) { b3.textContent = t('ready'); b3.className = 'quality-status-badge badge-green'; }
      const r3 = document.getElementById('reasonVideo');
      if (r3) r3.textContent = t('reason_video_init');

      renderStarsById('starsFileTransfer', 5);
      const b4 = document.getElementById('badgeFileTransfer');
      if (b4) { b4.textContent = t('ready'); b4.className = 'quality-status-badge badge-green'; }
      const r4 = document.getElementById('reasonFileTransfer');
      if (r4) r4.textContent = t('reason_filetransfer_init');

      renderStarsById('starsCloud', 5);
      const b5 = document.getElementById('badgeCloud');
      if (b5) { b5.textContent = t('ready'); b5.className = 'quality-status-badge badge-green'; }
      const r5 = document.getElementById('reasonCloud');
      if (r5) r5.textContent = t('reason_cloud_init');
      return;
    }

    // 1. Streaming: DL >= 50 Mbps & Jitter < 30ms -> 5 stars
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
    renderStarsById('starsStreaming', sStars);
    const bs = document.getElementById('badgeStreaming');
    if (bs) { bs.textContent = sBadge; bs.className = 'quality-status-badge ' + sBadgeClass; }
    const rs = document.getElementById('reasonStreaming');
    if (rs) rs.textContent = sReason;

    // 2. Remote Desktop: Ping < 20ms & Jitter < 15ms -> 5 stars
    let aStars = 2;
    let aBadge = t('badge_poor');
    let aBadgeClass = 'badge-amber';
    let aReason = t('reason_remote_2');

    if (ping < 20 && jitter < 15) {
      aStars = 5;
      aBadge = t('badge_great');
      aBadgeClass = 'badge-green';
      aReason = t('reason_remote_5');
    } else if (ping < 40 && jitter < 30) {
      aStars = 4;
      aBadge = t('badge_good');
      aBadgeClass = 'badge-green';
      aReason = t('reason_remote_4');
    } else if (ping < 80) {
      aStars = 3;
      aBadge = t('badge_fair');
      aBadgeClass = 'badge-amber';
      aReason = t('reason_remote_3');
    }
    renderStarsById('starsRemote', aStars);
    const ba = document.getElementById('badgeRemote');
    if (ba) { ba.textContent = aBadge; ba.className = 'quality-status-badge ' + aBadgeClass; }
    const ra = document.getElementById('reasonRemote');
    if (ra) ra.textContent = aReason;

    // 3. Video Calls: Ping < 30ms & Jitter < 25ms -> 5 stars
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
    renderStarsById('starsVideo', vStars);
    const bv = document.getElementById('badgeVideo');
    if (bv) { bv.textContent = vBadge; bv.className = 'quality-status-badge ' + vBadgeClass; }
    const rv = document.getElementById('reasonVideo');
    if (rv) rv.textContent = vReason;

    // 4. File Transfer: DL >= 100 Mbps & UL >= 80 Mbps -> 5 stars
    let fStars = 2;
    let fBadge = t('badge_poor');
    let fBadgeClass = 'badge-amber';
    let fReason = t('reason_filetransfer_2');

    if (dl >= 100 && ul >= 80) {
      fStars = 5;
      fBadge = t('badge_great');
      fBadgeClass = 'badge-green';
      fReason = t('reason_filetransfer_5');
    } else if (dl >= 50 && ul >= 40) {
      fStars = 4;
      fBadge = t('badge_good');
      fBadgeClass = 'badge-green';
      fReason = t('reason_filetransfer_4');
    } else if (dl >= 20) {
      fStars = 3;
      fBadge = t('badge_fair');
      fBadgeClass = 'badge-amber';
      fReason = t('reason_filetransfer_3');
    }
    renderStarsById('starsFileTransfer', fStars);
    const bf = document.getElementById('badgeFileTransfer');
    if (bf) { bf.textContent = fBadge; bf.className = 'quality-status-badge ' + fBadgeClass; }
    const rf = document.getElementById('reasonFileTransfer');
    if (rf) rf.textContent = fReason;

    // 5. Cloud & Office: Ping < 40ms & DL >= 25 Mbps -> 5 stars
    let cStars = 2;
    let cBadge = t('badge_poor');
    let cBadgeClass = 'badge-amber';
    let cReason = t('reason_cloud_2');

    if (ping < 40 && dl >= 25) {
      cStars = 5;
      cBadge = t('badge_great');
      cBadgeClass = 'badge-green';
      cReason = t('reason_cloud_5');
    } else if (ping < 80 && dl >= 10) {
      cStars = 4;
      cBadge = t('badge_good');
      cBadgeClass = 'badge-green';
      cReason = t('reason_cloud_4');
    } else if (dl >= 5) {
      cStars = 3;
      cBadge = t('badge_fair');
      cBadgeClass = 'badge-amber';
      cReason = t('reason_cloud_3');
    }
    renderStarsById('starsCloud', cStars);
    const bc = document.getElementById('badgeCloud');
    if (bc) { bc.textContent = cBadge; bc.className = 'quality-status-badge ' + cBadgeClass; }
    const rc = document.getElementById('reasonCloud');
    if (rc) rc.textContent = cReason;
  };

  function t(key) {
    const dict = I18N[currentLang] || I18N.en;
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  }

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
  }

  function getInitialLang() {
    try {
      const stored = localStorage.getItem('cf_lang');
      if (stored === 'id' || stored === 'en') return stored;
    } catch (_) {}
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return navLang.startsWith('id') ? 'id' : 'en';
  }

  function applyLanguage(lang) {
    currentLang = lang === 'id' ? 'id' : 'en';
    document.documentElement.setAttribute('lang', currentLang);
    try {
      localStorage.setItem('cf_lang', currentLang);
    } catch (_) {}

    const langOptId = document.getElementById('langOptId');
    const langOptEn = document.getElementById('langOptEn');
    if (langOptId && langOptEn) {
      if (currentLang === 'id') {
        langOptId.classList.add('active');
        langOptEn.classList.remove('active');
      } else {
        langOptEn.classList.add('active');
        langOptId.classList.remove('active');
      }
    }

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

    const primaryHeroBtnLabel = document.getElementById('primaryHeroBtnLabel');
    if (primaryHeroBtnLabel) {
      primaryHeroBtnLabel.textContent = isRunning ? t('btn_testing') : t('btn_start_test');
    }

    const testStateBadge = document.getElementById('testStateBadge');
    if (testStateBadge) {
      if (!isRunning && dlSamples.length === 0) {
        testStateBadge.textContent = t('status_ready');
      } else if (isRunning) {
        testStateBadge.textContent = t('status_running');
      } else {
        testStateBadge.textContent = t('status_completed');
      }
    }

    const timestampDisplay = document.getElementById('timestampDisplay');
    if (timestampDisplay) {
      if (lastMeasuredTime) {
        timestampDisplay.textContent = `${t('measured_at')} ${lastMeasuredTime}`;
      } else {
        timestampDisplay.textContent = `${t('measured_at')} --:--:--`;
      }
    }

    const copyBtnText = document.getElementById('copyBtnText');
    if (copyBtnText) copyBtnText.textContent = t('btn_copy_link');
    const copyTelemetryBtnText = document.getElementById('copyTelemetryBtnText');
    if (copyTelemetryBtnText) copyTelemetryBtnText.textContent = t('copy');

    const copyResultBtnText = document.getElementById('copyResultBtnText');
    if (copyResultBtnText) copyResultBtnText.textContent = t('btn_copy_link');

    updateQualityScores(lastDlVal, lastPingVal, lastJitterVal, lastUlVal);
  }

  // ---------------------------------------------------------------------------
  // Results Page Handler (web/results.html)
  // ---------------------------------------------------------------------------
  async function initResultsPageView() {
    const statusEl = document.getElementById('resultStatus');
    const statusText = document.getElementById('resultStatusText');
    const headlineSection = document.getElementById('headlineSection');
    const qualitySection = document.getElementById('qualitySection');
    const detailsSection = document.getElementById('detailsSection');
    const identitySection = document.getElementById('identitySection');
    const actionsSection = document.getElementById('actionsSection');

    const resDl = document.getElementById('resDl');
    const resUl = document.getElementById('resUl');
    const resPing = document.getElementById('resPing');
    const resJitter = document.getElementById('resJitter');
    const resClientIp = document.getElementById('resClientIp');
    const resServerIp = document.getElementById('resServerIp');
    const resTestId = document.getElementById('resTestId');
    const resTestedAt = document.getElementById('resTestedAt');

    const starsStreaming = document.getElementById('starsStreaming');
    const badgeStreaming = document.getElementById('badgeStreaming');
    const reasonStreaming = document.getElementById('reasonStreaming');
    const starsRemote = document.getElementById('starsRemote');
    const badgeRemote = document.getElementById('badgeRemote');
    const reasonRemote = document.getElementById('reasonRemote');
    const starsVideo = document.getElementById('starsVideo');
    const badgeVideo = document.getElementById('badgeVideo');
    const reasonVideo = document.getElementById('reasonVideo');
    const starsFileTransfer = document.getElementById('starsFileTransfer');
    const badgeFileTransfer = document.getElementById('badgeFileTransfer');
    const reasonFileTransfer = document.getElementById('reasonFileTransfer');
    const starsCloud = document.getElementById('starsCloud');
    const badgeCloud = document.getElementById('badgeCloud');
    const reasonCloud = document.getElementById('reasonCloud');

    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      if (statusEl) statusEl.hidden = false;
      if (statusText) statusText.textContent = 'No result ID provided. Example: /results.html?id=<id>';
      return;
    }

    try {
      const res = await fetch('/results/json?id=' + encodeURIComponent(id) + '&n=' + Date.now(), {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Result not found');
      const data = await res.json();

      const dl = parseFloat(data.download) || 0;
      const ul = parseFloat(data.upload) || 0;
      const ping = parseFloat(data.ping) || 0;
      const jitter = parseFloat(data.jitter) || 0;

      // Cache for language re-render
      lastDlVal = dl;
      lastPingVal = ping;
      lastJitterVal = jitter;

      if (resDl) resDl.textContent = dl.toFixed(1);
      if (resUl) resUl.textContent = ul.toFixed(1);
      if (resPing) resPing.textContent = ping.toFixed(1);
      if (resJitter) resJitter.textContent = jitter.toFixed(1);

      // Extract client IP: prefer URL param, then data, then fallback to /getIP
      let clientIp = params.get('ip') || data.clientIp || '';
      if (!clientIp && data.ispinfo) {
        if (typeof data.ispinfo === 'object' && data.ispinfo.processedString) {
          clientIp = String(data.ispinfo.processedString).split(' - ')[0].trim();
        } else if (typeof data.ispinfo === 'string' && /^\d+\.\d+\.\d+\.\d+/.test(data.ispinfo)) {
          clientIp = data.ispinfo.split(' ')[0].trim();
        }
      }
      if (!clientIp) {
        try {
          const r = await fetch('/getIP');
          const ipData = await r.json();
          if (ipData && ipData.processedString) {
            clientIp = ipData.processedString.split(' ')[0].trim();
          }
        } catch (_) {}
      }
      if (resClientIp) resClientIp.textContent = clientIp || '--';
      if (resServerIp) resServerIp.textContent = data.serverIp || location.hostname;

      if (resTestId) resTestId.textContent = id;
      if (resTestedAt) resTestedAt.textContent = data.timestamp || '--';

      // Render quality stars in current language
      updateQualityScores(dl, ping, jitter, ul);

      if (statusEl) statusEl.hidden = true;
      if (headlineSection) headlineSection.hidden = false;
      if (qualitySection) qualitySection.hidden = false;
      if (detailsSection) detailsSection.hidden = false;
      if (identitySection) identitySection.hidden = false;
      if (actionsSection) actionsSection.hidden = false;

      // Wire action buttons
      const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');
      const btnCopyResultLink = document.getElementById('btnCopyResultLink');
      const copyResultBtnText = document.getElementById('copyResultBtnText');

      const host = location.host || 'speedtest.mriazh.my.id';
      const proto = location.protocol || 'http:';
      const resultUrl = `${proto}//${host}/results.html?id=${encodeURIComponent(id)}`;

      if (btnCopyResultLink && copyResultBtnText) {
        btnCopyResultLink.addEventListener('click', function () {
          copyToClipboard(resultUrl, btnCopyResultLink, copyResultBtnText);
        });
      }

      if (btnShareWhatsapp) {
        const dlS = dl.toFixed(1);
        const ulS = ul.toFixed(1);
        const pingS = ping.toFixed(1);
        const jitterS = jitter.toFixed(1);
        const msgKey = t('whatsapp_msg');
        let msg = msgKey
          .replace('{dl}', dlS)
          .replace('{ul}', ulS)
          .replace('{ping}', pingS)
          .replace('{jitter}', jitterS)
          .replace('{id}', id);
        btnShareWhatsapp.addEventListener('click', function () {
          const waUrl = 'https://wa.me/?text=' + encodeURIComponent(msg);
          try {
            window.open(waUrl, '_blank');
          } catch (_) {
            location.href = waUrl;
          }
        });
      }
    } catch (err) {
      if (statusEl) statusEl.hidden = false;
      if (statusText) statusText.textContent = 'Could not load result: ' + err.message;
    }
  }

  // ---------------------------------------------------------------------------
  // PNG Export: HD canvas result certificate drawn entirely in-browser
  // ---------------------------------------------------------------------------
  function exportResultCardPng(opts) {
    const dpr = window.devicePixelRatio || 1;
    const w = 800;
    const h = 960;
    const canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = isLight ? '#f8fafc' : '#0b0c0e';
    const surface = isLight ? '#ffffff' : '#121316';
    const border = isLight ? '#e2e8f0' : '#22242c';
    const textPrimary = isLight ? '#0f172a' : '#f4f4f6';
    const textMuted = isLight ? '#64748b' : '#656976';
    const accent = '#f6821f';

    const dlS = (opts.dl || 0).toFixed(1);
    const ulS = (opts.ul || 0).toFixed(1);
    const pingS = (opts.ping || 0).toFixed(1);
    const jitterS = (opts.jitter || 0).toFixed(1);

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Card surface
    const pad = 40;
    const cardX = pad;
    const cardY = 40;
    const cardW = w - pad * 2;
    const cardH = h - cardY - 40;
    ctx.fillStyle = surface;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Brand
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 20px ' + getFontStack();
    ctx.fillText(t('result_certificate'), cardX, cardY + 34);
    ctx.fillStyle = textMuted;
    ctx.font = '13px ' + getFontStack();
    ctx.fillText(t('brand_desc').replace('&bull;', '•'), cardX, cardY + 56);

    // Divider
    ctx.strokeStyle = border;
    ctx.beginPath();
    ctx.moveTo(cardX, cardY + 74);
    ctx.lineTo(cardX + cardW, cardY + 74);
    ctx.stroke();

    // Headline metrics
    const metrics = [
      { label: t('label_download'), value: dlS, unit: 'Mbps', color: '#f6821f' },
      { label: t('label_upload'), value: ulS, unit: 'Mbps', color: '#8a63d2' },
      { label: t('label_latency'), value: pingS, unit: 'ms', color: '#00a4e4' },
      { label: t('label_jitter'), value: jitterS, unit: 'ms', color: '#f59e0b' }
    ];
    const mStartY = cardY + 100;
    const mRowH = 70;
    const mColW = (cardW - 24) / 2;
    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = cardX + 12 + col * (mColW + 24);
      const y = mStartY + row * mRowH;
      ctx.fillStyle = textMuted;
      ctx.font = '11px ' + getFontStack();
      ctx.fillText(m.label.toUpperCase(), x, y + 16);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 26px ' + getFontStack();
      ctx.fillText(m.value, x, y + 48);
      ctx.fillStyle = textMuted;
      ctx.font = '12px ' + getFontStack();
      ctx.fillText(m.unit, x + ctx.measureText(m.value).width + 6, y + 46);
    }

    // Quality score
    const qStartY = mStartY + 2 * mRowH + 30;
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 17px ' + getFontStack();
    ctx.fillText(t('section_quality_score'), cardX, qStartY);
    ctx.fillStyle = textMuted;
    ctx.font = '12px ' + getFontStack();
    ctx.fillText(t('section_quality_subtitle'), cardX, qStartY + 18);

    const quality = [
      { key: 'quality_streaming', stars: qualityStars(dl, ping, jitter, ul, 'streaming') },
      { key: 'quality_remote', stars: qualityStars(dl, ping, jitter, ul, 'remote') },
      { key: 'quality_video', stars: qualityStars(dl, ping, jitter, ul, 'video') },
      { key: 'quality_filetransfer', stars: qualityStars(dl, ping, jitter, ul, 'filetransfer') },
      { key: 'quality_cloud', stars: qualityStars(dl, ping, jitter, ul, 'cloud') }
    ];
    const qy = qStartY + 42;
    const qColW = (cardW - 24) / 5;
    for (let i = 0; i < quality.length; i++) {
      const q = quality[i];
      const x = cardX + 12 + i * qColW;
      ctx.fillStyle = textPrimary;
      ctx.font = '12px ' + getFontStack();
      ctx.fillText(t(q.key), x, qy);
      let starHtml = '';
      for (let s = 1; s <= 5; s++) {
        starHtml += s <= q.stars ? '★' : '☆';
      }
      ctx.fillStyle = '#fbbf24';
      ctx.font = '16px ' + getFontStack();
      ctx.fillText(starHtml, x, qy + 22);
    }

    // Network details
    const dStartY = qy + 60;
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 17px ' + getFontStack();
    ctx.fillText(t('network_details'), cardX, dStartY);
    const details = [
      { label: t('badge_client_ip'), value: opts.clientIp || '--' },
      { label: t('server_ip'), value: location.hostname },
      { label: 'Gigabit LAN', value: t('val_network') }
    ];
    let dy = dStartY + 24;
    for (const d of details) {
      ctx.fillStyle = textMuted;
      ctx.font = '12px ' + getFontStack();
      ctx.fillText(d.label, cardX, dy);
      ctx.fillStyle = textPrimary;
      ctx.font = '12px ' + getFontStack();
      ctx.fillText(d.value, cardX + 150, dy);
      dy += 22;
    }

    // Test identity
    const idStartY = dy + 18;
    ctx.fillStyle = textMuted;
    ctx.font = '12px ' + getFontStack();
    ctx.fillText(t('test_id_label'), cardX, idStartY);
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 13px ' + getFontStack();
    ctx.fillText(opts.id, cardX + 70, idStartY);
    ctx.fillStyle = textMuted;
    ctx.font = '12px ' + getFontStack();
    ctx.fillText(t('tested_at'), cardX + 210, idStartY);
    ctx.fillStyle = textPrimary;
    ctx.font = '13px ' + getFontStack();
    ctx.fillText(opts.timestamp || '--', cardX + 270, idStartY);

    // Footer
    ctx.fillStyle = textMuted;
    ctx.font = '11px ' + getFontStack();
    ctx.fillText(t('footer_copy'), cardX, h - 26);

    // Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'speedtest-result-' + opts.id + '.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getFontStack() {
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  }

  function qualityStars(dl, ping, jitter, ul, type) {
    if (type === 'streaming') {
      if (dl >= 50 && jitter < 30) return 5;
      if (dl >= 25) return 4;
      if (dl >= 10) return 3;
      return 2;
    }
    if (type === 'remote') {
      if (ping < 20 && jitter < 15) return 5;
      if (ping < 40 && jitter < 30) return 4;
      if (ping < 80) return 3;
      return 2;
    }
    if (type === 'video') {
      if (ping < 30 && jitter < 25) return 5;
      if (ping < 60 && jitter < 40) return 4;
      if (ping < 100) return 3;
      return 2;
    }
    if (type === 'filetransfer') {
      if (dl >= 100 && ul >= 80) return 5;
      if (dl >= 50 && ul >= 40) return 4;
      if (dl >= 20) return 3;
      return 2;
    }
    if (type === 'cloud') {
      if (ping < 40 && dl >= 25) return 5;
      if (ping < 80 && dl >= 10) return 4;
      if (dl >= 5) return 3;
      return 2;
    }
    return 2;
  }

  // ---------------------------------------------------------------------------
  // Clipboard helper (shared)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Document Ready
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    // Shared theme
    applyTheme(getInitialTheme());
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        const isCurrentLight = document.documentElement.getAttribute('data-theme') === 'light';
        applyTheme(isCurrentLight ? 'dark' : 'light');
        if (typeof dualChart !== 'undefined' && dualChart) dualChart.draw();
      });
    }

    // Shared language
    currentLang = getInitialLang();
    applyLanguage(currentLang);
    const langToggleBtn = document.getElementById('langToggleBtn');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', function () {
        applyLanguage(currentLang === 'id' ? 'en' : 'id');
      });
    }

    // Results page branch
    if (isResultsPage) {
      initResultsPageView();
      return;
    }

    // ---------------------------------------------------------------------------
    // Main Index Page Logic (Cloudflare Speed Style)
    // ---------------------------------------------------------------------------
    // Header & Control Elements
    const clientIpVal = document.getElementById('clientIpVal');
    const metaClientIp = document.getElementById('metaClientIp');
    const topoClientIp = document.getElementById('topoClientIp');
    const langOptId = document.getElementById('langOptId');
    const langOptEn = document.getElementById('langOptEn');

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

    const starsRemote = document.getElementById('starsRemote');
    const badgeRemote = document.getElementById('badgeRemote');
    const reasonRemote = document.getElementById('reasonRemote');

    const starsVideo = document.getElementById('starsVideo');
    const badgeVideo = document.getElementById('badgeVideo');
    const reasonVideo = document.getElementById('reasonVideo');

    const starsFileTransfer = document.getElementById('starsFileTransfer');
    const badgeFileTransfer = document.getElementById('badgeFileTransfer');
    const reasonFileTransfer = document.getElementById('reasonFileTransfer');

    const starsCloud = document.getElementById('starsCloud');
    const badgeCloud = document.getElementById('badgeCloud');
    const reasonCloud = document.getElementById('reasonCloud');

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
    updateQualityScores = function (dl, ping, jitter, ul) {
      lastDlVal = dl;
      lastPingVal = ping;
      lastJitterVal = jitter;
      lastUlVal = ul;

      if (dl === null || ping === null || jitter === null) {
        renderStars(starsStreaming, 5);
        if (badgeStreaming) {
          badgeStreaming.textContent = t('ready');
          badgeStreaming.className = 'quality-status-badge badge-green';
        }
        if (reasonStreaming) reasonStreaming.textContent = t('reason_streaming_init');

        renderStars(starsRemote, 5);
        if (badgeRemote) {
          badgeRemote.textContent = t('ready');
          badgeRemote.className = 'quality-status-badge badge-green';
        }
        if (reasonRemote) reasonRemote.textContent = t('reason_remote_init');

        renderStars(starsVideo, 5);
        if (badgeVideo) {
          badgeVideo.textContent = t('ready');
          badgeVideo.className = 'quality-status-badge badge-green';
        }
        if (reasonVideo) reasonVideo.textContent = t('reason_video_init');

        renderStars(starsFileTransfer, 5);
        if (badgeFileTransfer) {
          badgeFileTransfer.textContent = t('ready');
          badgeFileTransfer.className = 'quality-status-badge badge-green';
        }
        if (reasonFileTransfer) reasonFileTransfer.textContent = t('reason_filetransfer_init');

        renderStars(starsCloud, 5);
        if (badgeCloud) {
          badgeCloud.textContent = t('ready');
          badgeCloud.className = 'quality-status-badge badge-green';
        }
        if (reasonCloud) reasonCloud.textContent = t('reason_cloud_init');
        return;
      }

      // 1. Streaming: DL >= 50 Mbps & Jitter < 30ms -> 5 stars
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

      // 2. Remote Desktop: Ping < 20ms & Jitter < 15ms -> 5 stars
      let aStars = 2;
      let aBadge = t('badge_poor');
      let aBadgeClass = 'badge-amber';
      let aReason = t('reason_remote_2');

      if (ping < 20 && jitter < 15) {
        aStars = 5;
        aBadge = t('badge_great');
        aBadgeClass = 'badge-green';
        aReason = t('reason_remote_5');
      } else if (ping < 40 && jitter < 30) {
        aStars = 4;
        aBadge = t('badge_good');
        aBadgeClass = 'badge-green';
        aReason = t('reason_remote_4');
      } else if (ping < 80) {
        aStars = 3;
        aBadge = t('badge_fair');
        aBadgeClass = 'badge-amber';
        aReason = t('reason_remote_3');
      }
      renderStars(starsRemote, aStars);
      if (badgeRemote) {
        badgeRemote.textContent = aBadge;
        badgeRemote.className = 'quality-status-badge ' + aBadgeClass;
      }
      if (reasonRemote) reasonRemote.textContent = aReason;

      // 3. Video Calls: Ping < 30ms & Jitter < 25ms -> 5 stars
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

      // 4. File Transfer: DL >= 100 Mbps & UL >= 80 Mbps -> 5 stars
      let fStars = 2;
      let fBadge = t('badge_poor');
      let fBadgeClass = 'badge-amber';
      let fReason = t('reason_filetransfer_2');

      if (dl >= 100 && ul >= 80) {
        fStars = 5;
        fBadge = t('badge_great');
        fBadgeClass = 'badge-green';
        fReason = t('reason_filetransfer_5');
      } else if (dl >= 50 && ul >= 40) {
        fStars = 4;
        fBadge = t('badge_good');
        fBadgeClass = 'badge-green';
        fReason = t('reason_filetransfer_4');
      } else if (dl >= 20) {
        fStars = 3;
        fBadge = t('badge_fair');
        fBadgeClass = 'badge-amber';
        fReason = t('reason_filetransfer_3');
      }
      renderStars(starsFileTransfer, fStars);
      if (badgeFileTransfer) {
        badgeFileTransfer.textContent = fBadge;
        badgeFileTransfer.className = 'quality-status-badge ' + fBadgeClass;
      }
      if (reasonFileTransfer) reasonFileTransfer.textContent = fReason;

      // 5. Cloud & Office: Ping < 40ms & DL >= 25 Mbps -> 5 stars
      let cStars = 2;
      let cBadge = t('badge_poor');
      let cBadgeClass = 'badge-amber';
      let cReason = t('reason_cloud_2');

      if (ping < 40 && dl >= 25) {
        cStars = 5;
        cBadge = t('badge_great');
        cBadgeClass = 'badge-green';
        cReason = t('reason_cloud_5');
      } else if (ping < 80 && dl >= 10) {
        cStars = 4;
        cBadge = t('badge_good');
        cBadgeClass = 'badge-green';
        cReason = t('reason_cloud_4');
      } else if (dl >= 5) {
        cStars = 3;
        cBadge = t('badge_fair');
        cBadgeClass = 'badge-amber';
        cReason = t('reason_cloud_3');
      }
      renderStars(starsCloud, cStars);
      if (badgeCloud) {
        badgeCloud.textContent = cBadge;
        badgeCloud.className = 'quality-status-badge ' + cBadgeClass;
      }
      if (reasonCloud) reasonCloud.textContent = cReason;
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

      updateQualityScores(null, null, null, null);

      if (dualChart) dualChart.clear();
    }

    function formatTime(date) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function showShareableTelemetry(resolvedId) {
      currentTestId = resolvedId;
      if (telemetryIdDisplay) telemetryIdDisplay.textContent = resolvedId;

      const host = location.host || 'speedtest.mriazh.my.id';
      const proto = location.protocol || 'https:';
      const cleanIp = (clientIpVal && clientIpVal.textContent && clientIpVal.textContent !== 'Loading...') ? clientIpVal.textContent : '';
      const shareUrl = `${proto}//${host}/results.html?id=${encodeURIComponent(resolvedId)}${cleanIp ? '&ip=' + encodeURIComponent(cleanIp) : ''}`;

      if (shareUrlInput) shareUrlInput.value = shareUrl;
      if (linkViewResultCard) linkViewResultCard.href = shareUrl;
      if (telemetrySection) telemetrySection.hidden = false;

      // Reconcile headline metrics with the exact database record
      fetch('/results/json?id=' + encodeURIComponent(resolvedId) + '&n=' + Date.now(), { cache: 'no-store' })
        .then((r) => r.json())
        .then((dbData) => {
          if (dbData) {
            const dbDl = parseFloat(dbData.download);
            const dbUl = parseFloat(dbData.upload);
            const dbPing = parseFloat(dbData.ping);
            const dbJitter = parseFloat(dbData.jitter);
            if (!isNaN(dbDl) && dbDl > 0) {
              heroValDl.textContent = dbDl.toFixed(1);
              if (bValDlAvg) bValDlAvg.textContent = dbDl.toFixed(1);
            }
            if (!isNaN(dbUl) && dbUl > 0) {
              heroValUl.textContent = dbUl.toFixed(1);
              if (bValUlAvg) bValUlAvg.textContent = dbUl.toFixed(1);
            }
            if (!isNaN(dbPing) && dbPing > 0) {
              heroValPing.textContent = dbPing.toFixed(1);
            }
            if (!isNaN(dbJitter) && dbJitter >= 0) {
              heroValJitter.textContent = dbJitter.toFixed(1);
            }
            updateQualityScores(dbDl, dbPing, dbJitter, dbUl);
          }
        })
        .catch(() => {});
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

        if (data.clientIp) {
          updateIpUI(data.clientIp);
        }

        if (data.testId) {
          currentTestId = data.testId;
        }

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
          primaryHeroBtnLabel.textContent = t('btn_restart_test');
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

        if (lastValidPing !== null) {
          heroValPing.textContent = lastValidPing.toFixed(1);
          if (bValPingUnloaded) bValPingUnloaded.textContent = lastValidPing.toFixed(1);
        }
        if (lastValidJitter !== null) {
          heroValJitter.textContent = lastValidJitter.toFixed(1);
          if (bValJitterStat) bValJitterStat.textContent = lastValidJitter.toFixed(1);
        }

        const finalDl = dlSamples.length ? Math.max(...dlSamples) : 0;
        const finalUl = ulSamples.length ? Math.max(...ulSamples) : 0;
        const finalPing = lastValidPing !== null ? lastValidPing : 1.0;
        const finalJitter = lastValidJitter !== null ? lastValidJitter : 0.2;
        updateQualityScores(finalDl, finalPing, finalJitter, finalUl);

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
      primaryHeroBtn.addEventListener('click', function () {
        if (currentTest && currentTest.getState() === 3) return;
        startSpeedtest();
      });
    }
    if (restartTestBtn) {
      restartTestBtn.addEventListener('click', startSpeedtest);
    }

    if (copyShareLinkBtn) {
      copyShareLinkBtn.addEventListener('click', function () {
        const url = (shareUrlInput && shareUrlInput.value) || `${location.origin}/results.html?id=${currentTestId || 'local-lan'}`;
        copyToClipboard(url, copyShareLinkBtn, copyBtnText);
      });
    }

    if (btnCopyShareTelemetry && shareUrlInput) {
      btnCopyShareTelemetry.addEventListener('click', function () {
        copyToClipboard(shareUrlInput.value, btnCopyShareTelemetry, copyTelemetryBtnText);
      });
    }
  });
})();
