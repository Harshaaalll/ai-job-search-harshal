"""Tests for tools/fill_page.py (fill a one-page CV down to the bottom margin)."""
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tools"))
import fill_page  # noqa: E402

TEMPLATE = REPO / "templates" / "cv" / "fresher-onepage" / "template.tex"


class LengthEditingTests(unittest.TestCase):
    TEX = ("\\newlength{\\entrygapsize}\\setlength{\\entrygapsize}{6pt}\n"
           "\\newlength{\\sectiongapsize}\\setlength{\\sectiongapsize}{6pt}\n"
           "\\begin{document}\n\\section{A}\nx\n\\entrygap\ny\n\\section{B}\n  \\entrygap\n\\end{document}\n")

    def test_get_and_set_lengths(self):
        self.assertEqual(fill_page.get_len(self.TEX, "entrygapsize"), 6.0)
        out = fill_page.set_len(self.TEX, "sectiongapsize", 9.25)
        self.assertEqual(fill_page.get_len(out, "sectiongapsize"), 9.2)   # written to 1 decimal
        self.assertEqual(fill_page.get_len(out, "entrygapsize"), 6.0)      # other length untouched

    def test_counts_only_body_gap_uses(self):
        self.assertEqual(fill_page.count_gaps(self.TEX), (2, 2))

    def test_missing_length_is_a_clear_error(self):
        with self.assertRaises(SystemExit):
            fill_page.get_len("no lengths here", "entrygapsize")


@unittest.skipUnless(shutil.which("lualatex") and shutil.which("pdftotext") and shutil.which("pdfinfo"),
                     "LaTeX/poppler not installed")
class FillIntegrationTests(unittest.TestCase):
    @staticmethod
    def dummy_cv(extra_bullets: int) -> str:
        tex = TEMPLATE.read_text(encoding="utf-8")
        more = "\n".join(f"  \\item {{Dummy extra bullet {i} with enough words to take one full line.}}"
                         for i in range(extra_bullets))
        tex = tex.replace("  \\item {[ACHIEVEMENT_1A]}", "  \\item {[ACHIEVEMENT_1A]}\n" + more, 1)
        return re.sub(r"\[([A-Z][A-Z0-9_]*)(?: - [^\]]*)?\]",
                      lambda m: "Dummy " + m.group(1).lower().replace("_", " "), tex)

    def test_thin_cv_reports_failure_instead_of_pretending(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "cv.tex"
            path.write_text(self.dummy_cv(0), encoding="utf-8")
            result = fill_page.fill(path, bottom_margin=28.8, slack=3.0, log=lambda *_: None)
            self.assertFalse(result["ok"], result)
            self.assertIn("add content", result["note"])

    def test_realistic_cv_is_stretched_to_the_bottom_margin(self):
        tex = self.dummy_cv(20)   # roughly the density of a real 23-bullet CV
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "cv.tex"
            path.write_text(tex, encoding="utf-8")
            result = fill_page.fill(path, bottom_margin=28.8, slack=3.0, log=lambda *_: None)
            self.assertTrue(result["ok"], result)
            pages, height, ymax = fill_page.measure(path.with_suffix(".pdf"))
            self.assertEqual(pages, 1)
            self.assertLess(height - ymax, 28.8 + 3.0 + fill_page.TOLERANCE_PT + 1)  # reached the margin
            self.assertGreater(height - ymax, 28.8)                                 # never into it


if __name__ == "__main__":
    unittest.main()
