#!/usr/bin/env python3
"""Audit and clean provenance metadata and invisible Unicode in your own documents. Offline.

  audit <paths...>            report metadata / markers / invisible characters (read-only)
  clean <files...> [--in-place] [--keep-dates]
                              PDF: drop XMP and all document-info fields except Title and
                              Author (ATS uses them); verify page count and extracted text are
                              unchanged. .tex/.md/.txt: remove invisible Unicode only.

PDF work needs pikepdf (bundles qpdf). On this machine run it with the project venv:
  ~/.local/share/ai-job-search/venv/bin/python tools/doc_privacy.py audit cv/
Text-file audit/clean works with plain python3.

Scope, honestly: this removes metadata and hidden characters. It does not (and is not meant
to) remove statistical AI-text watermarks, which live in word choice, not in the file.
"""
import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

TEXT_SUFFIXES = {".tex", ".md", ".txt", ".csv"}
KEEP_INFO = ("/Title", "/Author")
MARKERS = re.compile(rb"c2pa|jumbf|contentcredentials|trainedAlgorithmicMedia|synthid|"
                     rb"anthropic|claude|openai|chatgpt|gemini|ai[-_ ]generated", re.I)

# Zero-width, bidi controls, invisible operators, BOM, soft hyphen, Mongolian vowel sep,
# Hangul fillers, variation selectors and Unicode tag characters.
INVISIBLE = re.compile("[­ᅟᅠ᠎​-‏‪-‮⁠-⁤"
                       "⁦-⁩ㅤ︀-️﻿\U000e0000-\U000e007f]")


def find_invisible(text: str):
    """[(line, col, 'U+XXXX')] for every invisible character."""
    hits = []
    for ln, line in enumerate(text.splitlines(), 1):
        for m in INVISIBLE.finditer(line):
            hits.append((ln, m.start() + 1, f"U+{ord(m.group()):04X}"))
    return hits


def strip_invisible(text: str) -> str:
    return INVISIBLE.sub("", text)


def pdf_text(path: Path) -> str:
    try:
        return subprocess.run(["pdftotext", "-layout", "-enc", "UTF-8", str(path), "-"],
                              capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return ""


def _pikepdf():
    try:
        import pikepdf
        return pikepdf
    except ImportError:
        sys.exit("pikepdf not installed - run with ~/.local/share/ai-job-search/venv/bin/python")


def audit_pdf(path: Path) -> dict:
    pikepdf = _pikepdf()
    raw = path.read_bytes()
    with pikepdf.open(path) as pdf:
        info = {str(k): str(v) for k, v in pdf.docinfo.items()}
        return {
            "pages": len(pdf.pages),
            "info": info,
            "xmp": "/Metadata" in pdf.Root,
            "attachments": len(pdf.attachments),
            "markers": sorted({m.group().decode(errors="replace").lower() for m in MARKERS.finditer(raw)}),
            "invisible_in_text": find_invisible(pdf_text(path)),
        }


def clean_pdf(path: Path, out: Path, keep_dates: bool = False) -> dict:
    pikepdf = _pikepdf()
    before_text = pdf_text(path)
    keep = KEEP_INFO + (("/CreationDate", "/ModDate") if keep_dates else ())
    with pikepdf.open(path) as pdf:
        pages = len(pdf.pages)
        removed = [str(k) for k in list(pdf.docinfo.keys()) if str(k) not in keep]
        for k in removed:
            del pdf.docinfo[k]
        if "/Metadata" in pdf.Root:
            del pdf.Root.Metadata
            removed.append("XMP")
        if "/PieceInfo" in pdf.Root:
            del pdf.Root.PieceInfo
            removed.append("PieceInfo")
        tmp = Path(tempfile.mkstemp(suffix=".pdf")[1])
        pdf.save(tmp, fix_metadata_version=False, deterministic_id=True)
    with pikepdf.open(tmp) as check:
        assert len(check.pages) == pages, "page count changed - refusing to write"
    if pdf_text(tmp) != before_text:
        tmp.unlink()
        raise RuntimeError(f"{path}: extracted text changed after cleaning - refusing to write")
    shutil.move(str(tmp), out)
    return {"removed": removed, "pages": pages, "out": str(out)}


def iter_files(paths):
    for p in map(Path, paths):
        if p.is_dir():
            yield from sorted(f for f in p.rglob("*") if f.is_file() and
                              (f.suffix == ".pdf" or f.suffix in TEXT_SUFFIXES) and "build" not in f.parts)
        elif p.is_file():
            yield p


def cmd_audit(paths) -> int:
    findings = 0
    for f in iter_files(paths):
        if f.suffix == ".pdf":
            a = audit_pdf(f)
            extra = {k: v for k, v in a["info"].items() if k not in KEEP_INFO}
            flags = []
            if extra:
                flags.append(f"info fields {sorted(extra)}")
            if a["xmp"]:
                flags.append("XMP metadata")
            if a["markers"]:
                flags.append(f"markers {a['markers']}")
            if a["attachments"]:
                flags.append(f"{a['attachments']} attachment(s)")
            if a["invisible_in_text"]:
                flags.append(f"{len(a['invisible_in_text'])} invisible char(s) in text layer")
            print(f"{f}: {a['pages']}p | " + ("; ".join(flags) if flags else "clean"))
            findings += bool(flags)
        else:
            hits = find_invisible(f.read_text(encoding="utf-8", errors="replace"))
            if hits:
                print(f"{f}: {len(hits)} invisible char(s), first at line {hits[0][0]} col {hits[0][1]} ({hits[0][2]})")
                findings += 1
    print(f"audit: {findings} file(s) with findings")
    return 1 if findings else 0


def cmd_clean(files, in_place, keep_dates) -> int:
    for f in map(Path, files):
        if f.suffix == ".pdf":
            out = f if in_place else f.with_name(f.stem + ".clean.pdf")
            r = clean_pdf(f, out, keep_dates)
            print(f"{f} -> {r['out']}: removed {r['removed'] or 'nothing'} (pages {r['pages']}, text verified identical)")
        elif f.suffix in TEXT_SUFFIXES:
            text = f.read_text(encoding="utf-8")
            n = len(find_invisible(text))
            out = f if in_place else f.with_name(f.stem + ".clean" + f.suffix)
            out.write_text(strip_invisible(text), encoding="utf-8")
            print(f"{f} -> {out}: removed {n} invisible char(s); no other lines touched")
        else:
            print(f"{f}: unsupported type, skipped")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("audit")
    a.add_argument("paths", nargs="+")
    c = sub.add_parser("clean")
    c.add_argument("files", nargs="+")
    c.add_argument("--in-place", action="store_true")
    c.add_argument("--keep-dates", action="store_true")
    args = ap.parse_args(argv)
    if args.cmd == "audit":
        return cmd_audit(args.paths)
    return cmd_clean(args.files, args.in_place, args.keep_dates)


if __name__ == "__main__":
    sys.exit(main())
