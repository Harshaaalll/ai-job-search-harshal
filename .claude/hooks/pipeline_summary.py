#!/usr/bin/env python3
"""SessionStart hook: print the last daily-pipeline run so a new session starts knowing
what was drafted, skipped or failed overnight. Prints nothing when there is no run yet."""
import json
import os
import sys
from pathlib import Path

REPO = Path(os.environ.get("PIPELINE_SUMMARY_REPO") or Path(__file__).resolve().parents[2])


def summary(status: dict) -> str:
    if not status.get("started"):
        return ""
    stages = status.get("stages", {})
    lines = [f"Last job pipeline run: {status.get('finished') or 'still running'}"
             f" (ok={status.get('ok')}{', error=' + status['error'] if status.get('error') else ''})"]
    sc = stages.get("scrape")
    if sc:
        lines.append(f"- scrape: {sc.get('new', 0)} new, {sc.get('filtered', 0)} filtered, "
                     f"{len(sc.get('errors') or [])} errors")
    for r in (stages.get("draft") or {}).get("results") or []:
        reason = f" - {r['reason']}" if r.get("reason") else ""
        lines.append(f"- draft {r.get('result')}: {r.get('company')} / {r.get('title')}{reason}")
    lines.append("Dashboard: http://127.0.0.1:8787 · use /pipeline-triage to review.")
    return "\n".join(lines)


def main() -> int:
    try:
        status = json.loads((REPO / "job_scraper" / "pipeline_status.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return 0
    text = summary(status)
    if text:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
