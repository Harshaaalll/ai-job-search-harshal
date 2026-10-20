"""Tests for the dashboard server's opt-in network access (dashboard/server.py).

The server was localhost-only with no auth. The mobile app needs it reachable from a phone,
so a bearer token now guards /api and /files, and a non-loopback bind without a token must
refuse to start. These pin that: an exposed server can never be left open by mistake.
"""
import json
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "dashboard"))
import server  # noqa: E402


class Loopback(unittest.TestCase):
    def test_loopback_hosts(self):
        for host in ("127.0.0.1", "::1", "localhost"):
            self.assertTrue(server.is_loopback(host), host)

    def test_exposed_hosts(self):
        for host in ("0.0.0.0", "192.168.1.20", "100.64.0.5", "myhost.local"):
            self.assertFalse(server.is_loopback(host), host)


class Authorized(unittest.TestCase):
    def test_no_token_means_open(self):
        self.assertTrue(server.authorized(None, None))

    def test_token_required(self):
        self.assertFalse(server.authorized(None, "s3cret-token-value"))
        self.assertFalse(server.authorized("", "s3cret-token-value"))

    def test_exact_bearer_only(self):
        tok = "s3cret-token-value"
        self.assertTrue(server.authorized(f"Bearer {tok}", tok))
        self.assertFalse(server.authorized(f"Bearer {tok}x", tok))
        self.assertFalse(server.authorized(f"bearer {tok}", tok))
        self.assertFalse(server.authorized(tok, tok))


class MainRefusesUnsafeBind(unittest.TestCase):
    def test_exposed_without_token_exits(self):
        with mock.patch.object(server, "HOST", "0.0.0.0"), mock.patch.object(server, "TOKEN", None):
            with self.assertRaises(SystemExit) as cm:
                server.main()
        self.assertIn("JOB_DASHBOARD_TOKEN", str(cm.exception))

    def test_exposed_with_short_token_exits(self):
        with mock.patch.object(server, "HOST", "0.0.0.0"), mock.patch.object(server, "TOKEN", "short"):
            with self.assertRaises(SystemExit):
                server.main()


class Http(unittest.TestCase):
    TOKEN = "s3cret-token-value"

    def setUp(self):
        self.patches = [mock.patch.object(server, "TOKEN", self.TOKEN),
                        mock.patch.object(server, "STATE", Path("nonexistent-state.json")),
                        mock.patch.object(server, "TRACKER", Path("nonexistent-tracker.csv")),
                        mock.patch.object(server, "STATUS", Path("nonexistent-status.json"))]
        for p in self.patches:
            p.start()
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.srv.server_address[1]}"

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        for p in self.patches:
            p.stop()

    def get(self, path, token=None):
        req = urllib.request.Request(self.base + path)
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        try:
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.status, json.load(r)
        except urllib.error.HTTPError as e:
            return e.code, json.load(e)

    def test_state_needs_token(self):
        self.assertEqual(self.get("/api/state")[0], 401)
        self.assertEqual(self.get("/api/state", "wrong-token-value-x")[0], 401)

    def test_state_with_token(self):
        status, body = self.get("/api/state", self.TOKEN)
        self.assertEqual(status, 200)
        self.assertEqual(body["jobs"], [])

    def test_files_and_detail_need_token(self):
        self.assertEqual(self.get("/files/cv/main_example.tex")[0], 401)
        self.assertEqual(self.get("/api/detail?key=x")[0], 401)

    def test_detail_unknown_job_is_404(self):
        self.assertEqual(self.get("/api/detail?key=nope", self.TOKEN)[0], 404)

    def test_post_needs_token(self):
        req = urllib.request.Request(self.base + "/api/action", data=b'{"action":"run"}', method="POST",
                                     headers={"X-Job-Dashboard": "1", "Content-Type": "application/json"})
        with self.assertRaises(urllib.error.HTTPError) as cm:
            urllib.request.urlopen(req, timeout=5)
        self.assertEqual(cm.exception.code, 401)


class JobDetail(unittest.TestCase):
    def test_job_without_slug_returns_note_not_network_call(self):
        state = {"seen": {"k": {"title": "t", "company": "c", "skills": ["python"]}}}
        with mock.patch.object(server, "load_json", return_value=state), \
                mock.patch.object(server, "urlopen", side_effect=AssertionError("no network")):
            out = server.job_detail("k")
        self.assertIsNone(out["description"])
        self.assertEqual(out["skills"], ["python"])

    def test_bad_slug_never_reaches_the_url(self):
        state = {"seen": {"k": {"slug": "../../etc/passwd"}}}
        with mock.patch.object(server, "load_json", return_value=state), \
                mock.patch.object(server, "urlopen", side_effect=AssertionError("no network")):
            self.assertIsNone(server.job_detail("k")["description"])


if __name__ == "__main__":
    unittest.main()
