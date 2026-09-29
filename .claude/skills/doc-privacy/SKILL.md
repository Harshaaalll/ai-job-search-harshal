---
name: doc-privacy
description: Audit or clean metadata and invisible Unicode in your own CVs, cover letters and notes (PDF/.tex/.md/.txt), fully offline. Use when asked to remove watermarks/AI marks/metadata from a CV or cover letter, or to check what a PDF reveals. Replaces the non-working remove-ai-marks skill for this workspace.
allowed-tools: Bash(~/.local/share/ai-job-search/venv/bin/python tools/doc_privacy.py *), Bash(python3 tools/doc_privacy.py *)
---

# Document privacy (offline)

Tool: `tools/doc_privacy.py`. PDF work needs the project venv (pikepdf, bundled qpdf):

```bash
PY=~/.local/share/ai-job-search/venv/bin/python
$PY tools/doc_privacy.py audit cv/ cover_letters/          # read-only report
$PY tools/doc_privacy.py clean cv/main_<co>_<role>.pdf     # writes *.clean.pdf
$PY tools/doc_privacy.py clean --in-place <files>          # overwrite (text verified identical)
```

- **PDF clean** keeps only Title and Author (ATS parsers use them) and removes XMP, producer/creator,
  LuaTeX banner, dates and keywords. It refuses to write if the page count or extracted text changes.
- **.tex/.md/.txt clean** removes invisible Unicode (zero-width, bidi, tag characters, BOM, soft
  hyphen) and nothing else - it never deletes lines, comments or `\hypersetup` fields.
- The daily pipeline already runs `clean --in-place` on every new draft.

**Scope - say this plainly when asked about AI watermarks:** metadata and hidden characters are the
only marks in a file. Statistical AI-text watermarks live in word choice; no file tool removes them,
and this workspace does not attempt to disguise AI-assisted text. Text the user writes or rephrases
in their own words is their own. Never upload documents to a third-party service for "cleaning".
