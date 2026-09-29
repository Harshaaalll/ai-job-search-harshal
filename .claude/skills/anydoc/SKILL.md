---
name: convert-documents-to-markdown
description: Convert Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx), OpenDocument (.odt, .ods, .odp), RTF, EPUB, CSV, and PDF files to GitHub-Flavored Markdown. Use when a task needs the contents of an office document, spreadsheet, presentation, ebook, or PDF you cannot read directly.
license: MIT
metadata:
  author: firecrawl
  source: https://github.com/firecrawl/anydoc (MIT; hosted-OCR rule tightened for privacy)
---

# Convert documents to Markdown

Run the anydoc CLI. **On this machine use `bunx`**: Node is v18 and anydoc needs Node 20+, but Bun runs it fine with no install:

```bash
bunx @firecrawl/anydoc <file>              # Markdown to stdout
bunx @firecrawl/anydoc <file> -o out.md    # write to a file
bunx @firecrawl/anydoc - --format csv < f  # read stdin
```

Rules:

1. Supported inputs: `.doc`, `.docx`, `.docm`, `.odt`, `.rtf`, `.epub`, `.pdf`, `.ppt`, `.pps`, `.pot`, `.pptx`, `.pptm`, `.ppsx`, `.ppsm`, `.odp`, `.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.ods`, `.csv`.
2. The format is detected from the file content. Pass `--format <name>` only when detection cannot work: CSV from stdin, or a missing or wrong extension.
3. Exit codes: 0 success, 1 the document could not be converted, 2 usage error, 3 pages of a PDF need OCR. Failures print one `anydoc: <message>` line to stderr. The CLI never prompts.
4. For a large document, write to a file with `-o` and read the parts you need instead of streaming everything into context.
5. Scanned and image-only pages need OCR, which anydoc does not do, so the document exits 3. `--ocr hosted` would upload the file to Firecrawl's servers. **Never use it without asking the user first** - documents in this workspace (CVs, offer letters, references) are personal data. Offer it as an option and wait for a yes; otherwise read the PDF with the Read tool instead.
6. Inside a Node, Python, or Rust codebase, prefer the library over shelling out: `@firecrawl/anydoc` on npm, `firecrawl-anydoc` on PyPI, `anydoc` on crates.io. Each exposes the same `to_markdown` / `toMarkdown` API.

## In this workspace

Typical uses: a job description saved as .docx/.pdf in `documents/postings/`, an old CV or LinkedIn export in `documents/cv/` or `documents/linkedin/` before `/setup` Path A. Write output next to the input (`-o <same-name>.md`) so it stays inside the gitignored `documents/` tree.
