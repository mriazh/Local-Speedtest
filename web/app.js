/* ==========================================================================
   Local Speedtest — Cloudflare Speed Test Inspired Frontend Logic
   Powered by LibreSpeed Go (speedtest.js + speedtest_worker.js).
   100% Offline LAN Compatible.
   ========================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Canvas Graph / Sparkline Utilities (Crisp High-DPI Rendering)
  // ---------------------------------------------------------------------------
  class Sparkline {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.strokeColor = options.strokeColor || '#f6821f';
      this.fillColor = options.fillColor || 'rgba(246, 130, 31, 0.15)';
      this.lineWidth = options.lineWidth || 2;
      this.data = [];
      this.dpr = window.devicePixelRatio || 1;
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || this.canvas.width || 200;
      const h = rect.height || this.canvas.height || 50;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.w = w;
      this.h = h;
    }

    push(val) {
      this.data.push(val);
      this.draw();
    }

    clear() {
      this.data = [];
      this.draw();
    }

    setColor(stroke, fill) {
      if (stroke) this.strokeColor = stroke;
      if (fill) this.fillColor = fill;
    }

    draw() {
      const ctx = this.ctx;
      const w = this.w;
      const h = this.h;
      ctx.clearRect(0, 0, w, h);

      if (!this.data || this.data.length < 2) {
        // Draw faint baseline
        ctx.beginPath();
        ctx.moveTo(0, h - 6);
        ctx.lineTo(w, h - 6);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
      }

      const padTop = 6;
      const padBot = 6;
      const drawH = h - padTop - padBot;
      const max = Math.max(...this.data, 0.1);
      const min = 0;
      const range = max - min || 1;

      const pts = this.data.map((v, i) => {
        const x = (i / (this.data.length - 1)) * w;
        const y = h - padBot - ((v - min) / range) * drawH;
        return { x, y };
      });

      // Fill Path (under the curve)
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const xc = (pts[i - 1].x + pts[i].x) / 2;
        const yc = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.fillColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Path
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const xc = (pts[i - 1].x + pts[i].x) / 2;
        const yc = (pts[i - 1].y + pts[i].y) / 2;
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
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

  // If on results.html, initialize and exit
  if (isResultsPage) {
    document.addEventListener('DOMContentLoaded', initResultsPageView);
    return;
  }

  // ---------------------------------------------------------------------------
  // Index Page: Cloudflare Speed Test Frontend Logic
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements - Stepper
    const stepItems = {
      latency: document.getElementById('step-latency'),
      download: document.getElementById('step-download'),
      upload: document.getElementById('step-upload'),
      complete: document.getElementById('step-complete')
    };
    const stepStatuses = {
      latency: document.getElementById('stepStatus-latency'),
      download: document.getElementById('stepStatus-download'),
      upload: document.getElementById('stepStatus-upload'),
      complete: document.getElementById('stepStatus-complete')
    };

    // Hero Live Area
    const heroIdle = document.getElementById('heroIdle');
    const heroRunning = document.getElementById('heroRunning');
    const startBtn = document.getElementById('startBtn');
    const livePhaseBadge = document.getElementById('livePhaseBadge');
    const livePhaseDesc = document.getElementById('livePhaseDesc');
    const liveReadoutVal = document.getElementById('liveReadoutVal');
    const liveReadoutUnit = document.getElementById('liveReadoutUnit');
    const heroGraphCanvas = document.getElementById('heroGraph');

    // 4-Card Metric Matrix
    const cards = {
      download: document.getElementById('cardDownload'),
      upload: document.getElementById('cardUpload'),
      latency: document.getElementById('cardLatency'),
      jitter: document.getElementById('cardJitter')
    };

    const valDl = document.getElementById('valDl');
    const valDlPeak = document.getElementById('valDlPeak');
    const valDlAvg = document.getElementById('valDlAvg');
    const sparklineDlCanvas = document.getElementById('sparklineDl');

    const valUl = document.getElementById('valUl');
    const valUlPeak = document.getElementById('valUlPeak');
    const valUlAvg = document.getElementById('valUlAvg');
    const sparklineUlCanvas = document.getElementById('sparklineUl');

    const valPing = document.getElementById('valPing');
    const valPingMin = document.getElementById('valPingMin');
    const valPingAvg = document.getElementById('valPingAvg');
    const sparklinePingCanvas = document.getElementById('sparklinePing');

    const valJitter = document.getElementById('valJitter');
    const jitterRatingBadge = document.getElementById('jitterRatingBadge');
    const stabilityText = document.getElementById('stabilityText');

    // Share Result Section
    const shareSection = document.getElementById('shareSection');
    const telemetryId = document.getElementById('telemetryId');
    const shareLinkInput = document.getElementById('shareLinkInput');
    const copyShareBtn = document.getElementById('copyShareBtn');
    const openCardLink = document.getElementById('openCardLink');
    const testAgainBtn = document.getElementById('testAgainBtn');

    // Client IP Badge
    const clientIpVal = document.getElementById('clientIpVal');

    // Initialize Sparkline Canvases
    const heroSparkline = heroGraphCanvas
      ? new Sparkline(heroGraphCanvas, {
          strokeColor: '#f6821f',
          fillColor: 'rgba(246, 130, 31, 0.18)',
          lineWidth: 3
        })
      : null;

    const dlSparkline = sparklineDlCanvas
      ? new Sparkline(sparklineDlCanvas, {
          strokeColor: '#f6821f',
          fillColor: 'rgba(246, 130, 31, 0.15)',
          lineWidth: 2
        })
      : null;

    const ulSparkline = sparklineUlCanvas
      ? new Sparkline(sparklineUlCanvas, {
          strokeColor: '#8a63d2',
          fillColor: 'rgba(138, 99, 210, 0.15)',
          lineWidth: 2
        })
      : null;

    const pingSparkline = sparklinePingCanvas
      ? new Sparkline(sparklinePingCanvas, {
          strokeColor: '#00a4e4',
          fillColor: 'rgba(0, 164, 228, 0.15)',
          lineWidth: 2
        })
      : null;

    window.addEventListener('resize', () => {
      if (heroSparkline) heroSparkline.resize();
      if (dlSparkline) dlSparkline.resize();
      if (ulSparkline) ulSparkline.resize();
      if (pingSparkline) pingSparkline.resize();
    });

    // -------------------------------------------------------------------------
    // Initial Client IP Pre-fetch
    // -------------------------------------------------------------------------
    function fetchClientIp() {
      fetch('/getIP')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.processedString && clientIpVal) {
            const ip = data.processedString.split(' ')[0] || data.processedString;
            clientIpVal.textContent = ip;
          }
        })
        .catch(() => {
          if (clientIpVal) clientIpVal.textContent = '172.16.x.x';
        });
    }
    fetchClientIp();

    // -------------------------------------------------------------------------
    // Speedtest State & Telemetry Tracking
    // -------------------------------------------------------------------------
    let currentTest = null;
    let isRunning = false;
    let currentPhase = 'idle';

    let dlSamples = [];
    let ulSamples = [];
    let pingSamples = [];

    function resetUI() {
      // Reset Stepper
      Object.keys(stepItems).forEach((key) => {
        stepItems[key].classList.remove('active', 'done');
        stepStatuses[key].textContent = 'Waiting';
      });

      // Reset Hero
      heroIdle.hidden = false;
      heroRunning.hidden = true;
      liveReadoutVal.textContent = '0.0';
      liveReadoutUnit.textContent = 'Mbps';
      if (heroSparkline) heroSparkline.clear();

      // Reset Cards
      Object.values(cards).forEach((c) => c.classList.remove('card-active'));
      valDl.textContent = '--';
      valDlPeak.textContent = '--';
      valDlAvg.textContent = '--';
      if (dlSparkline) dlSparkline.clear();

      valUl.textContent = '--';
      valUlPeak.textContent = '--';
      valUlAvg.textContent = '--';
      if (ulSparkline) ulSparkline.clear();

      valPing.textContent = '--';
      valPingMin.textContent = '--';
      valPingAvg.textContent = '--';
      if (pingSparkline) pingSparkline.clear();

      valJitter.textContent = '--';
      jitterRatingBadge.className = 'rating-badge rating-idle';
      jitterRatingBadge.textContent = 'Ready';
      stabilityText.textContent = 'Awaiting test';

      // Reset Share Section
      shareSection.hidden = true;
      shareLinkInput.value = '';
      telemetryId.textContent = '--';

      dlSamples = [];
      ulSamples = [];
      pingSamples = [];
    }

    function setPhase(phase) {
      if (currentPhase === phase) return;
      currentPhase = phase;

      // Update card focus
      Object.values(cards).forEach((c) => c.classList.remove('card-active'));

      if (phase === 'latency') {
        // Step 1 Active
        stepItems.latency.classList.add('active');
        stepItems.latency.classList.remove('done');
        stepStatuses.latency.textContent = 'Testing';

        livePhaseBadge.textContent = 'LATENCY';
        livePhaseBadge.style.color = '#00a4e4';
        livePhaseBadge.style.borderColor = 'rgba(0, 164, 228, 0.4)';
        livePhaseBadge.style.background = 'rgba(0, 164, 228, 0.15)';
        livePhaseDesc.textContent = 'Measuring round-trip time and jitter...';
        liveReadoutUnit.textContent = 'ms';
        if (heroSparkline) {
          heroSparkline.clear();
          heroSparkline.setColor('#00a4e4', 'rgba(0, 164, 228, 0.2)');
        }
        cards.latency.classList.add('card-active');
        cards.jitter.classList.add('card-active');
      } else if (phase === 'download') {
        // Step 1 Done, Step 2 Active
        stepItems.latency.classList.remove('active');
        stepItems.latency.classList.add('done');
        stepStatuses.latency.textContent = 'Done';

        stepItems.download.classList.add('active');
        stepItems.download.classList.remove('done');
        stepStatuses.download.textContent = 'Testing';

        livePhaseBadge.textContent = 'DOWNLOAD';
        livePhaseBadge.style.color = '#f6821f';
        livePhaseBadge.style.borderColor = 'rgba(246, 130, 31, 0.4)';
        livePhaseBadge.style.background = 'rgba(246, 130, 31, 0.15)';
        livePhaseDesc.textContent = 'Testing multi-stream download throughput...';
        liveReadoutUnit.textContent = 'Mbps';
        if (heroSparkline) {
          heroSparkline.clear();
          heroSparkline.setColor('#f6821f', 'rgba(246, 130, 31, 0.2)');
        }
        cards.download.classList.add('card-active');
      } else if (phase === 'upload') {
        // Step 1 & 2 Done, Step 3 Active
        stepItems.download.classList.remove('active');
        stepItems.download.classList.add('done');
        stepStatuses.download.textContent = 'Done';

        stepItems.upload.classList.add('active');
        stepItems.upload.classList.remove('done');
        stepStatuses.upload.textContent = 'Testing';

        livePhaseBadge.textContent = 'UPLOAD';
        livePhaseBadge.style.color = '#8a63d2';
        livePhaseBadge.style.borderColor = 'rgba(138, 99, 210, 0.4)';
        livePhaseBadge.style.background = 'rgba(138, 99, 210, 0.15)';
        livePhaseDesc.textContent = 'Testing multi-stream upload throughput...';
        liveReadoutUnit.textContent = 'Mbps';
        if (heroSparkline) {
          heroSparkline.clear();
          heroSparkline.setColor('#8a63d2', 'rgba(138, 99, 210, 0.2)');
        }
        cards.upload.classList.add('card-active');
      } else if (phase === 'complete') {
        // All Steps Done
        stepItems.upload.classList.remove('active');
        stepItems.upload.classList.add('done');
        stepStatuses.upload.textContent = 'Done';

        stepItems.complete.classList.add('active', 'done');
        stepStatuses.complete.textContent = 'Done';

        livePhaseBadge.textContent = 'COMPLETED';
        livePhaseBadge.style.color = '#10b981';
        livePhaseBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        livePhaseBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        livePhaseDesc.textContent = 'Local benchmark finished successfully.';
      }
    }

    function updateJitterRating(jitter) {
      if (jitter === null || isNaN(jitter)) return;
      if (jitter <= 2) {
        jitterRatingBadge.className = 'rating-badge rating-ultra';
        jitterRatingBadge.textContent = 'Ultra Stable';
        stabilityText.textContent = 'Excellent (< 2ms)';
      } else if (jitter <= 5) {
        jitterRatingBadge.className = 'rating-badge rating-good';
        jitterRatingBadge.textContent = 'Very Stable';
        stabilityText.textContent = 'Good (< 5ms)';
      } else if (jitter <= 15) {
        jitterRatingBadge.className = 'rating-badge rating-fair';
        jitterRatingBadge.textContent = 'Stable';
        stabilityText.textContent = 'Moderate';
      } else {
        jitterRatingBadge.className = 'rating-badge rating-fair';
        jitterRatingBadge.textContent = 'High Jitter';
        stabilityText.textContent = 'Variable';
      }
    }

    function startSpeedtest() {
      if (isRunning) return;
      isRunning = true;
      resetUI();

      heroIdle.hidden = true;
      heroRunning.hidden = false;
      setPhase('latency');

      const s = new Speedtest();
      Object.entries(SPEEDTEST_PARAMS).forEach(([k, v]) => s.setParameter(k, v));
      currentTest = s;

      let lastTestId = null;

      s.onupdate = function (data) {
        const st = data.testState;

        // Update Client IP if reported by worker
        if (data.clientIp && clientIpVal) {
          const ip = data.clientIp.split(' ')[0] || data.clientIp;
          clientIpVal.textContent = ip;
        }

        if (data.testId) {
          lastTestId = data.testId;
        }

        // State 0 or 2: Latency & Jitter phase (test_order IPDU)
        if (st === 0 || st === 2) {
          setPhase('latency');
          const ping = parseFloat(data.pingStatus);
          const jitter = parseFloat(data.jitterStatus);

          if (!isNaN(ping) && ping > 0) {
            pingSamples.push(ping);
            valPing.textContent = ping.toFixed(1);
            liveReadoutVal.textContent = ping.toFixed(1);
            if (heroSparkline) heroSparkline.push(ping);
            if (pingSparkline) pingSparkline.push(ping);

            const minPing = Math.min(...pingSamples);
            const avgPing =
              pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length;
            valPingMin.textContent = minPing.toFixed(1);
            valPingAvg.textContent = avgPing.toFixed(1);
          }

          if (!isNaN(jitter) && jitter >= 0) {
            valJitter.textContent = jitter.toFixed(1);
            updateJitterRating(jitter);
          }
        }
        // State 1: Download phase
        else if (st === 1) {
          setPhase('download');
          const dl = parseFloat(data.dlStatus);
          if (!isNaN(dl) && dl > 0) {
            dlSamples.push(dl);
            valDl.textContent = dl.toFixed(1);
            liveReadoutVal.textContent = dl.toFixed(1);
            if (heroSparkline) heroSparkline.push(dl);
            if (dlSparkline) dlSparkline.push(dl);

            const peak = Math.max(...dlSamples);
            const avg = dlSamples.reduce((a, b) => a + b, 0) / dlSamples.length;
            valDlPeak.textContent = peak.toFixed(1);
            valDlAvg.textContent = avg.toFixed(1);
          }
        }
        // State 3: Upload phase
        else if (st === 3) {
          setPhase('upload');
          const ul = parseFloat(data.ulStatus);
          if (!isNaN(ul) && ul > 0) {
            ulSamples.push(ul);
            valUl.textContent = ul.toFixed(1);
            liveReadoutVal.textContent = ul.toFixed(1);
            if (heroSparkline) heroSparkline.push(ul);
            if (ulSparkline) ulSparkline.push(ul);

            const peak = Math.max(...ulSamples);
            const avg = ulSamples.reduce((a, b) => a + b, 0) / ulSamples.length;
            valUlPeak.textContent = peak.toFixed(1);
            valUlAvg.textContent = avg.toFixed(1);
          }
        }
      };

      s.onend = function (aborted) {
        isRunning = false;
        currentTest = null;

        if (aborted) {
          resetUI();
          return;
        }

        setPhase('complete');

        // Capture testId and configure share section
        const finalDl = valDl.textContent;
        liveReadoutVal.textContent = finalDl !== '--' ? finalDl : '0.0';
        liveReadoutUnit.textContent = 'Mbps';

        // Read testId from last received data or check telemetry response
        const id = lastTestId || (s.worker && s.worker.testId) || null;

        function showShareCard(resolvedId) {
          if (!resolvedId) return;
          telemetryId.textContent = resolvedId;
          const host = location.host || 'speedtest.mriazh.my.id:8989';
          const proto = location.protocol || 'http:';
          const shareUrl = `${proto}//${host}/results/?id=${resolvedId}`;
          shareLinkInput.value = shareUrl;
          openCardLink.href = `/results/?id=${resolvedId}`;
          shareSection.hidden = false;
        }

        if (id) {
          showShareCard(id);
        } else {
          // Poll telemetry endpoint or wait briefly if asynchronous
          let retries = 0;
          const pollInterval = setInterval(() => {
            retries++;
            if (lastTestId) {
              clearInterval(pollInterval);
              showShareCard(lastTestId);
            } else if (retries > 8) {
              clearInterval(pollInterval);
              // Fallback ID indicator if telemetry was skipped or unassigned
              telemetryId.textContent = 'LAN-Local';
              shareLinkInput.value = `${location.origin}/results.html`;
              openCardLink.href = '/results.html';
              shareSection.hidden = false;
            }
          }, 300);
        }
      };

      try {
        s.start();
      } catch (err) {
        console.error('Failed to start speedtest:', err);
        isRunning = false;
        resetUI();
      }
    }

    // -------------------------------------------------------------------------
    // Event Listeners
    // -------------------------------------------------------------------------
    if (startBtn) {
      startBtn.addEventListener('click', startSpeedtest);
    }

    if (testAgainBtn) {
      testAgainBtn.addEventListener('click', startSpeedtest);
    }

    if (copyShareBtn && shareLinkInput) {
      copyShareBtn.addEventListener('click', async function () {
        const text = shareLinkInput.value;
        if (!text) return;

        try {
          await navigator.clipboard.writeText(text);
          const originalText = copyShareBtn.querySelector('span').textContent;
          copyShareBtn.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            copyShareBtn.querySelector('span').textContent = originalText;
          }, 1800);
        } catch (_) {
          shareLinkInput.select();
          document.execCommand('copy');
          copyShareBtn.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            copyShareBtn.querySelector('span').textContent = 'Copy Link';
          }, 1800);
        }
      });
    }
  });
})();
