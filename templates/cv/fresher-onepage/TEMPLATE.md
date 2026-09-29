# Template: fresher-onepage

- **Type:** CV
- **Source extension:** .tex
- **Engine/toolchain:** lualatex
- **Page limit:** 1 page(s)
- **Fonts:** Latin Modern (lualatex default; ships with every TeX distribution, nothing to install)
- **Class/packages:** `article` (11pt, a4paper) with geometry, iftex, titlesec, enumitem, xcolor, hyperref - all standard

## Compile command

    cd cv && rm -f <file>.pdf && mkdir -p build && lualatex -interaction=nonstopmode -output-directory=build <file>.tex && mv build/<file>.pdf ./

## Style rules

- Single page, single column. This is the Indian fresher / entry-level norm and matches the candidate's existing resume. Never produce 2 pages.
- Section order: Professional Summary, Skills, Work Experience, Technical Projects, Education. For a data-science posting where projects are the stronger evidence, Technical Projects may move above Work Experience; nothing else moves.
- Header: centred bold `\LARGE` name; line 2 = email, phone and city as **literal text** (ATS); line 3 = full LinkedIn URL and GitHub; line 4 = portfolio link.
- Section headings: `\section{...}`, rendered large regular weight with a full-width rule (titlesec). No numbering.
- Experience and project headers use `\entry{Title - Organisation}{Dates}` / `\project{Name --- subtitle}{Dates}`: bold left, date right-aligned. Dates use an ASCII hyphen with spaces: `Aug 2026 - Present`, `2022-2026` (see "Date fields must be ASCII ranges" in `05-cv-templates.md`).
- Skills: 4 `\skillrow{Label}{...}` lines. Reorder categories and items so the posting's exact terms come first.
- Bullets: one line each wherever possible (about 105 characters at this geometry). Start with a strong past-tense verb and keep the metric. Typical budget: current role 4, other roles 2-3, 2-3 projects with 2 bullets each.
- Education: degree line with institution and years right-aligned in bold, then the CBSE line. **Do not add CGPA** (see 04-job-evaluation.md's Academic Cutoff Gate).
- Profile summary: 3-4 lines, ends by naming the target company or team when that reads naturally.

## Known pitfalls

- `tools/verify_layout.py` reports "body text inside the bottom margin band, colliding with the footer" whenever the page is well filled. This template has **no page-number footer** (`\pagestyle{empty}`) and a 0.4in bottom margin, so that single finding is a false positive: ignore it when it is the only problem and the text ends above the margin. Every other verify_layout finding still applies.
- `titlesec` after-code: keep `[\titlerule]` exactly. Negative `\vspace` there makes headings overlap the first line of the section, and `\titlerule[<width>]` inside the optional argument must be braced or it errors.
- Escape `%`, `&`, `#`, `_` in body text (see `05-cv-templates.md`). An unescaped `%` silently truncates a metric bullet.
- Overflow: cut by relevance (05-cv-templates.md "Relevance-weighted cutting"). Never shrink below 11pt or reduce margins below 0.4in to force a fit.
- Reference build: `cv/main_baseline_ai-engineer.tex` (gitignored, personal) is a verified 1-page instance of this template with the full current profile. Use it as the structural and phrasing reference, and `01-candidate-profile.md` as the fact source.
