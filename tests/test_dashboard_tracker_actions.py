"""Tests for the dashboard's tracker-row actions (status_row / followup_row in dashboard/server.py).

The mobile app updates application outcomes from the phone. These pin that it follows
/outcome's tracker rules: only canonical status spellings, notes free of commas, a row
leaving `drafted` takes today's date, other rows and columns untouched.
"""
import csv
import datetime as dt
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "dashboard"))
import server  # noqa: E402

ROWS = [
    {"date": "2026-10-01", "company": "Acme AI", "role": "ML Engineer", "status": "drafted", "notes": "",
     "cv_file": "cv/main_acme.tex", "deadline": "2026-11-01"},
    {"date": "2026-09-20", "company": "Acme AI", "role": "ML Engineer", "status": "applied", "notes": "older row"},
    {"date": "2026-09-25", "company": "Beta", "role": "Data Scientist", "status": "applied", "notes": "via referral"},
]


class TrackerActions(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.tracker = Path(self.dir.name) / "job_search_tracker.csv"
        with open(self.tracker, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=server.HEADER, extrasaction="ignore")
            w.writeheader()
            w.writerows(ROWS)
        self.patch = mock.patch.object(server, "TRACKER", self.tracker)
        self.patch.start()
        self.today = dt.date.today().isoformat()

    def tearDown(self):
        self.patch.stop()
        self.dir.cleanup()

    def rows(self):
        return server.read_tracker()[1]

    def test_drafted_row_moves_to_applied_with_todays_date(self):
        server.set_row_status("Acme AI", "ML Engineer", "2026-10-01", "applied")
        r = self.rows()[0]
        self.assertEqual((r["status"], r["date"]), ("applied", self.today))
        self.assertEqual(r["notes"], f"applied {self.today}")
        self.assertEqual((r["cv_file"], r["deadline"]), ("cv/main_acme.tex", "2026-11-01"))

    def test_date_picks_the_right_duplicate_and_keeps_its_date(self):
        server.set_row_status("Acme AI", "ML Engineer", "2026-09-20", "interview", "round 1, on Friday")
        rows = self.rows()
        self.assertEqual(rows[0]["status"], "drafted")
        self.assertEqual((rows[1]["status"], rows[1]["date"]), ("interview", "2026-09-20"))
        self.assertEqual(rows[1]["notes"], f"older row; interview {self.today} - round 1 on Friday")

    def test_non_canonical_status_is_refused(self):
        for bad in ("no response", "Interview", "ghosted"):
            with self.assertRaises(ValueError):
                server.set_row_status("Beta", "Data Scientist", "2026-09-25", bad)
        self.assertEqual(self.rows()[2]["status"], "applied")

    def test_unknown_row_is_key_error(self):
        with self.assertRaises(KeyError):
            server.set_row_status("Nope", "ML Engineer", "2026-10-01", "applied")

    def test_followup_marker(self):
        server.log_followup("Beta", "Data Scientist", "2026-09-25")
        r = self.rows()[2]
        self.assertEqual(r["notes"], f"via referral; followed up {self.today}")
        self.assertEqual(r["status"], "applied")


if __name__ == "__main__":
    unittest.main()
