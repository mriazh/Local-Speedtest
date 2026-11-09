/* Local Speedtest — frontend logic powered by LibreSpeed (speedtest.js + speedtest_worker.js).
   Single large Ookla-style speedometer with central GO button, telemetry bar, and result card.
   No CDNs. All logic local. Keeps results.html working for /results.html?id= viewing. */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Animated 240-degree tachometer gauge (single centerpiece speedometer)
  // ---------------------------------------------------------------------------
  class Gauge {
    constructor(canvas, max) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.max = max;          // full-scale value (Mbps)
      this.value = 0;          // animated current value
      this.target = 0;         // target value
      this.color = '#00f2fe';  // needle / arc color (cyan = download headline)
      this.dpr = window.devicePixelRatio || 1;

      this.resize();
      window.addEventListener('resize', () => this.resize());

      this.draw();
      this.loop();
    }

    resize() {
      const dpr = this.dpr;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = w;
      this.h = h;
      // Arc geometry: 240-degree upper arc from bottom-left up over top to bottom-right.
      // Canvas angles: 0=right, increasing = clockwise (y down).
      // start 150deg (bottom-left) -> sweep 240deg clockwise -> 390deg (bottom-right).
      this.cx = w * 0.5;
      this.cy = h * 0.6522;   // center of the imaginary gauge circle
      this.r = w * 0.3889;    // radius, fits arc within canvas bounds at 720x460 aspect
      this.startAngle = 5 * Math.PI / 6;   // 150deg
      this.sweep = 4 * Math.PI / 3;        // 240deg
      this.endAngle = this.startAngle + this.sweep; // 390deg
      this.draw();
    }

    // Animate needle toward `v` (clamped to [0, max]).
    animateTo(v, color) {
      this.target = Math.max(0, Math.min(this.max, v));
      if (color) this.color = color;
    }

    reset() {
      this.value = 0;
      this.target = 0;
      this.color = '#00f2fe';
      this.draw();
    }

    loop() {
      this.value += (this.target - this.value) * 0.12;
      if (Math.abs(this.target - this.value) < 0.05) this.value = this.target;
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    valueToAngle(v) {
      const p = this.max > 0 ? Math.min(1, Math.max(0, v / this.max)) : 0;
      return this.startAngle + p * this.sweep;
    }

    polar(angle, radius) {
      return {
        x: this.cx + Math.cos(angle) * radius,
        y: this.cy + Math.sin(angle) * radius
      };
    }

    draw() {
      const c = this.ctx;
      const { w, h } = this;
      c.clearRect(0, 0, w, h);

      const r = this.r;
      const cx = this.cx;
      const cy = this.cy;
      const start = this.startAngle;
      const end = this.endAngle;

      // ---- Background track (full 240-degree arc) ----
      c.beginPath();
      c.arc(cx, cy, r, start, end, false);
      c.strokeStyle = '#162038';
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.stroke();

      // ---- Filled progress arc (glowing) ----
      const p = this.max > 0 ? Math.min(1, Math.max(0, this.value / this.max)) : 0;
      if (p > 0.005) {
        const cur = start + p * this.sweep;
        // gradient along arc: cyan -> purple
        const grad = c.createLinearGradient(
          this.polar(start, r).x, this.polar(start, r).y,
          this.polar(cur, r).x, this.polar(cur, r).y
        );
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(1, '#818cf8');
        c.beginPath();
        c.arc(cx, cy, r, start, cur, false);
        c.strokeStyle = grad;
        c.lineWidth = 14;
        c.lineCap = 'round';
        c.shadowColor = this.color;
        c.shadowBlur = 22;
        c.stroke();
        c.shadowBlur = 0;
      }

      // ---- Tick marks + labels at 0, 10, 50, 100, 250, 500, 1000, 2000 Mbps ----
      const ticks = [0, 10, 50, 100, 250, 500, 1000, 2000];
      c.save();
      c.translate(cx, cy);
      c.strokeStyle = '#334155';
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.fillStyle = '#94a3b8';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = '700 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ticks.forEach((v) => {
        const a = this.valueToAngle(v);
        const p0 = this.polar(a, r * 0.78);
        const p1 = this.polar(a, r);
        c.beginPath();
        c.moveTo(p0.x - cx, p0.y - cy);
        c.lineTo(p1.x - cx, p1.y - cy);
        c.stroke();
        const pl = this.polar(a, r * 1.16);
        c.fillText(v === 0 ? '0' : v.toString(), pl.x - cx, pl.y - cy);
      });
      c.restore();

      // ---- Needle (glowing) pointing at current value ----
      const needleAngle = this.valueToAngle(this.value);
      const nr = r * 0.72;
      const tip = this.polar(needleAngle, nr);
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(tip.x, tip.y);
      c.strokeStyle = this.color;
      c.lineWidth = 5;
      c.lineCap = 'round';
      c.shadowColor = this.color;
      c.shadowBlur = 16;
      c.stroke();
      c.shadowBlur = 0;

      // Center pivot dot + outer ring hint
      c.beginPath();
      c.arc(cx, cy, 7, 0, 2 * Math.PI);
      c.fillStyle = '#070a12';
      c.fill();
      c.strokeStyle = this.color;
      c.lineWidth = 3;
      c.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // Shared endpoint config (same-origin, no CDNs)
  // ---------------------------------------------------------------------------
  const ENDPOINTS = {
    ping: '/empty',
    download: '/garbage',
    upload: '/empty',
    ip: '/getIP',
    telemetry: '/results/telemetry',
    json: '/results/json',
    card: '/results',
  };

  const isResultsPage =
    location.pathname.endsWith('results.html') || location.pathname.includes('/results.html');

  // ---------------------------------------------------------------------------
  // index.html: speedtest page
  // ---------------------------------------------------------------------------
  const COLORS = {
    dl: '#00f2fe',
    ul: '#818cf8',
    ping: '#f59e0b',
    jitter: '#f59e0b',
  };

  const MAX_GAUGE = 2500; // Mbps full-scale (covers 1 Gbps / 2.5 Gbps LAN with headroom)

  // Speedtest parameters per spec.
  const PARAMS = {
    telemetry_level: 'basic',
    url_telemetry: 'results/telemetry',
    url_dl: 'garbage',
    url_ul: 'empty',
    url_ping: 'empty',
    url_getIp: 'getIP',
  };
  const TEST_ORDER = 'IPDU';

  // DOM
  const startBtn = document.getElementById('goBtn');
  const readout = document.getElementById('readout');
  const readoutVal = document.getElementById('readoutVal');
  const readoutUnit = document.getElementById('readoutUnit');
  const readoutSub = document.getElementById('readoutSub');
  const statusEl = document.getElementById('status');
  const resultCard = document.getElementById('resultCard');
  const shareLink = document.getElementById('shareLink');
  const copyBtn = document.getElementById('copyBtn');
  const openResult = document.getElementById('openResult');
  const ipBadge = document.getElementById('ipBadge');
  const ipVal = document.getElementById('ipVal');

  const teleEls = {
    ping: document.getElementById('tPing'),
    jitter: document.getElementById('tJitter'),
    dl: document.getElementById('tDl'),
    ul: document.getElementById('tUl'),
  };
  const teleDots = {
    ping: document.querySelector('.tele-item[data-metric="ping"] .tele-dot'),
    jitter: document.querySelector('.tele-item[data-metric="jitter"] .tele-dot'),
    dl: document.querySelector('.tele-item[data-metric="download"] .tele-dot'),
    ul: document.querySelector('.tele-item[data-metric="upload"] .tele-dot'),
  };

  const resultEls = {
    dl: document.getElementById('rDl'),
    ul: document.getElementById('rUl'),
    ping: document.getElementById('rPing'),
    jitter: document.getElementById('rJitter'),
  };

  const canvas = document.getElementById('gauge');
  const gauge = (canvas && !isResultsPage) ? new Gauge(canvas, MAX_GAUGE) : null;

  let latest = null;
  let running = false;
  let current = null;
  let activeMetric = null;

  function baseOrigin() {
    return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function setRunningUI(r) {
    running = r;
    if (!startBtn) return;
    if (r) {
      // GO button fades out, live readout fades in
      startBtn.classList.add('running');
      startBtn.setAttribute('aria-pressed', 'true');
      readout.classList.remove('hidden');
      readout.classList.add('visible');
      startBtn.style.opacity = '0';
      startBtn.style.pointerEvents = 'none';
      setStatus('Test in progress…');
    } else {
      startBtn.classList.remove('running');
      startBtn.setAttribute('aria-pressed', 'false');
      readout.classList.remove('visible');
      readout.classList.add('hidden');
      startBtn.style.opacity = '1';
      startBtn.style.pointerEvents = 'auto';
    }
  }

  function highlight(metric) {
    if (activeMetric === metric) return;
    activeMetric = metric;
    Object.values(teleDots).forEach((d) => d && d.classList.remove('live'));
    Object.values(document.querySelectorAll('.tele-item')).forEach((el) => el.classList.remove('active'));
    if (teleDots[metric]) teleDots[metric].classList.add('live');
    const item = document.querySelector(`.tele-item[data-metric="${metric}"]`);
    if (item) item.classList.add('active');
  }

  function setTele(metric, value, unit) {
    const el = teleEls[metric];
    if (el) el.textContent = value === null || value === undefined ? '--' : value;
  }

  function createSpeedtest() {
    const s = new Speedtest();
    Object.entries(PARAMS).forEach(([k, v]) => s.setParameter(k, v));
    s.setParameter('test_order', TEST_ORDER);
    return s;
  }

  function startTest() {
    if (resultCard) resultCard.hidden = true;
    setRunningUI(true);
    if (gauge) gauge.reset();
    Object.values(teleEls).forEach((el) => el && (el.textContent = '--'));
    Object.values(teleDots).forEach((d) => d && d.classList.remove('live'));
    document.querySelectorAll('.tele-item').forEach((el) => el.classList.remove('active'));
    if (ipVal) ipVal.textContent = '--';
    latest = null;
    setStatus('Preparing…');

    current = createSpeedtest();

    current.onupdate = function(data) {
      latest = data;
      const st = data.testState;

      // client IP badge (available from the IP phase)
      if (data.clientIp) {
        ipVal.textContent = data.clientIp;
        if (ipBadge) ipBadge.hidden = false;
      }

      if (st === 1) {
        // Download phase
        highlight('dl');
        setStatus('Testing Download (multi-stream)…');
        const dl = parseFloat(data.dlStatus) || 0;
        if (gauge) gauge.animateTo(dl, COLORS.dl);
        setTele('dl', dl.toFixed(2), 'Mbps');
        if (readoutVal) readoutVal.textContent = dl.toFixed(1);
        if (readoutUnit) readoutUnit.textContent = 'Mbps';
        if (readoutSub) readoutSub.textContent = 'DOWNLOAD';
      } else if (st === 2) {
        // Ping + jitter phase
        highlight('ping');
        setStatus('Pinging…');
        const ping = parseFloat(data.pingStatus) || 0;
        const jitter = parseFloat(data.jitterStatus) || 0;
        setTele('ping', ping.toFixed(2), 'ms');
        setTele('jitter', jitter.toFixed(2), 'ms');
        if (gauge) gauge.animateTo(ping, COLORS.ping);
        if (readoutVal) readoutVal.textContent = ping.toFixed(1);
        if (readoutUnit) readoutUnit.textContent = 'ms';
        if (readoutSub) readoutSub.textContent = 'PING';
      } else if (st === 3) {
        // Upload phase
        highlight('ul');
        setStatus('Testing Upload (multi-stream)…');
        const ul = parseFloat(data.ulStatus) || 0;
        if (gauge) gauge.animateTo(ul, COLORS.ul);
        setTele('ul', ul.toFixed(2), 'Mbps');
        if (readoutVal) readoutVal.textContent = ul.toFixed(1);
        if (readoutUnit) readoutUnit.textContent = 'Mbps';
        if (readoutSub) readoutSub.textContent = 'UPLOAD';
      } else if (st >= 4) {
        setStatus('Completed.');
      }
    };

    current.onend = function(aborted) {
      setRunningUI(false);
      if (aborted) {
        setStatus('Test aborted.');
        if (gauge) gauge.reset();
        current = null;
        return;
      }
      setStatus('Test completed.');
      if (latest) {
        const id = latest.testId || null;
        const dl = parseFloat(latest.dlStatus) || 0;
        const ul = parseFloat(latest.ulStatus) || 0;
        const ping = parseFloat(latest.pingStatus) || 0;
        const jitter = parseFloat(latest.jitterStatus) || 0;

        // Final readout shows download speed (headline metric)
        if (gauge) gauge.animateTo(dl, COLORS.dl);
        if (readoutVal) readoutVal.textContent = dl.toFixed(2);
        if (readoutUnit) readoutUnit.textContent = 'Mbps';
        if (readoutSub) readoutSub.textContent = 'RESULT';

        if (resultEls.dl) resultEls.dl.textContent = dl.toFixed(2);
        if (resultEls.ul) resultEls.ul.textContent = ul.toFixed(2);
        if (resultEls.ping) resultEls.ping.textContent = ping.toFixed(2);
        if (resultEls.jitter) resultEls.jitter.textContent = jitter.toFixed(2);

        if (id && shareLink && openResult) {
          const url = baseOrigin() + '/results/?id=' + id;
          shareLink.value = url;
          openResult.href = url;
          openResult.textContent = 'View full card &rarr;';
          openResult.hidden = false;
        } else if (openResult) {
          openResult.hidden = true;
        }
      }
      if (resultCard) resultCard.hidden = false;
      // restore GO button so the user can run again
      if (startBtn) {
        startBtn.textContent = 'GO';
        startBtn.style.opacity = '1';
        startBtn.style.pointerEvents = 'auto';
      }
      current = null;
    };

    try {
      current.start();
    } catch (e) {
      setStatus('Error: ' + e.message);
      setRunningUI(false);
      current = null;
    }
  }

  if (startBtn) {
    startBtn.addEventListener('click', function() {
      if (running && current) {
        try {
          current.abort();
        } catch (e) {
          // abort best-effort
        }
        setRunningUI(false);
        setStatus('Test aborted.');
        if (gauge) gauge.reset();
        current = null;
        return;
      }
      startTest();
    });
    startBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startBtn.click();
      }
    });
  }

  if (copyBtn && shareLink) {
    copyBtn.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(shareLink.value);
        const before = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(function() {
          copyBtn.textContent = before;
        }, 1200);
      } catch (e) {
        shareLink.select();
        try {
          document.execCommand('copy');
        } catch (_) {
          // clipboard unavailable
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // results.html: view a saved result card
  // ---------------------------------------------------------------------------
  async function initResultsPageView() {
    const statusEl2 = document.getElementById('resultStatus');
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
      if (statusEl2) statusEl2.textContent = 'No result id provided. Use /results/?id=<id>';
      return;
    }
    try {
      const res = await fetch(ENDPOINTS.json + '?id=' + id + '&n=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('result not found');
      const data = await res.json();
      if (rDl) rDl.textContent = data.download || '--';
      if (rUl) rUl.textContent = data.upload || '--';
      if (rPing) rPing.textContent = data.ping || '--';
      if (rJitter) rJitter.textContent = data.jitter || '--';
      if (rMeta) rMeta.textContent = (data.ispinfo ? data.ispinfo + '  •  ' : '') + (data.timestamp || '');
      if (rCard) {
        rCard.src = ENDPOINTS.card + '?id=' + id;
        rCard.hidden = false;
      }
      if (gaugesEl) gaugesEl.hidden = false;
      if (statusEl2) statusEl2.hidden = true;
    } catch (e) {
      if (statusEl2) statusEl2.textContent = 'Could not load result: ' + e.message;
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (isResultsPage) {
      initResultsPageView();
    } else if (startBtn) {
      // speedtest page already wired above
    }
  });
})();
