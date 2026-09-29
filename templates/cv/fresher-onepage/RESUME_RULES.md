# Resume rules (fresher-onepage) - mandatory for every tailored CV

Base method: `standard_resume_master_prompt.md` (this folder) - the candidate's own master prompt.
This file records the candidate's decisions on top of it (2026-09-29). Where they differ, **this file wins**.
Mechanical rules are enforced by `python3 tools/check_resume.py <cv.tex>`; run it after every draft and fix until OK.

## Structure (one page, exactly)
1. Header (name, email, phone, city, LinkedIn, GitHub, portfolio). **No CGPA anywhere** (candidate decision; forms that
   ask still get the true 6.8).
2. Professional Summary - 3-4 sentences, no pronouns, no "aspiring/seeking": identity + core skills, evidence with numbers,
   role/company-specific differentiator.
3. Skills - 3-4 topic rows, most JD-relevant first, 5-10 defensible keywords each (category names per master prompt table).
4. Work Experience, in this order and with exactly these bullet counts:
   | Role | Bullets |
   |---|---|
   | AI Engineer - OTO Capital | 4 |
   | Data & Analytics Consultant - Goel Exports | 2 |
   | Data Science Intern - Standard Chartered Global Business Services | 5 |
   | Machine Learning Engineer Intern - DG Liger Consulting | 3 |
5. Technical Projects - **exactly 3**, chosen per JD from this pool only: Market Analysis, Medical Bill OCR,
   AutoTransFlow, Multilingual ASR, Sanwaad. 3 bullets each. Title = `Name --- role-relevant subtitle`
   (same project, different subtitle per role, e.g. "Medical Bill OCR --- LLM Structured Extraction & Evaluation").
6. Education - `\eduentry` (degree, then a clear gap, then "BITS Pilani, Hyderabad (2022-2026)"); second line:
   Coursework (merged "Subjects / Electives") + CBSE XII 92.2%, X 91.2%.
7. Sports and Leadership - **only if it still fits on one page**; it is the first thing to drop on overflow.
   Facts: state-level representative in basketball and cricket; volleyball gold medalist; former logistics team captain.

## Bullets (work + projects)
- 100-110 characters as rendered (LaTeX escapes count as one character), ending with a period.
- Formula: action verb + named technology/method + quantified or concrete impact. Active voice, no filler verbs.
- **Every bullet starts with a different verb across the whole CV** (23 bullets = 23 verbs).
- Work facts never change between versions; only the framing words change per role (master prompt constraint 11).

## Layout
- 10pt Latin Modern, one column. `\entrygap` between consecutive work entries and between projects.
- **The page must be filled to the bottom margin**: after the content passes `check_resume.py`, run
  `python3 tools/fill_page.py <cv.tex>` (adjusts only `\entrygapsize` / `\sectiongapsize`). Never shrink the font or margins.
- Overflow order: drop Sports and Leadership, then shorten summary to 3 sentences (fill_page then re-spreads the space).

## Role-specific content notes
- **OTO Capital** (source of truth: profile, "AI Engineer - OTO Capital"): strongest facts are the deterministic negotiation
  gate (3,090 lines, 4 gated tools, sub-200ms budget), 79% prompt-token reduction (16,558 -> 3,490 tokens/turn), 276-check
  regression suite + 500-call simulator, 45+ live-call defects fixed, 36,091-row mining -> same-day promise converts 14.1%,
  ~824,500 redundant cache tokens eliminated, 5 lending tenants / 10 languages. "34-check" is outdated - never use it.
- **Goel Exports** is mostly non-technical. For AI/ML/DS roles frame the 2 bullets as data work that the files prove:
  data modelling (120 datapoints, 41 critical, lineage + system-of-record tagging over an 18-stage / 4-phase order-to-cash
  flow), master-data reconciliation (886 vs 859 products, 27 true additions, 4 whitespace-key mismatches), log-based
  root-cause analysis (6 of 6 stage moves reversed within a minute). Never claim the CRM defect was fixed (status: open).
- **Standard Chartered** (5): contract-NLP on Dataiku DSS (90% audit time cut), DistilBERT weighted loss 98.6% recall,
  SBERT MultipleNegativesRankingLoss retrieval, confidence guardrails filtering 95%+ false positives, 250/50-token ETL
  windowing with zero data loss. AutoTransFlow is a separate project - don't double-count it here.
- **DG Liger** (3): LangChain RAG over 30+ client PDFs, MiniLM + FAISS sub-second semantic search, 3B-parameter LLM grounding.
