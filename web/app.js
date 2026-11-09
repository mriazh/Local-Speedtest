// Local Speedtest — frontend logic (vanilla JS, no dependencies).
// Works with the LibreSpeed Go backend endpoints served from the same origin.

const ENDPOINTS = {
  ping: '/empty',
  download: '/garbage',
  upload: '/empty',
  ip: '/getIP',
  telemetry: '/results/telemetry',
  json: '/results/json',
  card: '/results',
};

const isResultsPage = location.pathname.endsWith('results.html') || location.pathname.includes('/results.html');

const dlEl = document.getElementById('dl');
const ulEl = document.getElementById('ul');
const pingEl = document.getElementById('ping');
const jitterEl = document.getElementById('jitter');
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const resultCard = document.getElementById('resultCard');
const resultSummary = document.getElementById('resultSummary');
const shareLink = document.getElementById('shareLink');
const copyBtn = document.getElementById('copyBtn');
const openResult = document.getElementById('openResult');

function fmtMbps(bps){ return isNaN(bps) ? '--' : (bps / 1e6).toFixed(2); }
function fmtMs(ms){ return isNaN(ms) ? '--' : ms.toFixed(1); }

// Time a fetch and read the full body so the measured time includes transfer.
async function timedFetch(url, opts = {}){
  const t0 = performance.now();
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await res.arrayBuffer();
  return { ms: performance.now() - t0 };
}

async function pingTest(count = 6){
  const rtts = [];
  for (let i = 0; i < count; i++){
    try{
      const r = await timedFetch(ENDPOINTS.ping + '?n=' + Date.now() + '-' + i);
      rtts.push(r.ms);
    } catch (e){ /* ignore individual probe failures */ }
  }
  if (rtts.length === 0) return { ping: 0, jitter: 0 };
  rtts.sort((a, b) => a - b);
  const ping = rtts[0]; // best RTT
  const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
  const jitter = rtts.reduce((a, b) => a + Math.abs(b - avg), 0) / rtts.length;
  return { ping, jitter };
}

async function downloadTest(){
  const t0 = performance.now();
  const res = await fetch(ENDPOINTS.download + '?n=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('download failed');
  const buf = await res.arrayBuffer();
  const sec = (performance.now() - t0) / 1000;
  return buf.byteLength / sec; // bytes/sec
}

async function uploadTest(sizeMB = 4){
  const bytes = sizeMB * 1024 * 1024;
  // Zero-filled blob is fine: /empty is a discard sink.
  const blob = new Blob([new Uint8Array(bytes)]);
  const t0 = performance.now();
  const res = await fetch(ENDPOINTS.upload + '?n=' + Date.now(), {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  if (!res.ok) throw new Error('upload failed');
  const sec = (performance.now() - t0) / 1000;
  return bytes / sec;
}

async function saveResult(dl, ul, ping, jitter){
  let ispInfo = '{}';
  try{
    const r = await fetch(ENDPOINTS.ip + '?n=' + Date.now());
    ispInfo = await r.text();
  } catch (e){ /* ispinfo optional */ }

  const form = new FormData();
  form.append('dl', dl.toFixed(2));
  form.append('ul', ul.toFixed(2));
  form.append('ping', ping.toFixed(2));
  form.append('jitter', jitter.toFixed(2));
  form.append('log', 'local-speedtest web frontend');
  form.append('ispinfo', ispInfo);

  const res = await fetch(ENDPOINTS.telemetry, { method: 'POST', body: form });
  const text = await res.text();
  // Backend replies: "id <uuid>"
  const m = text.match(/id\s+(\S+)/);
  return m ? m[1] : null;
}

function baseOrigin(){
  return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
}

async function runTest(){
  setRunning(true);
  statusEl.textContent = 'Measuring ping&hellip;';
  progressBar.style.width = '20%';

  const { ping, jitter } = await pingTest();

  statusEl.textContent = 'Testing download&hellip;';
  progressBar.style.width = '50%';
  const dl = await downloadTest();

  statusEl.textContent = 'Testing upload&hellip;';
  progressBar.style.width = '75%';
  const ul = await uploadTest();

  statusEl.textContent = 'Saving result&hellip;';
  progressBar.style.width = '90%';
  const id = await saveResult(dl, ul, ping, jitter);

  dlEl.textContent = fmtMbps(dl);
  ulEl.textContent = fmtMbps(ul);
  pingEl.textContent = fmtMs(ping);
  jitterEl.textContent = fmtMs(jitter);

  if (id){
    const resultUrl = baseOrigin() + '/results/?id=' + id;
    resultSummary.textContent =
      'Download ' + fmtMbps(dl) + ' Mbps  Upload ' + fmtMbps(ul) + ' Mbps  ' +
      'Ping ' + fmtMs(ping) + ' ms  Jitter ' + fmtMs(jitter) + ' ms';
    shareLink.value = resultUrl;
    openResult.href = resultUrl;
    openResult.textContent = 'Open result card (' + id + ') &rarr;';
    resultCard.hidden = false;
  }

  setRunning(false);
  statusEl.textContent = id ? 'Test complete.' : 'Test finished (result not saved).';
  progressBar.style.width = '100%';
}

function setRunning(running){
  if (startBtn){
    startBtn.disabled = running;
    startBtn.textContent = running ? 'Testing&hellip;' : 'Start Test';
  }
}

function initSpeedtestPage(){
  if (!startBtn) return;
  startBtn.addEventListener('click', () => {
    resultCard.hidden = true;
    progressBar.style.width = '0%';
    runTest().catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
      setRunning(false);
    });
  });
  if (copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(shareLink.value);
        const before = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(()=> copyBtn.textContent = before, 1200);
      } catch(e){ shareLink.select(); document.execCommand('copy'); }
    });
  }
}

async function initResultsPageView(){
  const statusEl2 = document.getElementById('resultStatus');
  const gauges = document.getElementById('gauges');
  const rDl = document.getElementById('rDl');
  const rUl = document.getElementById('rUl');
  const rPing = document.getElementById('rPing');
  const rJitter = document.getElementById('rJitter');
  const rMeta = document.getElementById('rMeta');
  const rCard = document.getElementById('rCard');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id){
    statusEl2.textContent = 'No result id provided. Use /results/?id=<id>';
    return;
  }
  try{
    const res = await fetch(ENDPOINTS.json + '?id=' + id + '&n=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('result not found');
    const data = await res.json();
    rDl.textContent = data.download || '--';
    rUl.textContent = data.upload || '--';
    rPing.textContent = data.ping || '--';
    rJitter.textContent = data.jitter || '--';
    rMeta.textContent = (data.ispinfo ? data.ispinfo + '  •  ' : '') + (data.timestamp || '');
    rCard.src = ENDPOINTS.card + '?id=' + id;
    gauges.hidden = false;
    rCard.hidden = false;
    statusEl2.hidden = true;
  } catch (e){
    statusEl2.textContent = 'Could not load result: ' + e.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (isResultsPage) initResultsPageView(); else initSpeedtestPage();
});
