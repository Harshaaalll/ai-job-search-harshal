#!/usr/bin/env python3
"""Check a tailored CV (.tex, fresher-onepage template) against the resume rules.

Rules (templates/cv/fresher-onepage/RESUME_RULES.md):
  - bullets per role: OTO Capital 4, Goel Exports 2, Standard Chartered 5, DG Liger 3
  - exactly 3 projects, each from the pool, 3 bullets each
  - every work/project bullet 100-110 characters as rendered, ending with a period
  - every work/project bullet starts with a different action verb (whole CV)
  - 3-4 skill rows; professional summary of 3-4 sentences; no CGPA line

Usage: python3 tools/check_resume.py cv/main_<company>_<role>.tex [--json]
Exit 0 when every rule passes, 1 otherwise.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROLE_BULLETS = {"oto capital": 4, "goel exports": 2, "standard chartered": 5, "dg liger": 3}
PROJECT_POOL = ["Market Analysis", "Medical Bill OCR", "AutoTransFlow", "Multilingual ASR", "Sanwaad"]
PROJECTS_REQUIRED = 3
PROJECT_BULLETS = 3
MIN_CHARS, MAX_CHARS = 100, 110


def render(tex: str) -> str:
    """Approximate the text a reader sees for one LaTeX bullet or sentence."""
    s = tex.strip()
    s = s.replace(r"\textasciitilde{}", "~").replace(r"\textasciicircum{}", "^")
    s = re.sub(r"\\(textbf|textit|emph|texttt|underline)\{([^{}]*)\}", r"\2", s)
    s = re.sub(r"\\href\{[^{}]*\}\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\textsuperscript\{([^{}]*)\}", r"\1", s)
    s = re.sub(r"\\([%&#_$])", r"\1", s)
    s = s.replace("---", "\u2014").replace("--", "\u2013").replace("``", '"').replace("''", '"')
    s = s.replace("~", " ")
    s = re.sub(r"\\[a-zA-Z]+\*?", "", s)          # drop any remaining commands
    s = s.replace("{", "").replace("}", "")
    return re.sub(r"\s+", " ", s).strip()


def section(tex: str, name: str) -> str:
    m = re.search(r"\\section\{" + re.escape(name) + r"\}(.*?)(?=\\section\{|\\end\{document\})", tex, re.S)
    return m.group(1) if m else ""


def entries(block: str, macro: str):
    """[(heading, [bullets])] for \\entry / \\project blocks followed by an itemize."""
    out = []
    pat = re.compile(r"\\" + macro + r"\{((?:[^{}]|\{[^{}]*\})*)\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*"
                     r"\\begin\{itemize\}(.*?)\\end\{itemize\}", re.S)
    for m in pat.finditer(block):
        items = [render(i) for i in re.split(r"\\item\s*", m.group(2))[1:]]
        out.append((render(m.group(1)), [i for i in items if i]))
    return out


def check(tex: str) -> dict:
    errors, warnings, bullets = [], [], []
    tex = re.sub(r"(?m)(?<!\\)%.*$", "", tex)  # strip comments

    work = entries(section(tex, "Work Experience"), "entry")
    seen_roles = set()
    for heading, items in work:
        key = next((k for k in ROLE_BULLETS if k in heading.lower()), None)
        if key is None:
            warnings.append(f"work entry not in the bullet-count table: {heading!r}")
        else:
            seen_roles.add(key)
            if len(items) != ROLE_BULLETS[key]:
                errors.append(f"{heading}: {len(items)} bullets, rule is {ROLE_BULLETS[key]}")
        bullets += [(heading, b) for b in items]
    for role in ROLE_BULLETS:
        if role not in seen_roles:
            errors.append(f"work entry missing: {role}")

    projects = entries(section(tex, "Technical Projects") or section(tex, "Projects"), "project")
    if len(projects) != PROJECTS_REQUIRED:
        errors.append(f"{len(projects)} projects, rule is exactly {PROJECTS_REQUIRED}")
    for heading, items in projects:
        if not any(heading.lower().startswith(p.lower()) for p in PROJECT_POOL):
            errors.append(f"project not in the allowed pool: {heading!r}")
        if " \u2014 " not in heading and " - " not in heading:
            warnings.append(f"project title has no role-relevant subtitle: {heading!r}")
        if len(items) != PROJECT_BULLETS:
            errors.append(f"{heading}: {len(items)} bullets, rule is {PROJECT_BULLETS}")
        bullets += [(heading, b) for b in items]

    verbs = {}
    for where, b in bullets:
        if not (MIN_CHARS <= len(b) <= MAX_CHARS):
            errors.append(f"{len(b)} chars (rule {MIN_CHARS}-{MAX_CHARS}): {b}")
        if not b.endswith("."):
            errors.append(f"bullet does not end with a period: {b}")
        verb = re.sub(r"[^a-z]", "", b.split()[0].lower()) if b.split() else ""
        verbs.setdefault(verb, []).append(where)
    for verb, where in verbs.items():
        if len(where) > 1:
            errors.append(f"action verb repeated {len(where)}x: {verb!r} ({', '.join(sorted(set(where)))})")

    skills = re.findall(r"\\skillrow\{", section(tex, "Skills"))
    if not 3 <= len(skills) <= 4:
        errors.append(f"{len(skills)} skill rows, rule is 3-4")

    summary = render(section(tex, "Professional Summary"))
    sentences = [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", summary) if s.strip()]
    if not 3 <= len(sentences) <= 4:
        errors.append(f"professional summary has {len(sentences)} sentences, rule is 3-4")
    if re.search(r"\b(I|my|me)\b", summary):
        errors.append("professional summary uses a personal pronoun")

    if re.search(r"\bCGPA\b|\bGPA\b", tex):
        errors.append("CGPA/GPA printed on the CV (candidate decision: omit)")

    return {"ok": not errors, "errors": errors, "warnings": warnings,
            "bullets": len(bullets), "unique_verbs": len(verbs)}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("tex")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    result = check(Path(a.tex).read_text(encoding="utf-8"))
    if a.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        for e in result["errors"]:
            print("FAIL:", e)
        for w in result["warnings"]:
            print("warn:", w)
        print(f"check_resume: {'OK' if result['ok'] else 'FAILED'} "
              f"({result['bullets']} bullets, {result['unique_verbs']} distinct verbs)")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
