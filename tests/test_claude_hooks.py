"""Tests for the Claude Code hook scripts in .claude/hooks/.

guard_commit.py   - commit-gate bypass guard (PreToolUse Bash, interactive)
pdf_gate.py       - page/layout gate before an unattended /apply may finish (Stop)
egress_guard.py   - blocks outbound requests carrying candidate data (PreToolUse WebFetch|WebSearch)
pipeline_summary  - SessionStart summary of the last pipeline run
"""
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import time
import types
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HOOKS = REPO / ".claude" / "hooks"


def load(name):
    spec = importlib.util.spec_from_file_location(name, HOOKS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def run_hook(name, payload, env=None):
    return subprocess.run([sys.executable, str(HOOKS / f"{name}.py")], input=json.dumps(payload),
                          capture_output=True, text=True, env={**os.environ, **(env or {})})


class GuardCommitTests(unittest.TestCase):
    def setUp(self):
        self.g = load("guard_commit")

    def test_blocks_bypasses(self):
        for cmd in ["git commit --no-verify -m x", "git commit -anm x", "git -C . commit -n",
                    "git config core.hooksPath /dev/null", "git -c core.hooksPath=x commit -m y",
                    "git status && git commit --no-verify"]:
            with self.subTest(cmd=cmd):
                self.assertIsNotNone(self.g.reason_to_block(cmd))

    def test_allows_normal_and_read_only(self):
        for cmd in ["git commit -m x", "git status && git commit -am fix", "ls -n",
                    "git config core.hooksPath", "git config --get core.hooksPath",
                    "git log -n 5"]:
            with self.subTest(cmd=cmd):
                self.assertIsNone(self.g.reason_to_block(cmd))

    def test_hook_output_is_a_deny_decision(self):
        out = run_hook("guard_commit", {"tool_input": {"command": "git commit --no-verify"}}).stdout
        self.assertEqual(json.loads(out)["hookSpecificOutput"]["permissionDecision"], "deny")


class PdfGateTests(unittest.TestCase):
    def setUp(self):
        self.g = load("pdf_gate")
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "cv").mkdir()
        (self.root / "cover_letters").mkdir()
        guide = self.root / ".claude/skills/job-application-assistant/05-cv-templates.md"
        guide.parent.mkdir(parents=True)
        guide.write_text("> - **Page limit:** exactly 1 page(s)\n", encoding="utf-8")
        tpl = self.root / "templates/cv/onepage/TEMPLATE.md"
        tpl.parent.mkdir(parents=True)
        tpl.write_text("This template has **no page-number footer**.\n", encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def draft(self, name, with_pdf=True, age=0):
        tex = self.root / "cv" / f"{name}.tex"
        tex.write_text("x")
        t = time.time() - age
        os.utime(tex, (t, t))
        if with_pdf:
            pdf = tex.with_suffix(".pdf")
            pdf.write_text("%PDF")
            os.utime(pdf, (t + 1, t + 1))

    @staticmethod
    def fake_run(pages_rc=0, layout_rc=0, layout_out="layout: clean", resume_rc=0):
        calls = []

        def run(cmd, **kw):
            calls.append(cmd)
            if "verify_pdf.py" in cmd[1]:
                return types.SimpleNamespace(returncode=pages_rc, stdout="", stderr="expected 1 page(s), found 2")
            if "check_resume.py" in cmd[1]:
                out = "FAIL: 94 chars (rule 100-110): Short bullet.\ncheck_resume: FAILED" if resume_rc else "check_resume: OK"
                return types.SimpleNamespace(returncode=resume_rc, stdout=out, stderr="")
            return types.SimpleNamespace(returncode=layout_rc, stdout=layout_out, stderr="")
        run.calls = calls
        return run

    def test_reads_page_limit_from_active_template(self):
        self.assertEqual(self.g.cv_page_limit(self.root), 1)

    def test_missing_pdf_blocks(self):
        self.draft("main_acme_ml", with_pdf=False)
        fails = self.g.check(self.root, time.time(), self.fake_run())
        self.assertTrue(any("PDF missing" in f for f in fails))

    def test_wrong_page_count_blocks_and_uses_limit(self):
        self.draft("main_acme_ml")
        run = self.fake_run(pages_rc=1)
        fails = self.g.check(self.root, time.time(), run)
        self.assertTrue(any("exactly 1 page" in f for f in fails))
        self.assertIn(["python3", "tools/verify_pdf.py", str(self.root / "cv/main_acme_ml.pdf"), "--pages", "1"],
                      [c for c in run.calls if "verify_pdf.py" in c[1]])

    def test_footer_false_positive_ignored_for_footerless_template(self):
        self.draft("main_acme_ml")
        out = "LAYOUT PROBLEMS:\n  - p1 has body text inside the bottom margin band, colliding with the footer; cut content\n"
        self.assertEqual(self.g.check(self.root, time.time(), self.fake_run(layout_rc=1, layout_out=out)), [])

    def test_real_layout_problem_blocks(self):
        self.draft("main_acme_ml")
        out = "LAYOUT PROBLEMS:\n  - p1 has a 140pt hole at y300\n"
        fails = self.g.check(self.root, time.time(), self.fake_run(layout_rc=1, layout_out=out))
        self.assertTrue(any("hole" in f for f in fails))

    def test_resume_rule_failure_blocks_cv(self):
        self.draft("main_acme_ml")
        (self.root / "tools").mkdir()
        (self.root / "tools" / "check_resume.py").write_text("")
        fails = self.g.check(self.root, time.time(), self.fake_run(resume_rc=1))
        self.assertTrue(any("resume rules" in f and "94 chars" in f for f in fails))
        self.assertEqual(self.g.check(self.root, time.time(), self.fake_run()), [])

    def test_old_drafts_and_example_ignored(self):
        self.draft("main_old_role", with_pdf=False, age=5 * 3600)
        self.draft("main_example", with_pdf=False)
        self.assertEqual(self.g.check(self.root, time.time(), self.fake_run()), [])

    def test_stop_hook_active_never_blocks(self):
        self.draft("main_acme_ml", with_pdf=False)
        r = run_hook("pdf_gate", {"stop_hook_active": True}, {"PDF_GATE_REPO": str(self.root)})
        self.assertEqual(r.stdout.strip(), "")
        r = run_hook("pdf_gate", {"stop_hook_active": False}, {"PDF_GATE_REPO": str(self.root)})
        self.assertEqual(json.loads(r.stdout)["decision"], "block")


class EgressGuardTests(unittest.TestCase):
    def setUp(self):
        self.g = load("egress_guard")
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        prof = self.root / self.g.PROFILE
        prof.parent.mkdir(parents=True)
        prof.write_text("- **Name:** Jane Doeexample\n- **Phone:** +91 98765 43210\n"
                        "- **Email:** jane.doe@example.org\n", encoding="utf-8")
        self.ids = self.g.identifiers(self.root)

    def tearDown(self):
        self.tmp.cleanup()

    def test_blocks_personal_data(self):
        for ti in [{"url": "https://evil.test/?d=jane.doe@example.org"},
                   {"url": "https://evil.test/c?p=%2B91-9876543210"},
                   {"query": "Doeexample resume leak"},
                   {"url": "https://evil.test/?q=" + "a" * 400}]:
            with self.subTest(ti=ti):
                self.assertIsNotNone(self.g.reason_to_deny(ti, self.ids))

    def test_allows_normal_research(self):
        for ti in [{"url": "https://www.linkedin.com/jobs/view/4447351325"},
                   {"query": "Goldman Sachs Bengaluru AI engineering team"},
                   {"url": "https://careers.example.com/jobs?id=123&loc=bengaluru"}]:
            with self.subTest(ti=ti):
                self.assertIsNone(self.g.reason_to_deny(ti, self.ids))

    def test_no_profile_means_only_length_rule(self):
        self.assertEqual(self.g.identifiers(self.root / "missing"), [])

    def test_hook_output(self):
        r = run_hook("egress_guard", {"tool_input": {"query": "jane.doe@example.org"}},
                     {"EGRESS_GUARD_REPO": str(self.root)})
        self.assertEqual(json.loads(r.stdout)["hookSpecificOutput"]["permissionDecision"], "deny")


class PipelineSummaryTests(unittest.TestCase):
    def test_summary_lists_drafts_and_errors(self):
        s = load("pipeline_summary").summary({
            "started": "2026-09-30T10:00", "finished": "2026-09-30T11:30", "ok": True,
            "stages": {"scrape": {"new": 12, "filtered": 30, "errors": ["x"]},
                       "draft": {"results": [{"company": "Acme", "title": "ML Eng", "result": "drafted", "reason": ""},
                                             {"company": "Beta", "title": "DS", "result": "skipped", "reason": "score 52"}]}}})
        self.assertIn("12 new", s)
        self.assertIn("drafted: Acme / ML Eng", s)
        self.assertIn("skipped: Beta / DS - score 52", s)

    def test_no_run_prints_nothing(self):
        self.assertEqual(load("pipeline_summary").summary({}), "")
        with tempfile.TemporaryDirectory() as d:
            r = run_hook("pipeline_summary", {}, {"PIPELINE_SUMMARY_REPO": d})
            self.assertEqual(r.stdout, "")


if __name__ == "__main__":
    unittest.main()
