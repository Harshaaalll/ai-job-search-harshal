#!/usr/bin/env python3
"""PreToolUse(WebFetch|WebSearch) guard for unattended pipeline runs.

The pipeline reads untrusted job-posting text while WebFetch/WebSearch are allowed, so a
prompt-injected posting could try to smuggle profile data out in a URL or search query.
This denies any request that carries the candidate's name, email or phone number, and any
URL with an unusually long query string. Identifiers are read from 01-candidate-profile.md
at run time, so nothing personal is hard-coded here. It stops naive exfiltration only; the
pipeline's other limits (no curl/wget, no MCP connectors) do the rest.
"""
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

MAX_QUERY_CHARS = 300
PROFILE = ".claude/skills/job-application-assistant/01-candidate-profile.md"


def repo_root() -> Path:
    return Path(os.environ.get("EGRESS_GUARD_REPO") or Path(__file__).resolve().parents[2])


def identifiers(repo: Path) -> list:
    """Lower-cased strings that must never leave the machine in a request."""
    try:
        text = (repo / PROFILE).read_text(encoding="utf-8")
    except OSError:
        return []
    found = []
    for field in ("Name", "Email", "Phone"):
        m = re.search(rf"\*\*{field}:\*\*\s*(.+)", text)
        if not m:
            continue
        value = m.group(1).strip()
        if field == "Phone":
            digits = re.sub(r"\D", "", value)
            found.append(digits[-10:])           # national number, however it is formatted
        elif field == "Name":
            found += [p for p in value.lower().split() if len(p) >= 5]  # surname-level tokens
        else:
            found.append(value.lower())
            found.append(value.lower().split("@")[0])
    return [f for f in found if f]


def reason_to_deny(tool_input: dict, ids: list):
    target = unquote(tool_input.get("url") or tool_input.get("query") or "")
    flat = target.lower()
    digits_only = re.sub(r"\D", "", target)
    for ident in ids:
        if (ident.isdigit() and ident in digits_only) or (not ident.isdigit() and ident in flat):
            return "Outbound request contains candidate personal data - blocked in unattended runs."
    if tool_input.get("url") and len(urlsplit(target).query) > MAX_QUERY_CHARS:
        return "Unusually long query string in an unattended run - blocked as possible data exfiltration."
    return None


def main() -> int:
    data = json.load(sys.stdin)
    reason = reason_to_deny(data.get("tool_input") or {}, identifiers(repo_root()))
    if reason:
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse",
                                                 "permissionDecision": "deny",
                                                 "permissionDecisionReason": reason}}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
