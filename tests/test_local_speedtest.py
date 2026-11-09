#!/usr/bin/env python3
"""
tests/test_local_speedtest.py — Automated verification for Local Speedtest.

Verifies the LibreSpeed Go backend HTTP endpoints:
  * GET  /getIP             — client IP (health/connectivity)
  * POST /results/telemetry — save a test result, returns "id <uuid>"
  * GET  /results/json?id=  — rendered JSON metrics for a result
  * GET  /results?id=       — PNG result card
  * GET  /                  — frontend index.html

Intended to run against a running backend on Debian (e.g. after deploy.sh).
Usage:
  python3 tests/test_local_speedtest.py                 # http://127.0.0.1:8989
  python3 tests/test_local_speedtest.py --host <ip> --port 8989
"""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlencode

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8989


def base_url(host, port):
    return f"http://{host}:{port}"


def request(method, url, data=None, timeout=15):
    headers = {}
    body = None
    if data is not None:
        if isinstance(data, dict):
            body = urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = data
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read(), resp.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers.get("Content-Type", "")


def check(name, cond, detail=""):
    status = "PASS" if cond else "FAIL"
    print(f"[{status}] {name}" + (f" — {detail}" if detail else ""))
    return cond


def main():
    ap = argparse.ArgumentParser(description="Verify Local Speedtest HTTP endpoints")
    ap.add_argument("--host", default=DEFAULT_HOST)
    ap.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = ap.parse_args()

    base = base_url(args.host, args.port)
    passed = 0
    total = 0

    def t(name, cond, detail=""):
        nonlocal passed, total
        total += 1
        if check(name, cond, detail):
            passed += 1

    # 1. Frontend index.html served.
    st, body, ct = request("GET", base + "/")
    t("GET / serves frontend", st == 200 and b"<html" in body.lower(),
      f"status={st} ct={ct}")

    # 2. Health / client IP endpoint.
    st, body, ct = request("GET", base + "/getIP")
    t("GET /getIP returns client IP", st == 200 and b"processedstring" in body.lower(),
      f"status={st} body={body[:120]!r}")

    # 3. Telemetry: save a result, expect "id <uuid>".
    payload = {
        "dl": "100.5",
        "ul": "50.25",
        "ping": "5.5",
        "jitter": "1.2",
        "log": "verification test",
        "ispinfo": "{}",
    }
    st, body, ct = request("POST", base + "/results/telemetry", data=payload)
    text = body.decode(errors="replace")
    result_id = None
    if st == 200:
        parts = text.split()
        if len(parts) == 2 and parts[0] == "id":
            result_id = parts[1]
    t("POST /results/telemetry returns id", st == 200 and result_id is not None,
      f"status={st} body={text!r}")

    # 4. JSON metrics for the saved result.
    if result_id:
        st, body, ct = request("GET", base + "/results/json?" + urlencode({"id": result_id}))
        try:
            data = json.loads(body.decode())
            ok = st == 200 and all(k in data for k in ("timestamp", "download", "upload", "ping", "jitter"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            data = {}
            ok = False
        t("GET /results/json?id= returns metrics", ok,
          f"status={st} body={body[:120]!r}")
    else:
        t("GET /results/json?id= returns metrics", False, "skipped (no id)")
        total -= 1  # don't count skipped as a failure

    # 5. PNG result card for the saved result.
    if result_id:
        st, body, ct = request("GET", base + "/results?id=" + result_id)
        t("GET /results?id= returns PNG card", st == 200 and ct.startswith("image/png"),
          f"status={st} ct={ct} len={len(body)}")
    else:
        t("GET /results?id= returns PNG card", False, "skipped (no id)")
        total -= 1

    print(f"\n{passed}/{total} checks passed")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
