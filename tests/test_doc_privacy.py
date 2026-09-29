"""Tests for tools/doc_privacy.py (metadata + invisible-Unicode audit/clean)."""
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "tools"))
import doc_privacy  # noqa: E402

VENV_PY = Path.home() / ".local/share/ai-job-search/venv/bin/python"


class InvisibleUnicodeTests(unittest.TestCase):
    def test_finds_and_strips_hidden_characters(self):
        text = "Built a RAG​ assistant\n﻿with ‮tags\U000e0041 and a soft­hyphen\n"
        hits = doc_privacy.find_invisible(text)
        self.assertEqual([h[2] for h in hits], ["U+200B", "U+FEFF", "U+202E", "U+E0041", "U+00AD"])
        self.assertEqual(doc_privacy.strip_invisible(text), "Built a RAG assistant\nwith tags and a softhyphen\n")

    def test_ordinary_text_untouched(self):
        text = "Ünïcode — dashes, ₹10 LPA, naïve café, 98.6% recall\n% !TEX program = lualatex\n"
        self.assertEqual(doc_privacy.find_invisible(text), [])
        self.assertEqual(doc_privacy.strip_invisible(text), text)

    def test_clean_tex_removes_only_invisible_chars(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "cv.tex"
            src = "% !TEX program = lualatex\n\\hypersetup{pdfauthor={Me}}\nHello​ world\n"
            f.write_text(src, encoding="utf-8")
            doc_privacy.main(["clean", "--in-place", str(f)])
            self.assertEqual(f.read_text(encoding="utf-8"), src.replace("​", ""))


@unittest.skipUnless(VENV_PY.exists(), "project venv with pikepdf not installed")
class PdfCleanTests(unittest.TestCase):
    SCRIPT = textwrap.dedent("""
        import sys, pikepdf
        sys.path.insert(0, sys.argv[1])
        import doc_privacy as dp
        from pathlib import Path
        src = Path(sys.argv[2])
        pdf = pikepdf.new()
        pdf.add_blank_page()
        # XMP first: closing open_metadata syncs XMP into docinfo and would wipe earlier keys
        with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
            meta["dc:description"] = "c2pa test"
        pdf.docinfo["/Title"] = pikepdf.String("Jane Doe - CV")
        pdf.docinfo["/Author"] = pikepdf.String("Jane Doe")
        pdf.docinfo["/Producer"] = pikepdf.String("Claude AI-generated")
        pdf.docinfo["/PTEX.FullBanner"] = pikepdf.String("LuaTeX")
        pdf.save(src)
        before = dp.audit_pdf(src)
        assert before["xmp"] and "/Producer" in before["info"] and before["markers"], before
        out = src.with_name("out.pdf")
        r = dp.clean_pdf(src, out)
        after = dp.audit_pdf(out)
        assert not after["xmp"], after
        assert set(after["info"]) == {"/Title", "/Author"}, after
        assert after["info"]["/Author"] == "Jane Doe"
        assert after["pages"] == 1
        assert not after["markers"], after
        print("OK", sorted(r["removed"]))
    """)

    def test_clean_strips_everything_but_title_and_author(self):
        with tempfile.TemporaryDirectory() as d:
            p = subprocess.run([str(VENV_PY), "-c", self.SCRIPT, str(REPO / "tools"), str(Path(d) / "in.pdf")],
                               capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stdout + p.stderr)
            self.assertIn("XMP", p.stdout)
            self.assertIn("/Producer", p.stdout)


if __name__ == "__main__":
    unittest.main()
