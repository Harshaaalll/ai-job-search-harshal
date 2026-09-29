"""Guards for the claim-auditor agent, /refer, /mock and the offer-evaluator skill.

These are prompt specs, so the tests pin the properties that keep them safe and useful:
read-only auditing, never sending messages, personal data written only to gitignored paths,
and the candidate's own rules (10 LPA fixed-pay floor, 30-day notice, bond tolerance unknown).
"""
import re
import subprocess
import unittest
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
AUDITOR = REPO / ".claude" / "agents" / "claim-auditor.md"
REFER = REPO / ".claude" / "commands" / "refer.md"
MOCK = REPO / ".claude" / "commands" / "mock.md"
OFFER = REPO / ".claude" / "skills" / "offer-evaluator" / "SKILL.md"
TRIAGE = REPO / ".claude" / "skills" / "pipeline-triage" / "SKILL.md"


def frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    end = text.find("\n---", 4)
    return yaml.safe_load(text[4:end])


def gitignored(rel: str) -> bool:
    return subprocess.run(["git", "check-ignore", "-q", rel], cwd=REPO).returncode == 0


class ClaimAuditorTests(unittest.TestCase):
    def test_agent_is_read_only(self):
        fm = frontmatter(AUDITOR)
        self.assertEqual(fm["name"], "claim-auditor")
        tools = {t.strip() for t in fm["tools"].split(",")}
        self.assertEqual(tools, {"Read", "Grep", "Glob"})
        for forbidden in ("Edit", "Write", "Bash", "WebFetch", "WebSearch"):
            self.assertNotIn(forbidden, tools)

    def test_statuses_sources_and_known_traps(self):
        text = AUDITOR.read_text(encoding="utf-8")
        for status in ("SUPPORTED", "UNSUPPORTED", "CONTRADICTED", "EXTERNAL"):
            self.assertIn(f"**{status}**", text)
        self.assertIn("01-candidate-profile.md", text)
        self.assertIn("cv/main_example.tex", text)
        for trap in ("34-check", "Odoo 19", "fixed", "CGPA"):
            self.assertIn(trap, text)

    def test_pipeline_triage_uses_the_auditor(self):
        text = TRIAGE.read_text(encoding="utf-8")
        self.assertIn("subagent_type: claim-auditor", text)
        self.assertIn("Agent", frontmatter(TRIAGE)["allowed-tools"])


class ReferCommandTests(unittest.TestCase):
    def setUp(self):
        self.text = REFER.read_text(encoding="utf-8")

    def test_header_and_never_sends(self):
        self.assertTrue(self.text.lstrip().startswith("# /refer"))
        self.assertIn("Never send", self.text)
        self.assertRegex(self.text, r"never open or scrape LinkedIn people pages")

    def test_connection_note_limit_is_counted_by_a_tool(self):
        self.assertIn("at most 200 characters", self.text)
        self.assertIn("len", self.text)

    def test_output_path_is_gitignored(self):
        self.assertIn("documents/applications/<company>_<role>/referral_messages.md", self.text)
        self.assertTrue(gitignored("documents/applications/acme_ml/referral_messages.md"))


class MockCommandTests(unittest.TestCase):
    def test_one_question_at_a_time_and_saved_privately(self):
        text = MOCK.read_text(encoding="utf-8")
        self.assertTrue(text.lstrip().startswith("# /mock"))
        self.assertIn("Ask **one** question, then stop and wait", text)
        self.assertIn("Never answer for the candidate", text)
        self.assertIn("mock_<YYYY-MM-DD>.md", text)
        self.assertTrue(gitignored("documents/applications/acme_ml/mock_2026-10-01.md"))


class OfferEvaluatorTests(unittest.TestCase):
    def setUp(self):
        self.text = OFFER.read_text(encoding="utf-8")

    def test_frontmatter(self):
        fm = frontmatter(OFFER)
        self.assertEqual(fm["name"], "offer-evaluator")
        self.assertIn("offer", fm["description"].lower())

    def test_candidate_rules(self):
        self.assertRegex(self.text, r"fixed pay >= INR 10 LPA")
        self.assertIn("Judge on fixed pay, not CTC", self.text)
        self.assertIn("bond tolerance is **not recorded** - ask", self.text)
        self.assertIn("30-day notice", self.text)

    def test_tax_is_looked_up_not_hardcoded(self):
        self.assertIn("look up the **current** new-regime slabs", self.text)
        self.assertIsNone(re.search(r"\d+\s*-\s*\d+\s*lakh\s*:\s*\d+%", self.text), "no hard-coded slab table")

    def test_writes_only_to_gitignored_path(self):
        self.assertIn("documents/applications/<company>_<role>/offer_evaluation.md", self.text)
        self.assertTrue(gitignored("documents/applications/acme_ml/offer_evaluation.md"))
        self.assertIn("Never copy salary", self.text)


if __name__ == "__main__":
    unittest.main()
