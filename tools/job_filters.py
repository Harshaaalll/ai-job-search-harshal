#!/usr/bin/env python3
"""Deterministic experience / seniority filter for scraped postings.

freehire has no years-of-experience facet and its seniority enrichment is sparse
(and sometimes wrong: a "Senior AI Engineer" tagged `junior`), so the daily
pipeline cannot ask the API for "0-2 years". It filters client-side instead:

  * the posting's own text states a minimum experience of 3+ years -> reject
  * enrichment seniority is senior/lead/staff/principal/c_level      -> reject
  * a "2-4 years" style range (floor 2, ceiling 4+)                   -> stretch
    (kept; 04-job-evaluation.md flags it for the user, it is not a fail)

Anything the text does not state is kept: unknown is not a reason to drop.

Usage:
  python3 tools/job_filters.py --text "3+ years of experience in Python"
"""

import argparse
import re
import sys

MAX_YEARS = 2  # candidate ceiling, CLAUDE.md: roles requiring 3+ years are a deal-breaker

REJECT_SENIORITY = frozenset({"senior", "lead", "staff", "principal", "c_level"})

_NUM = r"(\d{1,2})"
# "3+ years", "3-5 years", "3 to 5 years", "minimum 3 years", "at least 4 yrs"
_YEARS = re.compile(
    rf"(?<![\d.])(?:{_NUM}\s*(?:\+|-|–|—|to)\s*{_NUM}|{_NUM}\s*\+?)\s*(?:years?|yrs?)\b",
    re.IGNORECASE,
)
# A mention only counts as a requirement when it sits next to one of these.
_REQUIREMENT_CONTEXT = re.compile(r"experience|exp\b|relevant|hands-on|background|minimum|at least", re.IGNORECASE)
# Marketing copy ("our 15 years of experience") is not a requirement.
_ABOUT_COMPANY = re.compile(r"\bour\b|\bsince\b|\bwe(?:\x27ve| have)\b", re.IGNORECASE)
_SENTENCE_SPLIT = re.compile(r"(?<!\d)\.|\.(?!\d)|[\n;•]")


def _bounds(match: "re.Match[str]") -> tuple[int, int]:
    lo, hi, single = match.group(1), match.group(2), match.group(3)
    if single is not None:
        n = int(single)
        return n, n
    return int(lo), int(hi)


def years_required(text: str) -> tuple[int, int] | None:
    """(floor, ceiling) of the experience the posting asks for, or None if unstated.

    Takes the highest floor across requirement-style mentions: "2+ years Python"
    next to "5+ years overall" is a 5-year role.
    """
    best: tuple[int, int] | None = None
    for sentence in _SENTENCE_SPLIT.split(text or ""):
        if not _REQUIREMENT_CONTEXT.search(sentence) or _ABOUT_COMPANY.search(sentence):
            continue
        for m in _YEARS.finditer(sentence):
            lo, hi = _bounds(m)
            if hi < lo or lo > 40:  # "2020-2023"-style noise or a typo, not a requirement
                continue
            if best is None or lo > best[0]:
                best = (lo, hi)
    return best


def experience_verdict(description: str | None, seniority: str | None = None) -> tuple[str, str]:
    """('ok' | 'stretch' | 'reject', reason) for one posting."""
    if seniority and seniority.lower() in REJECT_SENIORITY:
        return "reject", f"seniority {seniority}"
    req = years_required(description or "")
    if req is None:
        return "ok", ""
    lo, hi = req
    if lo > MAX_YEARS:
        return "reject", f"{lo}+ years required"
    if lo == MAX_YEARS and hi > MAX_YEARS + 1:
        return "stretch", f"{lo}-{hi} years"
    return "ok", ""


def city_rank(location: str | None, priority: list[str]) -> int:
    """Index of the first priority city named in `location` (lower sorts first); unlisted sorts last.

    A priority entry may list aliases with "|" ("bengaluru|bangalore").
    """
    loc = (location or "").lower()
    return next((i for i, c in enumerate(priority) if any(a in loc for a in c.lower().split("|"))), len(priority))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--text", required=True)
    ap.add_argument("--seniority")
    a = ap.parse_args()
    verdict, reason = experience_verdict(a.text, a.seniority)
    print(f"{verdict}{': ' + reason if reason else ''}")
    return 1 if verdict == "reject" else 0


if __name__ == "__main__":
    sys.exit(main())
