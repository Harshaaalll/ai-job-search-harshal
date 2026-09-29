#!/usr/bin/env python3
"""PreToolUse(Bash) guard: keep the test-gated commit hook from being bypassed.

Denies `git commit` with --no-verify / -n (including combined short flags like -an),
and any command that changes or overrides core.hooksPath.
"""
import json
import re
import shlex
import sys


def reason_to_block(command: str):
    for part in re.split(r"&&|\|\||;|\|", command):
        try:
            tokens = shlex.split(part)
        except ValueError:
            tokens = part.split()
        if not tokens or "git" not in tokens:
            continue
        i = tokens.index("git")
        args = tokens[i + 1:]
        if any("hookspath" in a.lower() for a in args):
            return "Changing or overriding core.hooksPath would disable the test-gated pre-commit hook."
        # skip global options like -C dir / -c k=v to find the subcommand
        j = 0
        while j < len(args) and args[j].startswith("-"):
            j += 2 if args[j] in ("-C", "-c") else 1
        if j < len(args) and args[j] == "commit":
            for a in args[j + 1:]:
                if a == "--no-verify" or (re.fullmatch(r"-[a-zA-Z]+", a) and "n" in a[1:]):
                    return "git commit --no-verify/-n skips the test gate. Fix the failing tests instead."
    return None


def main():
    data = json.load(sys.stdin)
    reason = reason_to_block((data.get("tool_input") or {}).get("command", ""))
    if reason:
        print(json.dumps({"hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason}}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
