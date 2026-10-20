#!/usr/bin/env python3
"""Live job-search dashboard: http://127.0.0.1:8787

Reads job_scraper/seen_jobs.json, job_search_tracker.csv and
job_scraper/pipeline_status.json on every request, so it always shows the
current state. Standard library only. Binds to localhost.

Actions (POST /api/action, JSON body {"action": ..., ...}):
  applied_row {company, role}  same, for a tracker row with no matching scraped job
  applied   {key}          you submitted it: tracker row -> status `applied`
                           (the /apply `drafted` row is updated, or a new row is added)
  dismiss   {key}          hide a job from the lists
  restore   {key}          undo dismiss
  queue     {key}          add to the drafting queue for the next pipeline run
  unqueue   {key}
  run       {}             start the pipeline now (systemd user service)

Phone / LAN access (the React Native app in mobile/) is opt-in: set JOB_DASHBOARD_HOST to a
non-loopback address AND JOB_DASHBOARD_TOKEN (16+ chars). Every /api and /files request then
needs `Authorization: Bearer <token>`; the server refuses to start on a non-loopback address
without a token. With a token set the bundled web page cannot authenticate, so run a second
localhost-only instance (no token) for the browser dashboard. Serve it over a private network
(Tailscale / WireGuard); the token is sent in clear text over plain HTTP.

  GET /api/detail?key=...   full posting text + skills for a freehire job (proxied from freehire.me)
"""
import csv
import datetime as dt
import hmac
import ipaddress
import json
import mimetypes
import os
import re
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
from urllib.request import Request, urlopen

REPO = Path(__file__).resolve().parent.parent
STATE = REPO / "job_scraper" / "seen_jobs.json"
STATUS = REPO / "job_scraper" / "pipeline_status.json"
TRACKER = REPO / "job_search_tracker.csv"
INDEX = Path(__file__).resolve().parent / "index.html"
FILE_ROOTS = [REPO / "cv", REPO / "cover_letters"]
HEADER = ["date", "company", "sector", "role", "role_type", "channel", "status", "contact_person",
          "fit_rating", "notes", "cv_file", "cover_letter_file", "source", "deadline"]
PORT = int(os.environ.get("JOB_DASHBOARD_PORT", "8787"))
HOST = os.environ.get("JOB_DASHBOARD_HOST", "127.0.0.1")
TOKEN = os.environ.get("JOB_DASHBOARD_TOKEN") or None
MIN_TOKEN_LEN = 16
FREEHIRE_API = os.environ.get("FREEHIRE_API_URL", "https://freehire.me")
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]{0,200}$")


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save_json(path, data):
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def read_tracker():
    if not TRACKER.exists():
        return HEADER, []
    with open(TRACKER, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        return (r.fieldnames or HEADER), list(r)


def write_tracker(fields, rows):
    tmp = TRACKER.with_suffix(".csv.tmp")
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    os.replace(tmp, TRACKER)


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def csv_safe(s):
    return re.sub(r"[,\n\r\"]+", " ", s or "").strip()


def is_loopback(host):
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return host == "localhost"


def authorized(header, token):
    """True when no token is configured, or `header` is exactly `Bearer <token>` (constant-time compare)."""
    if token is None:
        return True
    prefix = "Bearer "
    return bool(header) and header.startswith(prefix) and hmac.compare_digest(header[len(prefix):], token)


def job_detail(key):
    """Full posting text for a freehire job, proxied from freehire.me by the stored slug."""
    e = load_json(STATE, {"seen": {}}).get("seen", {}).get(key)
    if not e:
        raise KeyError(key)
    slug = e.get("slug")
    if not slug or not SLUG.match(slug):
        return {"description": None, "skills": e.get("skills") or [], "note": "no freehire slug for this job"}
    req = Request(f"{FREEHIRE_API}/api/v1/jobs/{slug}", headers={"User-Agent": "ai-job-search-dashboard"})
    with urlopen(req, timeout=10) as resp:
        data = json.load(resp).get("data") or {}
    text = re.sub(r"<(?:br|/p|/li|/h\d)\s*/?>", "\n", data.get("description") or "")
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return {"description": re.sub(r"\n{3,}", "\n\n", text).strip() or None,
            "skills": data.get("skills") or e.get("skills") or []}


def systemd_next_run():
    try:
        out = subprocess.run(["systemctl", "--user", "list-timers", "ai-job-pipeline.timer",
                              "--no-pager", "--output=json"], capture_output=True, text=True, timeout=5)
        data = json.loads(out.stdout or "[]")
        if data and data[0].get("next"):
            return dt.datetime.fromtimestamp(data[0]["next"] / 1e6).isoformat(timespec="minutes")
    except Exception:
        pass
    return None


def build_state():
    seen = load_json(STATE, {"seen": {}}).get("seen", {})
    fields, rows = read_tracker()
    all_status = {r.get("status") for r in rows}
    jobs = []
    for key, v in seen.items():
        if v.get("status") == "skipped" and not v.get("apply_queue"):
            continue
        match = find_rows(rows, v, all_status)
        row = match[-1] if match else None
        jobs.append({**v, "key": key, "tracker_status": row.get("status") if row else None,
                     "tracker_source": row.get("source") if row else None})
    return {
        "jobs": jobs,
        "tracker": rows,
        "status": load_json(STATUS, {}),
        "next_run": systemd_next_run(),
        "counts": {"seen_total": len(seen)},
        "now": dt.datetime.now().isoformat(timespec="seconds"),
    }


def url_id(u):
    """Comparable form of a posting URL: LinkedIn job id, else the URL without query string."""
    m = re.search(r"linkedin\.com/jobs/view/(?:[^/?]*-)?(\d+)", u or "")
    return m.group(1) if m else (u or "").split("?")[0].rstrip("/")


def find_rows(rows, e, statuses):
    """Tracker rows for a scraped job. /apply names the role in its own words, so match on
    the posting URL first, then company+role, then the company's only row with that status."""
    cand = [r for r in rows if r.get("status") in statuses]
    by_url = [r for r in cand if r.get("source") and url_id(r["source"]) == url_id(e.get("url"))]
    if by_url:
        return by_url
    by_role = [r for r in cand if norm(r.get("company")) == norm(e["company"]) and norm(r.get("role")) == norm(e["title"])]
    if by_role:
        return by_role
    same_co = [r for r in cand if norm(r.get("company")) == norm(e["company"])]
    return same_co if len(same_co) == 1 else []


def mark_applied(key):
    state = load_json(STATE, {"seen": {}})
    e = state["seen"].get(key)
    if not e:
        raise KeyError(key)
    fields, rows = read_tracker()
    if "deadline" not in fields:
        fields = list(fields) + ["deadline"]
    today = dt.date.today().isoformat()
    match = find_rows(rows, e, ("drafted", "applied"))
    if match:
        r = match[-1]
        if r.get("status") == "drafted":
            r["status"], r["date"] = "applied", today
    else:
        rows.append({"date": today, "company": csv_safe(e["company"]), "role": csv_safe(e["title"]),
                     "channel": "portal" if e.get("portal") else "online", "status": "applied",
                     "fit_rating": str(e.get("rank_score") or ""), "notes": "marked applied from dashboard",
                     "source": e.get("url", ""), "deadline": e.get("deadline") or ""})
    write_tracker(fields, rows)
    e["user_status"] = "applied"
    e.pop("apply_queue", None)
    save_json(STATE, state)


def mark_row_applied(company, role):
    fields, rows = read_tracker()
    match = [r for r in rows if norm(r.get("company")) == norm(company)
             and norm(r.get("role")) == norm(role) and r.get("status") == "drafted"]
    if not match:
        raise KeyError(f"{company} / {role}")
    match[-1]["status"], match[-1]["date"] = "applied", dt.date.today().isoformat()
    write_tracker(fields, rows)


def update_entry(key, action):
    state = load_json(STATE, {"seen": {}})
    e = state["seen"].get(key)
    if not e:
        raise KeyError(key)
    if action == "dismiss":
        e["user_status"] = "dismissed"
        e.pop("apply_queue", None)
    elif action == "restore":
        e.pop("user_status", None)
    elif action == "queue":
        e["apply_queue"] = max([v.get("apply_queue") or 0 for v in state["seen"].values()] + [0]) + 1
        e.pop("user_status", None)
        if e.get("pipeline_state") in ("skipped", "failed"):
            e.pop("pipeline_state", None)  # explicit re-queue retries it
    elif action == "unqueue":
        e.pop("apply_queue", None)
    save_json(STATE, state)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def send(self, code, body, ctype="application/json"):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def deny_unauthorized(self):
        if authorized(self.headers.get("Authorization"), TOKEN):
            return False
        self.send(401, {"error": "unauthorized"})
        return True

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path in ("/", "/index.html"):
            return self.send(200, INDEX.read_bytes(), "text/html; charset=utf-8")
        if path.startswith(("/api/", "/files/")) and self.deny_unauthorized():
            return
        if path == "/api/detail":
            try:
                return self.send(200, job_detail((parse_qs(parsed.query).get("key") or [""])[0]))
            except KeyError:
                return self.send(404, {"error": "unknown job"})
            except Exception as e:
                return self.send(502, {"error": f"detail lookup failed: {str(e)[:200]}"})
        if path == "/api/state":
            return self.send(200, build_state())
        if path.startswith("/files/"):
            target = (REPO / unquote(path[len("/files/"):])).resolve()
            if not any(target.is_relative_to(r) for r in FILE_ROOTS) or target.suffix not in (".pdf", ".tex"):
                return self.send(403, {"error": "forbidden"})
            if not target.exists():
                return self.send(404, {"error": "not found"})
            ctype = mimetypes.guess_type(target.name)[0] or "text/plain"
            return self.send(200, target.read_bytes(), ctype if target.suffix == ".pdf" else "text/plain; charset=utf-8")
        self.send(404, {"error": "not found"})

    def do_POST(self):
        if self.deny_unauthorized():
            return
        # Custom header = cheap CSRF guard: other sites can't set it without a CORS preflight we never answer.
        if self.headers.get("X-Job-Dashboard") != "1" or urlparse(self.path).path != "/api/action":
            return self.send(403, {"error": "forbidden"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0)) or 0) or b"{}")
            action = body.get("action")
            if action == "applied":
                mark_applied(body["key"])
            elif action == "applied_row":
                mark_row_applied(body["company"], body["role"])
            elif action in ("dismiss", "restore", "queue", "unqueue"):
                update_entry(body["key"], action)
            elif action == "run":
                subprocess.run(["systemctl", "--user", "start", "--no-block", "ai-job-pipeline.service"],
                               check=True, timeout=10)
            else:
                return self.send(400, {"error": f"unknown action {action!r}"})
            self.send(200, {"ok": True})
        except KeyError as e:
            self.send(404, {"error": f"unknown job {e}"})
        except Exception as e:
            self.send(500, {"error": str(e)[:300]})


def main():
    if not is_loopback(HOST) and (TOKEN is None or len(TOKEN) < MIN_TOKEN_LEN):
        sys.exit(f"refusing to bind {HOST}: set JOB_DASHBOARD_TOKEN to a secret of {MIN_TOKEN_LEN}+ characters")
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Job dashboard on http://{HOST}:{PORT}" + (" (token required)" if TOKEN else ""), flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    sys.exit(main())
