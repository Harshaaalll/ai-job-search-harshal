"""Tests for tools/check_resume.py (resume content rules for the fresher-onepage template)."""
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tools"))
import check_resume as cr  # noqa: E402

VERB_LIST = ["Shipped", "Gated", "Compressed", "Mined", "Modelled", "Reconciled", "Deployed", "Tuned",
             "Adapted", "Calibrated", "Streamlined", "Constructed", "Indexed", "Integrated", "Scraped",
             "Summarised", "Launched", "Structured", "Flagged", "Processed", "Orchestrated", "Evaluated",
             "Retrieved"]


def bullet(verb, n=105):
    body = f"{verb} a pipeline with a 98.6\\% recall metric and "
    rendered_len = len(cr.render(body))
    return body + "x" * (n - 1 - rendered_len) + "."


def cv(roles=None, projects=None, summary=None, skills=4, extra=""):
    verbs = iter(VERB_LIST)
    roles = roles or [("AI Engineer - OTO Capital", 4), ("Data \\& Analytics Consultant - Goel Exports", 2),
                      ("Data Science Intern - Standard Chartered Global Business Services", 5),
                      ("Machine Learning Engineer Intern - DG Liger Consulting", 3)]
    projects = projects or [("Sanwaad --- Multi-Agent Evals", 3), ("Medical Bill OCR --- LLM Extraction", 3),
                            ("Multilingual ASR --- Speech AI", 3)]
    summary = summary or "AI engineer building agents. Cut prompt tokens 79\\%. Keen to build agents for Acme."
    parts = [r"\section{Professional Summary}", summary, r"\section{Skills}"]
    parts += [r"\skillrow{Cat%d}{a, b, c}" % i for i in range(skills)]
    parts.append(r"\section{Work Experience}")
    for title, n in roles:
        parts.append(r"\entry{%s}{Aug 2026 - Present}" % title + "\n\\begin{itemize}")
        parts += [r"  \item {%s}" % bullet(next(verbs)) for _ in range(n)]
        parts.append(r"\end{itemize}")
    parts.append(r"\section{Technical Projects}")
    for title, n in projects:
        parts.append(r"\project{%s}{2026}" % title + "\n\\begin{itemize}")
        parts += [r"  \item {%s}" % bullet(next(verbs)) for _ in range(n)]
        parts.append(r"\end{itemize}")
    parts += [r"\section{Education}", r"\eduentry{B.E.}{BITS Pilani, Hyderabad (2022-2026)}", extra, r"\end{document}"]
    return "\n".join(parts)


class RenderTests(unittest.TestCase):
    def test_render_counts_escapes_as_one_char(self):
        self.assertEqual(cr.render(r"Cut audit time 90\% on R\&D \textbf{docs} --- fast."), "Cut audit time 90% on R&D docs — fast.")


class CheckResumeTests(unittest.TestCase):
    def test_valid_cv_passes(self):
        r = cr.check(cv())
        self.assertTrue(r["ok"], r["errors"])
        self.assertEqual(r["bullets"], 23)
        self.assertEqual(r["unique_verbs"], 23)

    def test_wrong_bullet_count_fails(self):
        r = cr.check(cv(roles=[("AI Engineer - OTO Capital", 3), ("Data Consultant - Goel Exports", 2),
                               ("Data Science Intern - Standard Chartered", 5), ("ML Intern - DG Liger", 3)]))
        self.assertIn("AI Engineer - OTO Capital: 3 bullets, rule is 4", r["errors"])

    def test_project_outside_pool_and_count_fail(self):
        r = cr.check(cv(projects=[("AirFare-ML --- Regression", 3), ("Sanwaad --- Agents", 3)]))
        self.assertTrue(any("not in the allowed pool" in e for e in r["errors"]))
        self.assertTrue(any("2 projects" in e for e in r["errors"]))

    def test_length_and_repeated_verb_fail(self):
        tex = cv().replace(bullet("Gated"), "Shipped a short bullet.")
        r = cr.check(tex)
        self.assertTrue(any("chars (rule 100-110)" in e for e in r["errors"]))
        self.assertTrue(any("verb repeated" in e and "shipped" in e for e in r["errors"]))

    def test_summary_skills_and_cgpa_rules(self):
        r = cr.check(cv(summary="I build agents.", skills=2, extra="CGPA: 6.8"))
        joined = " | ".join(r["errors"])
        self.assertIn("skill rows", joined)
        self.assertIn("sentences", joined)
        self.assertIn("pronoun", joined)
        self.assertIn("CGPA", joined)

    def test_comments_are_ignored(self):
        self.assertTrue(cr.check(cv(extra="% CGPA: 6.8 (kept off the CV)"))["ok"])


if __name__ == "__main__":
    unittest.main()
