# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

<!-- Populated by /setup 2026-09-28 for Harshal Bhambhani: India, Bangalore first, fresher AI/ML/DS/GenAI/Agents. -->

**Enabled CLIs (primary):**
- **linkedin-search** - pass these `--location` strings, in this order:
  1. `"Bengaluru, Karnataka, India"` (always)
  2. `"India"` with `--remote remote` (remote roles)
  3. When the user says "broad" or "other cities": `"Hyderabad, Telangana, India"`, `"Pune, Maharashtra, India"`, `"Gurugram, Haryana, India"`, `"Mumbai, Maharashtra, India"`, `"Chennai, Tamil Nadu, India"`, `"Noida, Uttar Pradesh, India"`
- **freehire-search** - use `--country IN --seniority junior` (add `--category ml_ai` for the AI/ML categories). Also try without `--seniority` and filter client-side, since many Indian postings leave seniority untagged.
- Danish portals (jobindex, jobbank, jobdanmark, jobnet) stay **disabled** - not relevant for India.

**WebSearch fallback (no CLI yet - candidates for `/add-portal`):**
- **naukri.com** - India's largest general job board
- **wellfound.com** (formerly AngelList Talent) - startups, strong for GenAI/agents roles
- **instahyre.com**, **cutshort.io**, **hirist.tech** - tech-focused Indian boards
- **foundit.in** - large general board
- Company career pages for target companies (see Target Companies below)

## Query Categories

All queries are English only (Languages table: English). The CLI searches use the bare title strings (e.g. `-q "GenAI Engineer"`); the `site:` lines are the WebSearch fallback.

**Fresher filter terms:** add one of `fresher`, `entry level`, `0-2 years`, `graduate`, `junior`, `associate` when a portal returns mostly senior roles. Drop results asking for 3+ years (see the Academic Cutoff & Fresher Gate in `04-job-evaluation.md`).

### Priority 1: GenAI / LLM / AI Agent Engineering

Strongest and most wanted direction - building LLM apps, agents, RAG and evals.

Title variants: GenAI Engineer, Generative AI Engineer, AI Engineer, LLM Engineer, AI Agent Engineer, Agentic AI Engineer, Applied AI Engineer, AI Engineer - Fresher, Associate AI Engineer, Junior AI Engineer, Conversational AI Engineer

```
"GenAI Engineer"                      (linkedin: Bengaluru; jobage 14)
"AI Engineer" fresher                 (linkedin: Bengaluru)
"LLM Engineer"                        (linkedin: Bengaluru; India remote)
"Agentic AI"                          (linkedin: Bengaluru)
"Applied AI Engineer"                 (linkedin: Bengaluru)
freehire: -q "LLM" --country IN --category ml_ai
site:naukri.com "generative ai engineer" fresher bangalore
site:wellfound.com/jobs "AI engineer" Bangalore LLM
site:instahyre.com "GenAI" engineer bangalore
```

### Priority 2: Machine Learning / NLP Engineering

Domain strength - model fine-tuning, NLP, document AI.

Title variants: Machine Learning Engineer, ML Engineer, NLP Engineer, Associate ML Engineer, Junior Machine Learning Engineer, AI/ML Engineer, Applied Scientist (entry), Computer Vision Engineer (document AI / OCR focus only)

```
"Machine Learning Engineer" entry level   (linkedin: Bengaluru)
"NLP Engineer"                            (linkedin: Bengaluru; India remote)
"AI/ML Engineer" fresher                  (linkedin: Bengaluru)
freehire: -q "machine learning" --country IN --seniority junior
site:naukri.com "machine learning engineer" fresher bangalore
site:wellfound.com/jobs "machine learning engineer" India
```

### Priority 3: Data Science

Second career track - modelling, analytics, experimentation.

Title variants: Data Scientist, Associate Data Scientist, Junior Data Scientist, Data Scientist - Fresher, Decision Scientist, Analytics Engineer (with ML), Data Science Analyst, AI/ML Computational Science Associate

```
"Associate Data Scientist"        (linkedin: Bengaluru)
"Data Scientist" fresher          (linkedin: Bengaluru)
"Junior Data Scientist"           (linkedin: Bengaluru; India remote)
"Decision Scientist"              (linkedin: Bengaluru)
site:naukri.com "data scientist" fresher 2026 bangalore
```

### Priority 4: Adjacent / broader net (run only on "broad")

Roles that use the same skills with a different emphasis. Suggested because the profile fits them well:
- **AI Solutions / Forward-Deployed / Customer AI Engineer** - builds LLM solutions with clients (matches the OTO Capital + Goel Exports consulting mix)
- **Graduate / campus programs** at banks and GCCs - "Graduate Analyst", "Technology Analyst", "Analyst - AI/ML" (matches the Standard Chartered GBS background; watch CGPA cutoffs)
- **Data Analyst with Python/ML**, **Business Intelligence Engineer**, **Analytics Engineer (dbt)** - fallback track
- **MLOps / ML Platform (junior)** - stretch; only when the posting is fresher-level

```
"AI Solutions Engineer"           (linkedin: Bengaluru)
"Forward Deployed Engineer"       (linkedin: Bengaluru; India remote)
"Graduate Analyst" AI             (linkedin: Bengaluru, Hyderabad, Pune)
"Data Analyst" python machine learning fresher   (linkedin: Bengaluru)
"Analytics Engineer" dbt          (linkedin: Bengaluru)
```

### Target Companies (monitor career pages; use `site:` queries or LinkedIn `-q "<company> AI"`)

- **AI-first startups:** Sarvam AI, Krutrim, Observe.AI, Uniphore, Yellow.ai, Haptik, Atlan, Glean (India), Rephrase.ai, Gupshup
- **Fintech / banking GCCs** (proven domain fit): Mastercard, Visa, American Express, JPMorgan Chase, Goldman Sachs, Standard Chartered GBS, Wells Fargo, Razorpay, PhonePe, CRED, Jupiter
- **Product / big tech India:** Google, Microsoft, Amazon, Adobe, Salesforce, Atlassian, Intuit, Walmart Global Tech, Flipkart, Swiggy, Meesho
- **AI/analytics consulting:** Fractal, Tiger Analytics, Sigmoid, LatentView, Tredence, Quantiphi, Mu Sigma

```
site:careers.mastercard.com "AI" OR "machine learning" Bangalore
site:jobs.lever.co OR site:boards.greenhouse.io "AI engineer" Bangalore
site:jobs.ashbyhq.com "LLM" India
```

## Location Filter

Home base Bangalore; relocation within Indian metros is acceptable.
- **Ideal:** Bengaluru / Bangalore (any area, including Whitefield, Electronic City, Outer Ring Road), and remote within India
- **Acceptable:** Hyderabad, Pune, Gurugram / Delhi NCR / Noida, Mumbai / Navi Mumbai, Chennai (relocation needed - note it in the results)
- **Borderline:** Tier-2 Indian cities (Ahmedabad, Kochi, Jaipur, Indore, Coimbatore, Chandigarh, etc.) - flag for the user
- **Too far:** anywhere outside India (not searching abroad), and "remote" roles restricted to other countries

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
