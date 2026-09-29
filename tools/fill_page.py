#!/usr/bin/env python3
"""Make a one-page CV (fresher-onepage template) fill the page down to the bottom margin.

Compiles the CV, measures where the last line of text actually ends (pdftotext -bbox), and
spreads the leftover space evenly over the vertical gaps the template exposes:
  \\sectiongapsize - space above every section heading
  \\entrygapsize   - space between consecutive work entries and between projects
Repeats until the last line sits within TOLERANCE of the target, never exceeding one page.

Usage: python3 tools/fill_page.py cv/main_<company>_<role>.tex [--bottom-margin-pt 28.8] [--slack-pt 3]
Only the two \\setlength values in the .tex are changed; content is never touched.
"""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

MAX_ITER = 8
TOLERANCE_PT = 2.0
LIMITS = {"entrygapsize": (2.0, 16.0), "sectiongapsize": (3.0, 18.0)}


def get_len(tex: str, name: str) -> float:
    m = re.search(r"\\setlength\{\\" + name + r"\}\{([\d.]+)pt\}", tex)
    if not m:
        raise SystemExit(f"\\{name} not found - is this the fresher-onepage template?")
    return float(m.group(1))


def set_len(tex: str, name: str, value: float) -> str:
    return re.sub(r"(\\setlength\{\\" + name + r"\}\{)[\d.]+(pt\})", rf"\g<1>{value:.1f}\g<2>", tex, count=1)


def compile_pdf(tex_path: Path) -> Path:
    build = tex_path.parent / f"build_fill_{tex_path.stem}"
    build.mkdir(exist_ok=True)
    subprocess.run(["lualatex", "-interaction=nonstopmode", f"-output-directory={build.name}", tex_path.name],
                   cwd=tex_path.parent, capture_output=True, text=True)
    pdf = tex_path.with_suffix(".pdf")
    built = build / pdf.name
    if not built.exists():
        raise SystemExit(f"compile failed - see {build / (tex_path.stem + '.log')}")
    shutil.move(str(built), pdf)
    shutil.rmtree(build, ignore_errors=True)
    return pdf


def measure(pdf: Path):
    """(pages, page_height_pt, lowest text yMax on the last page)."""
    info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    height = float(re.search(r"Page size:\s+[\d.]+ x ([\d.]+)", info).group(1))
    bbox = subprocess.run(["pdftotext", "-bbox", "-f", str(pages), "-l", str(pages), str(pdf), "-"],
                          capture_output=True, text=True).stdout
    ymax = max(float(y) for y in re.findall(r'yMax="([\d.]+)"', bbox))
    return pages, height, ymax


def count_gaps(tex: str):
    body = tex.split("\\begin{document}", 1)[1]
    return len(re.findall(r"^\s*\\entrygap\s*$", body, re.M)), len(re.findall(r"\\section\{", body))


def fill(tex_path: Path, bottom_margin: float, slack: float, log=print) -> dict:
    tex = tex_path.read_text(encoding="utf-8")
    n_entry, n_sec = count_gaps(tex)
    if n_entry + n_sec == 0:
        raise SystemExit("no adjustable gaps found")
    for i in range(1, MAX_ITER + 1):
        pdf = compile_pdf(tex_path)
        pages, height, ymax = measure(pdf)
        target = height - bottom_margin - slack
        e, s = get_len(tex, "entrygapsize"), get_len(tex, "sectiongapsize")
        free = target - ymax
        log(f"pass {i}: pages={pages} last line at {ymax:.1f}pt, target {target:.1f}pt, "
            f"entrygap={e}pt sectiongap={s}pt")
        if pages == 1 and abs(free) <= TOLERANCE_PT:
            return {"ok": True, "entrygapsize": e, "sectiongapsize": s, "bottom_whitespace_pt": round(height - ymax, 1)}
        if pages > 1:
            delta = -max(3.0, (e + s) * 0.25)          # overflowed: back off firmly
        else:
            delta = free / (n_entry + n_sec)
        new_e = min(max(e + delta, LIMITS["entrygapsize"][0]), LIMITS["entrygapsize"][1])
        new_s = min(max(s + delta, LIMITS["sectiongapsize"][0]), LIMITS["sectiongapsize"][1])
        if abs(new_e - e) < 0.05 and abs(new_s - s) < 0.05:
            # Gaps are at their limits but the page is still short (or still long): spacing alone
            # cannot fix it - the content needs another line or bullet (or one fewer).
            return {"ok": False, "entrygapsize": e, "sectiongapsize": s,
                    "bottom_whitespace_pt": round(height - ymax, 1),
                    "note": "gap limits reached - add content (short page) or cut content (overflow)"}
        tex = set_len(set_len(tex, "entrygapsize", new_e), "sectiongapsize", new_s)
        tex_path.write_text(tex, encoding="utf-8")
    pdf = compile_pdf(tex_path)
    pages, height, ymax = measure(pdf)
    return {"ok": pages == 1, "entrygapsize": get_len(tex, "entrygapsize"),
            "sectiongapsize": get_len(tex, "sectiongapsize"), "bottom_whitespace_pt": round(height - ymax, 1),
            "note": "iteration limit"}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("tex")
    ap.add_argument("--bottom-margin-pt", type=float, default=28.8, help="geometry bottom margin (0.4in)")
    ap.add_argument("--slack-pt", type=float, default=3.0, help="breathing room above the margin")
    a = ap.parse_args(argv)
    r = fill(Path(a.tex).resolve(), a.bottom_margin_pt, a.slack_pt)
    print(("fill_page: OK " if r["ok"] else "fill_page: FAILED ") + str(r))
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
