# Template: fresher-onepage

- **Type:** CV
- **Source extension:** .tex
- **Engine/toolchain:** lualatex
- **Page limit:** 1 page(s)
- **Fonts:** Latin Modern (lualatex default; ships with every TeX distribution, nothing to install)
- **Class/packages:** `article` (10pt, a4paper) with geometry, iftex, titlesec, enumitem, xcolor, hyperref - all standard

## Compile command

    cd cv && rm -f <file>.pdf && mkdir -p build && lualatex -interaction=nonstopmode -output-directory=build <file>.tex && mv build/<file>.pdf ./

## Style rules

- **Content rules are mandatory: read `RESUME_RULES.md` (this folder) before drafting, then run `python3 tools/check_resume.py <cv>.tex` and fix until it prints OK.** They fix bullet counts per role (OTO 4, Goel 2, Standard Chartered 5, DG Liger 3), exactly 3 projects from the pool with 3 bullets each, 100-110 chars per bullet, unique verbs, no CGPA.

- Single page, single column. This is the Indian fresher / entry-level norm and matches the candidate's existing resume. Never produce 2 pages.
- Section order: Professional Summary, Skills, Work Experience, Technical Projects, Education, Sports and Leadership (only if it fits). For a data-science posting where projects are the stronger evidence, Technical Projects may move above Work Experience; nothing else moves.
- Header: centred bold `\LARGE` name; line 2 = email, phone and city as **literal text** (ATS); line 3 = full LinkedIn URL, GitHub and portfolio link.
- Section headings: `\section{...}`, rendered large regular weight with a full-width rule (titlesec). No numbering.
- Experience and project headers use `\entry{Title - Organisation}{Dates}` / `\project{Name --- subtitle}{Dates}`: bold left, date right-aligned. Dates use an ASCII hyphen with spaces: `Aug 2026 - Present`, `2022-2026` (see "Date fields must be ASCII ranges" in `05-cv-templates.md`).
- Skills: 4 `\skillrow{Label}{...}` lines. Reorder categories and items so the posting's exact terms come first.
- Bullets: exactly one line each (100-110 characters fits one line at 10pt). Vertical gaps: `\entrygap` between consecutive work entries and between projects, `\sectiongapsize` above each section.
- **Fill the page:** after `check_resume.py` passes, run `python3 tools/fill_page.py cv/<file>.tex`. It compiles, measures where the text ends and spreads the leftover space over `\entrygapsize` / `\sectiongapsize` until the last line sits just above the bottom margin (never 2 pages). Do not hand-tune the gaps.
- Education: `\eduentry{Degree}{BITS Pilani, Hyderabad (2022-2026)}` (guaranteed gap between degree and institution), then one line with Coursework and CBSE scores. **Do not add CGPA** (candidate decision).
- Profile summary: 3-4 sentences, no pronouns; ends by naming the target company or team when that reads naturally.

## Known pitfalls

- `tools/verify_layout.py` reports "body text inside the bottom margin band, colliding with the footer" whenever the page is well filled. This template has **no page-number footer** (`\pagestyle{empty}`) and a 0.4in bottom margin, so that single finding is a false positive: ignore it when it is the only problem and the text ends above the margin. Every other verify_layout finding still applies.
- `titlesec` after-code: keep `[\titlerule]` exactly. Negative `\vspace` there makes headings overlap the first line of the section, and `\titlerule[<width>]` inside the optional argument must be braced or it errors.
- `~` is a non-breaking space in LaTeX, not a tilde: write "about 10 dB", never "~10 dB".
- Escape `%`, `&`, `#`, `_` in body text (see `05-cv-templates.md`). An unescaped `%` silently truncates a metric bullet.
- Overflow: cut by relevance (05-cv-templates.md "Relevance-weighted cutting"). Never shrink below 10pt or reduce margins below 0.4in to force a fit; drop Sports and Leadership first.
- Reference build: `cv/main_baseline_ai-engineer.tex` (gitignored, personal) is a verified 1-page instance of this template with the full current profile. Use it as the structural and phrasing reference, and `01-candidate-profile.md` as the fact source.
