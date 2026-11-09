/* Local Speedtest — frontend logic powered by LibreSpeed (speedtest.js + speedtest_worker.js).
   No CDNs. All logic local. Drives the animated gauges and stage indicator on index.html,
   and preserves the /results/?id= viewing page (results.html). */

(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Animated canvas speedometer gauge
  // ---------------------------------------------------------------------------
  class Gauge {
    constructor(canvas, color, max, unit) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.color = color;      // CSS color string
      this.max = max;          // full-scale value
      this.unit = unit;        // label
      this.value = 0;          // current (animated) value
      this.target = 0;         // target value
      this.dpr = window.devicePixelRatio || 1;

      this.canvas.width = 260 * this.dpr;
      this.canvas.height = 120 * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);

      this.draw = this.draw.bind(this);
      this.loop = this.loop.bind(this);
      this.draw();
      this.loop();
    }

    // Animate the needle toward `v` (clamped to [0, max]).
    animateTo(v) {
      this.target = Math.max(0, Math.min(this.max, v));
    }

    reset() {
      this.value = 0;
      this.target = 0;
      this.draw();
    }

    loop() {
      this.value += (this.target - this.value) * 0.14;
      if (Math.abs(this.target - this.value) < 0.05) this.value = this.target;
      this.draw();
      requestAnimationFrame(this.loop);
    }

    draw() {
      const c = this.ctx;
      const w = this.canvas.width / this.dpr;
      const h = this.canvas.height / this.dpr;
      c.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.80;
      const r = Math.min(w, h) * 0.42;

      // Speedometer arc: lower-left (150deg) -> bottom (90deg) -> lower-right (30deg).
      const start = 5 * Math.PI / 6;
      const end = Math.PI / 6;
      const p = this.max > 0 ? Math.min(1, this.value / this.max) : 0;
      const cur = start - p * (start - end);

      // Background track.
      c.beginPath();
      c.arc(cx, cy, r, start, end, true);
      c.strokeStyle = '#1f2a44';
      c.lineWidth = 10;
      c.lineCap = 'round';
      c.stroke();

      // Filled progress arc (+ glow).
      if (p > 0.005) {
        c.beginPath();
        c.arc(cx, cy, r, start, cur, true);
        c.strokeStyle = this.color;
        c.lineWidth = 10;
        c.lineCap = 'round';
        c.shadowColor = this.color;
        c.shadowBlur = 14;
        c.stroke();
        c.shadowBlur = 0;
      }

      // Tick marks.
      c.save();
      c.translate(cx, cy);
      c.strokeStyle = '#334155';
      c.lineWidth = 2;
      c.lineCap = 'round';
      for (let i = 0; i <= 5; i++) {
        const a = start - (i / 5) * (start - end);
        c.beginPath();
        c.moveTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        c.stroke();
      }
      c.restore();

      // Needle.
      const nr = r * 0.78;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(cur) * nr, cy + Math.sin(cur) * nr);
      c.strokeStyle = this.color;
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.shadowColor = this.color;
      c.shadowBlur = 10;
      c.stroke();
      c.shadowBlur = 0;

      // Center dot.
      c.beginPath();
      c.arc(cx, cy, 6, 0, 2 * Math.PI);
      c.fillStyle = '#090d16';
      c.fill();
      c.strokeStyle = this.color;
      c.lineWidth = 2;
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

  const MAX_DL_UL = 3000; // Mbps (covers 1 Gbps / 2.5 Gbps LAN)
  const MAX_PING = 300;   // ms

  // Speedtest parameters per spec.
  const PARAMS = {
    telemetry_level: 'basic',
    url_telemetry: 'results/telemetry',
    url_dl: 'garbage',
    url_ul: 'empty',
    url_ping: 'empty',
    url_getIp: 'getIP',
  };
  // test_order includes a ping phase so the stage indicator can show "Pinging…".
  const TEST_ORDER = 'IPDU';

  const startBtn = document.getElementById('startBtn');
  const statusEl = document.getElementById('status');
  const resultBox = document.getElementById('resultBox');
  const shareLink = document.getElementById('shareLink');
  const copyBtn = document.getElementById('copyBtn');
  const openResult = document.getElementById('openResult');

  const stageEls = {
    ping: document.getElementById('stage-ping'),
    download: document.getElementById('stage-download'),
    upload: document.getElementById('stage-upload'),
    complete: document.getElementById('stage-complete'),
  };

  const readoutEls = {
    dl: document.getElementById('dlVal'),
    ul: document.getElementById('ulVal'),
    ping: document.getElementById('pingVal'),
    jitter: document.getElementById('jitterVal'),
  };

  const resultEls = {
    dl: document.getElementById('rDl'),
    ul: document.getElementById('rUl'),
    ping: document.getElementById('rPing'),
    jitter: document.getElementById('rJitter'),
  };

  const gauges = (function buildGauges() {
    if (isResultsPage || !document.getElementById('gaugeDl')) return {};
    return {
      dl: new Gauge(document.getElementById('gaugeDl'), COLORS.dl, MAX_DL_UL, 'Mbps'),
      ul: new Gauge(document.getElementById('gaugeUl'), COLORS.ul, MAX_DL_UL, 'Mbps'),
      ping: new Gauge(document.getElementById('gaugePing'), COLORS.ping, MAX_PING, 'ms'),
      jitter: new Gauge(document.getElementById('gaugeJitter'), COLORS.jitter, MAX_PING, 'ms'),
    };
  })();

  let latest = null;
  let activeStage = null;
  let running = false;
  let current = null;

  function baseOrigin() {
    return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
  }

  function setStage(key) {
    if (activeStage === key) return;
    activeStage = key;
    Object.values(stageEls).forEach((el) => el && el.classList.remove('active', 'done'));
    const order = ['ping', 'download', 'upload', 'complete'];
    const idx = order.indexOf(key);
    order.forEach((k, i) => {
      if (i < idx && stageEls[k]) stageEls[k].classList.add('done');
    });
    if (stageEls[key]) stageEls[key].classList.add('active');
    const label = {
      ping: 'Pinging&hellip;',
      download: 'Testing Download (Multi-stream)&hellip;',
      upload: 'Testing Upload (Multi-stream)&hellip;',
      complete: 'Completed',
    }[key] || 'Idle';
    if (statusEl) statusEl.textContent = label;
  }

  function setRunning(r) {
    running = r;
    if (startBtn) {
      startBtn.disabled = r;
      startBtn.textContent = r ? 'Stop Test' : 'Start Test';
      startBtn.classList.toggle('running', r);
    }
  }

  function createSpeedtest() {
    const s = new Speedtest();
    Object.entries(PARAMS).forEach(([k, v]) => s.setParameter(k, v));
    s.setParameter('test_order', TEST_ORDER);
    return s;
  }

  function startTest() {
    if (resultBox) resultBox.hidden = true;
    setRunning(true);
    setStage('ping');
    Object.values(gauges).forEach((g) => g.reset());
    Object.values(readoutEls).forEach((el) => (el.textContent = '--'));
    latest = null;
    if (statusEl) statusEl.textContent = 'Preparing&hellip;';

    current = createSpeedtest();

    current.onupdate = function(data) {
      latest = data;
      const st = data.testState;
      if (st === 1) {
        setStage('download');
        gauges.dl.animateTo(parseFloat(data.dlStatus) || 0);
        if (data.dlStatus && data.dlStatus !== 'Fail') readoutEls.dl.textContent = data.dlStatus;
      } else if (st === 3) {
        setStage('upload');
        gauges.ul.animateTo(parseFloat(data.ulStatus) || 0);
        if (data.ulStatus && data.ulStatus !== 'Fail') readoutEls.ul.textContent = data.ulStatus;
      } else if (st === 2) {
        setStage('ping');
        gauges.ping.animateTo(parseFloat(data.pingStatus) || 0);
        gauges.jitter.animateTo(parseFloat(data.jitterStatus) || 0);
        if (data.pingStatus && data.pingStatus !== 'Fail') readoutEls.ping.textContent = data.pingStatus;
        if (data.jitterStatus && data.jitterStatus !== 'Fail') readoutEls.jitter.textContent = data.jitterStatus;
      } else if (st >= 4) {
        setStage('complete');
      }
    };

    current.onend = function(aborted) {
      setRunning(false);
      if (aborted) {
        setStage('ping');
        if (statusEl) statusEl.textContent = 'Test aborted.';
        current = null;
        return;
      }
      setStage('complete');
      if (latest) {
        const id = latest.testId || null;
        const dl = parseFloat(latest.dlStatus) || 0;
        const ul = parseFloat(latest.ulStatus) || 0;
        const ping = parseFloat(latest.pingStatus) || 0;
        const jitter = parseFloat(latest.jitterStatus) || 0;

        if (resultEls.dl) resultEls.dl.textContent = dl.toFixed(2);
        if (resultEls.ul) resultEls.ul.textContent = ul.toFixed(2);
        if (resultEls.ping) resultEls.ping.textContent = ping.toFixed(2);
        if (resultEls.jitter) resultEls.jitter.textContent = jitter.toFixed(2);

        gauges.dl.animateTo(dl);
        gauges.ul.animateTo(ul);
        gauges.ping.animateTo(ping);
        gauges.jitter.animateTo(jitter);

        if (id && shareLink && openResult) {
          const url = baseOrigin() + '/results/?id=' + id;
          shareLink.value = url;
          openResult.href = url;
          openResult.textContent = 'View Generated Card &rarr;';
          openResult.hidden = false;
        } else if (openResult) {
          openResult.hidden = true;
        }
      }
      if (resultBox) resultBox.hidden = false;
      if (statusEl) statusEl.textContent = 'Test completed.';
      current = null;
    };

    try {
      current.start();
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Error: ' + e.message;
      setRunning(false);
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
        setRunning(false);
        setStage('ping');
        if (statusEl) statusEl.textContent = 'Test aborted.';
        current = null;
        return;
      }
      startTest();
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
