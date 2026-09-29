#!/usr/bin/env python3
"""Stop hook (unattended pipeline): refuse to finish while a CV or cover letter written
this run fails its page limit or layout check.

- CV page limit comes from the ACTIVE-TEMPLATE block in 05-cv-templates.md (stock: 2);
  cover letters are always 1 page.
- Only files modified in the last 3 hours are checked, so old drafts never block a run.
- verify_layout's footer-collision finding is ignored for templates that declare they have
  no page-number footer (see templates/cv/fresher-onepage/TEMPLATE.md, Known pitfalls).
- One forced retry: when Claude is already continuing because of this hook
  (stop_hook_active), the hook stays silent so a run can never loop forever.
"""
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

WINDOW_SECONDS = 3 * 3600
FOOTER_FINDING = "colliding with the footer"


def repo_root() -> Path:
    return Path(os.environ.get("PDF_GATE_REPO") or Path(__file__).resolve().parents[2])


def cv_page_limit(repo: Path) -> int:
    guide = repo / ".claude/skills/job-application-assistant/05-cv-templates.md"
    try:
        m = re.search(r"\*\*Page limit:\*\*\s*exactly\s*(\d+)", guide.read_text(encoding="utf-8"))
    except OSError:
        m = None
    return int(m.group(1)) if m else 2


def template_has_no_footer(repo: Path) -> bool:
    for manifest in (repo / "templates" / "cv").glob("*/TEMPLATE.md"):
        if "no page-number footer" in manifest.read_text(encoding="utf-8"):
            return True
    return False


def layout_problems(output: str) -> list:
    """Problem lines after 'LAYOUT PROBLEMS:' in verify_layout output."""
    if "LAYOUT PROBLEMS:" not in output:
        return []
    tail = output.split("LAYOUT PROBLEMS:", 1)[1]
    return [ln.strip(" -") for ln in tail.splitlines() if ln.strip().startswith("-")]


def check(repo: Path, now: float, run=subprocess.run) -> list:
    fails = []
    cv_pages = cv_page_limit(repo)
    no_footer = template_has_no_footer(repo)
    targets = [(p, cv_pages, True) for p in (repo / "cv").glob("main_*.tex")]
    targets += [(p, 1, False) for p in (repo / "cover_letters").glob("cover_*.tex")]
    for tex, pages, is_cv in targets:
        if tex.stem.endswith("_example") or now - tex.stat().st_mtime > WINDOW_SECONDS:
            continue
        pdf = tex.with_suffix(".pdf")
        if not pdf.exists() or pdf.stat().st_mtime < tex.stat().st_mtime:
            fails.append(f"{tex.name}: PDF missing or older than the .tex - recompile it")
            continue
        r = run(["python3", "tools/verify_pdf.py", str(pdf), "--pages", str(pages)],
                cwd=repo, capture_output=True, text=True)
        if r.returncode != 0:
            fails.append(f"{pdf.name}: must be exactly {pages} page(s): {(r.stdout + r.stderr).strip()[-200:]}")
        if is_cv and (repo / "tools" / "check_resume.py").exists():
            r = run(["python3", "tools/check_resume.py", str(tex)], cwd=repo, capture_output=True, text=True)
            if r.returncode != 0:
                bad = [ln[6:] for ln in r.stdout.splitlines() if ln.startswith("FAIL: ")]
                fails.append(f"{tex.name}: resume rules - " + "; ".join(bad)[:400])
        r = run(["python3", "tools/verify_layout.py", str(pdf)], cwd=repo, capture_output=True, text=True)
        if r.returncode == 1:  # 2 = tooling unavailable, never a layout verdict
            problems = layout_problems(r.stdout)
            if is_cv and no_footer:
                problems = [p for p in problems if FOOTER_FINDING not in p]
            if problems:
                fails.append(f"{pdf.name}: layout - " + "; ".join(problems)[:300])
    return fails


def main() -> int:
    data = json.load(sys.stdin)
    if data.get("stop_hook_active"):
        return 0
    fails = check(repo_root(), time.time())
    if fails:
        print(json.dumps({"decision": "block",
                          "reason": "PDF gate failed - fix these before finishing:\n" + "\n".join(fails)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
