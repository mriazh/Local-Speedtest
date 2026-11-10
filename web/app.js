/* ==========================================================================
   Local Speedtest — Cloudflare Speed Test Frontend Logic
   Inspired by speed.cloudflare.com.
   100% Offline LAN Compatible.
   ========================================================================== */

(function () {
  'use strict';

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

      const padTop = 16;
      const padBot = 20;
      const drawH = h - padTop - padBot;

      // Draw horizontal grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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
        dlGrad.addColorStop(0, 'rgba(246, 130, 31, 0.35)');
        dlGrad.addColorStop(1, 'rgba(246, 130, 31, 0.0)');
        ctx.fillStyle = dlGrad;
        ctx.fill();

        // Stroke line
        drawSplinePath(dlPts);
        ctx.strokeStyle = '#f6821f';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(246, 130, 31, 0.5)';
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
        ctx.strokeStyle = 'rgba(250, 173, 63, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#faad3f';
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
        ulGrad.addColorStop(0, 'rgba(138, 99, 210, 0.35)');
        ulGrad.addColorStop(1, 'rgba(138, 99, 210, 0.0)');
        ctx.fillStyle = ulGrad;
        ctx.fill();

        // Stroke line
        drawSplinePath(ulPts);
        ctx.strokeStyle = '#8a63d2';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(138, 99, 210, 0.5)';
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
    // Top Elements
    const clientIpVal = document.getElementById('clientIpVal');
    const metaClientIp = document.getElementById('metaClientIp');
    const topoClientIp = document.getElementById('topoClientIp');

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
      // 1. Streaming: 5 stars if jitter < 5ms and DL > 50 Mbps
      let sStars = 1;
      let sBadge = 'Poor';
      let sBadgeClass = 'badge-amber';
      let sReason = 'Low throughput or high jitter';

      if (dl >= 50 && jitter < 5) {
        sStars = 5;
        sBadge = 'Great';
        sBadgeClass = 'badge-green';
        sReason = 'Ultra HD 4K/8K ready without buffering';
      } else if (dl >= 25 && jitter < 10) {
        sStars = 4;
        sBadge = 'Good';
        sBadgeClass = 'badge-green';
        sReason = 'Smooth 1080p Full HD streaming';
      } else if (dl >= 10) {
        sStars = 3;
        sBadge = 'Fair';
        sBadgeClass = 'badge-amber';
        sReason = 'Standard 720p streaming';
      }
      renderStars(starsStreaming, sStars);
      if (badgeStreaming) {
        badgeStreaming.textContent = sBadge;
        badgeStreaming.className = 'quality-status-badge ' + sBadgeClass;
      }
      if (reasonStreaming) reasonStreaming.textContent = sReason;

      // 2. Gaming: 5 stars if latency < 10ms and jitter < 3ms
      let gStars = 1;
      let gBadge = 'Poor';
      let gBadgeClass = 'badge-amber';
      let gReason = 'High latency or noticeable jitter';

      if (ping < 10 && jitter < 3) {
        gStars = 5;
        gBadge = 'Great';
        gBadgeClass = 'badge-green';
        gReason = 'LAN Gigabit response (< 10ms)';
      } else if (ping < 25 && jitter < 5) {
        gStars = 4;
        gBadge = 'Good';
        gBadgeClass = 'badge-green';
        gReason = 'Competitive multiplayer ready';
      } else if (ping < 50 && jitter < 10) {
        gStars = 3;
        gBadge = 'Fair';
        gBadgeClass = 'badge-amber';
        gReason = 'Casual gaming acceptable';
      }
      renderStars(starsGaming, gStars);
      if (badgeGaming) {
        badgeGaming.textContent = gBadge;
        badgeGaming.className = 'quality-status-badge ' + gBadgeClass;
      }
      if (reasonGaming) reasonGaming.textContent = gReason;

      // 3. Video Calls: 5 stars if latency < 20ms and jitter < 5ms
      let vStars = 1;
      let vBadge = 'Poor';
      let vBadgeClass = 'badge-amber';
      let vReason = 'Noticeable lag or packet stutter';

      if (ping < 20 && jitter < 5) {
        vStars = 5;
        vBadge = 'Great';
        vBadgeClass = 'badge-green';
        vReason = 'Crystal clear real-time video/audio';
      } else if (ping < 50 && jitter < 10) {
        vStars = 4;
        vBadge = 'Good';
        vBadgeClass = 'badge-green';
        vReason = 'Smooth video calls with minor jitter';
      } else if (ping < 100) {
        vStars = 3;
        vBadge = 'Fair';
        vBadgeClass = 'badge-amber';
        vReason = 'Occasional talk-over or delay';
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
        testStateBadge.textContent = 'READY';
        testStateBadge.className = 'status-indicator-badge';
      }
      if (primaryHeroBtn) {
        primaryHeroBtn.disabled = false;
        primaryHeroBtnLabel.textContent = 'Start Test';
      }

      heroValDl.textContent = '--';
      heroValDlPeak.textContent = '--';
      heroValUl.textContent = '--';
      heroValUlPeak.textContent = '--';
      heroValPing.textContent = '--';
      heroValPingMin.textContent = '--';
      heroValJitter.textContent = '--';
      heroValBuffer.textContent = 'Optimal';

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
        testStateBadge.textContent = 'RUNNING';
        testStateBadge.className = 'status-indicator-badge status-testing';
      }
      if (primaryHeroBtn) {
        primaryHeroBtn.disabled = true;
        primaryHeroBtnLabel.textContent = 'Testing...';
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
          // Guard: Never lose pingStatus or reset to '--'
          heroValPing.textContent = lastValidPing.toFixed(1);
        }

        if (!isNaN(rawJitter) && rawJitter >= 0) {
          lastValidJitter = rawJitter;
          heroValJitter.textContent = rawJitter.toFixed(1);
          if (bValJitterStat) bValJitterStat.textContent = rawJitter.toFixed(1);
          if (rawJitter < 3) {
            heroValBuffer.textContent = 'Optimal (<3ms)';
          } else {
            heroValBuffer.textContent = 'Stable';
          }
        } else if (lastValidJitter !== null) {
          // Guard: Never lose jitterStatus or reset to '--'
          heroValJitter.textContent = lastValidJitter.toFixed(1);
        }

        // State 1: Download phase
        if (st === 1) {
          if (testStateBadge) testStateBadge.textContent = 'DOWNLOAD';
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
            // Approximate data transferred in MB
            if (bValDlBytes) {
              const approxMB = ((avgDl * dlSamples.length * 0.2) / 8).toFixed(1);
              bValDlBytes.textContent = approxMB;
            }
          }
        }
        // State 3: Upload phase
        else if (st === 3) {
          if (testStateBadge) testStateBadge.textContent = 'UPLOAD';
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
          primaryHeroBtnLabel.textContent = 'Start Test';
        }

        if (aborted) {
          resetUI();
          return;
        }

        if (testStateBadge) {
          testStateBadge.textContent = 'COMPLETED';
          testStateBadge.className = 'status-indicator-badge status-done';
        }

        if (timestampDisplay) {
          timestampDisplay.textContent = 'Measured at ' + formatTime(new Date());
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
              // Fallback to local card if unassigned
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
        labelElement.textContent = 'Copied!';
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
        labelElement.textContent = 'Copied!';
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
  });
})();
