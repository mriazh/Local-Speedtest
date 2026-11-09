#!/usr/bin/env python3
"""
docs/integrate_ost.py
Copies OpenSpeedTest assets into web/ and configures index.html for local Debian speedtest.
"""
import os
import shutil
import re

SOURCE_DIR = r"C:\Users\adima\AppData\Local\Temp\opencode\ost-clone"
WEB_DIR = "web"
ASSETS_SRC = os.path.join(SOURCE_DIR, "assets")
ASSETS_DST = os.path.join(WEB_DIR, "assets")
INDEX_SRC = os.path.join(SOURCE_DIR, "index.html")
INDEX_DST = os.path.join(WEB_DIR, "index.html")

print("1. Copying assets...")
if os.path.exists(ASSETS_DST):
    shutil.rmtree(ASSETS_DST)
shutil.copytree(ASSETS_SRC, ASSETS_DST)

print("2. Reading original index.html...")
with open(INDEX_SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Replace server list to point to local Debian endpoints
server_list_old = re.search(r"var openSpeedTestServerList\s*=\s*\[[^\]]+\];", content)
if server_list_old:
    new_servers = """var openSpeedTestServerList = [
    {"ServerName":"Local Debian Host", "Download":"garbage", "Upload":"empty", "ServerIcon":"DefaultIcon"}
  ];"""
    content = content.replace(server_list_old.group(0), new_servers)

# Set ping settings
content = re.sub(r'var pingMethod\s*=\s*"[^"]+";', 'var pingMethod = "GET";', content)
content = re.sub(r'var pingFile\s*=\s*"[^"]+";', 'var pingFile = "Upload";', content)
content = re.sub(r'var dlDuration\s*=\s*\d+;', 'var dlDuration = 10;', content)
content = re.sub(r'var ulDuration\s*=\s*\d+;', 'var ulDuration = 10;', content)

# Add our sleek floating share card CSS and telemetry script before </body>
share_snippet = """
<!-- Local Speedtest Result & Share Overlay -->
<style>
.share-modal {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid #334155;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  border-radius: 16px;
  padding: 18px 24px;
  color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 90%;
  width: 520px;
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.share-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.share-modal-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #38bdf8;
}
.share-input-row {
  display: flex;
  gap: 8px;
}
.share-input {
  flex: 1;
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  color: #cbd5e1;
  padding: 10px 12px;
  font-size: 0.85rem;
}
.share-btn {
  background: #0284c7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.share-btn:hover {
  background: #0369a1;
}
.share-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}
.share-links a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}
.share-links a:hover {
  text-decoration: underline;
}
</style>

<div id="localShareCard" class="share-modal" style="display:none;">
  <div class="share-modal-head">
    <div class="share-modal-title">Speedtest Result Saved</div>
    <div style="font-size:0.75rem; color:#94a3b8;">SQLite Telemetry Active</div>
  </div>
  <div class="share-input-row">
    <input id="shareUrlInput" class="share-input" readonly>
    <button id="copyShareBtn" class="share-btn" type="button">Copy Link</button>
  </div>
  <div class="share-links">
    <a id="viewPngLink" target="_blank" rel="noopener">Open PNG Card &rarr;</a>
    <span style="color:#64748b;">speedtest.mriazh.my.id</span>
  </div>
</div>

<script>
(function() {
  function sendLocalTelemetry(d, u, p, j) {
    var fd = new FormData();
    fd.append("dl", d);
    fd.append("ul", u);
    fd.append("ping", p);
    fd.append("jitter", j);
    fd.append("log", "OpenSpeedTest LAN");
    fd.append("ispinfo", "{}");

    fetch("/results/telemetry", { method: "POST", body: fd })
      .then(function(r) { return r.text(); })
      .then(function(txt) {
        var m = txt.match(/id\\s+(\\S+)/);
        if (m && m[1]) {
          var id = m[1];
          var url = window.location.protocol + "//" + window.location.host + "/results/?id=" + id;
          document.getElementById("shareUrlInput").value = url;
          document.getElementById("viewPngLink").href = url;
          document.getElementById("localShareCard").style.display = "flex";
        }
      })
      .catch(function(err) { console.error("Telemetry failed:", err); });
  }

  // Monitor the SVG results link for test completion
  var observer = new MutationObserver(function() {
    var appObj = document.getElementById("OpenSpeedTest-UI");
    if (!appObj || !appObj.contentDocument) return;
    var resElem = appObj.contentDocument.getElementById("resultsData");
    if (resElem) {
      var href = resElem.getAttributeNS("http://www.w3.org/1999/xlink", "href") || resElem.getAttribute("href");
      if (href && href.indexOf("d=") !== -1 && !resElem.dataset.captured) {
        resElem.dataset.captured = "true";
        var params = new URLSearchParams(href.split("?")[1]);
        var d = params.get("d") || "0";
        var u = params.get("u") || "0";
        var p = params.get("p") || "0";
        var j = params.get("j") || "0";
        sendLocalTelemetry(d, u, p, j);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(function() {
    var appObj = document.getElementById("OpenSpeedTest-UI");
    if (appObj && appObj.contentDocument) {
      observer.observe(appObj.contentDocument, { attributes: true, subtree: true });
    }
  }, 1000);

  document.getElementById("copyShareBtn").addEventListener("click", function() {
    var inp = document.getElementById("shareUrlInput");
    inp.select();
    navigator.clipboard.writeText(inp.value).then(function() {
      var b = document.getElementById("copyShareBtn");
      b.textContent = "Copied!";
      setTimeout(function() { b.textContent = "Copy Link"; }, 1500);
    });
  });
})();
</script>
"""

content = content.replace("</body>", share_snippet + "\n</body>")

print("3. Writing modified index.html to web/...")
with open(INDEX_DST, "w", encoding="utf-8") as f:
    f.write(content)

print("4. Updating config/settings.toml...")
settings_file = os.path.join("config", "settings.toml")
if os.path.exists(settings_file):
    with open(settings_file, "r", encoding="utf-8") as f:
        cfg = f.read()
    cfg = cfg.replace('assets_path = ""', 'assets_path = "web"')
    with open(settings_file, "w", encoding="utf-8") as f:
        f.write(cfg)

print("Integration complete!")
