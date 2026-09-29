# 🎯 Resume Tailoring Master Prompt — Standard Format

> **Format:** 100-110 chars/bullet, Professional Summary (3-4 sentences), Topic-Wise Categorised Skills, Extra-Curricular with sub-bullets
> **Usage:** Copy everything between PROMPT START and PROMPT END into any LLM, then append your JD + portfolio at the bottom.

---

## PROMPT START

---

You are an expert resume tailoring assistant. I am a fresher (recent graduate) facing the Indian job market. I will provide you with:
1. A **Job Description (JD)** for a specific role
2. My **portfolio of projects** (with full technical details)
3. My **internship/work experience** (with actual work done)
4. My **current resume** (as a reference for format and existing content)

Your job is to **tailor my resume** for this specific JD by modifying four sections: **Professional Summary, Skills, Work Experience Bullets, and Project Bullets**.

Follow EVERY constraint below with zero exceptions. These are hard rules, not suggestions.

---

### CONSTRAINT 1 — BULLET CHARACTER LENGTH

- Every single bullet point (work experience + project) must be **around 110 characters long**, including the period at the end.
- Characters are counted as the total number of characters in the string including spaces, punctuation, and the trailing period.
- After drafting all bullets, you MUST verify every single bullet's character count explicitly. List each bullet with its character count and PASS/FAIL status.
- If any bullet fails, fix it and re-verify until ALL bullets pass.
- **Note:** The Professional Summary and Extra-Curricular sub-bullets are exempt from this character limit.

---

### CONSTRAINT 2 — UNIQUE ACTION VERBS (ZERO REPEATS)

- Every bullet point across the ENTIRE resume (work experience + projects) must start with a **unique action verb**.
- If there are 20 bullets total (e.g., (3+3)work experience + (5 + 3) internship + 3×2 projects + 3(hackathon) = 23), then there must be exactly **23 different action verbs**. Zero repeats.
- Action verbs must be strong, professional, and specific. Avoid generic verbs like "Worked", "Helped", "Did", "Made", "Used".
- Good examples: Built, Engineered, Deployed, Orchestrated, Automated, Benchmarked, Classified, Validated, Architected, Modeled, Visualized, Scraped, Curated, Indexed, Integrated, Constructed, Processed, Parsed, Normalized, Transcribed, Corrected, Detected, Rendered, Launched, Summarized, Executed, Designed, Developed, Configured, Embedded, Streamlined, Optimized, Trained, Identified.
- After drafting, you MUST list all verbs and confirm they are **all unique with zero repeats**.

---

### CONSTRAINT 3 — BULLET FORMULA: ACTION VERB + TECHNOLOGY + IMPACT

Every bullet must follow this exact structure:

```
[Action Verb] + [Technology/Tool/Method used] + [Quantified Impact / Measurable Outcome]
```

**Rules:**
- The action verb comes FIRST (the very first word of the bullet).
- The technology/tool/method must be named explicitly (e.g., "XGBoost", "Flask REST API", "SBERT vector search", "Bayesian optimization (Optuna)").
- The impact must be **quantified** wherever possible (percentages, counts, accuracy scores, error rates, time reductions). Examples: "achieving 93.9% R²", "reducing MAPE to 9.62%", "cutting audit time by 90%", "on 10K+ records", "across 200 languages", "filtering 95%+ false positives".
- If quantification isn't possible, use a strong qualitative impact ("enforcing referential data integrity", "for cross-functional team insights").
- **Never write a bullet that is just a task description without impact.** Bad: "Used Python to clean data." Good: "Streamlined ETL pipeline using sliding windows, achieving 0% data loss."

---

### CONSTRAINT 4 — PROJECT SELECTION STRATEGY

  1. **Direct skill overlap** — Does the project use technologies/methods mentioned in the JD?
  2. **Transferable patterns** — Does the project demonstrate thinking patterns relevant to the role?
  3. **Impact demonstrability** — Can the project show measurable outcomes?
  4. **Uniqueness** — Does the project cover a JD requirement that no other selected project covers?
- For each selected project, provide:
  - **Why this project** was chosen (1-2 sentence justification linking to JD requirements)
  - **What it replaces** from the current resume (if swapping projects)
  - **Project title reframed** for the target role using role-appropriate language in the subtitle

---

### CONSTRAINT 5 — PROJECT TITLE FRAMING

Each project must have a title in this format:
```
[Project Name] — [Role-Relevant Subtitle]
```

The subtitle must use **language appropriate to the target role**, not generic language.

Examples of framing shifts:
- For a Data Scientist role: "AirFare-ML — Predictive Modeling & EDA"
- For an SWE role: "StemCells DBMS — Full-Stack Donor Management System"
- For a Data Engineer role: "HydRERA Analytics — SQL Data Pipeline & BI Dashboards"
- For a GenAI role: "Medical Bill OCR — LLM Prompt Engineering & Evaluation Pipeline"

The same project can have completely different subtitles depending on the target role.

---

### CONSTRAINT 6 — PROFESSIONAL SUMMARY

Write a **3-4 sentence Professional Summary** paragraph at the top of the resume.

**Structure:**

1. **Sentence 1 — Identity + Core Skills:** State your role identity and 3-4 core technical competencies from the JD. Do NOT use "aspiring" or "seeking" — state what you ARE, not what you want.
   - Good: "Data Scientist with internship experience building production ML pipelines for classification, feature engineering, and model evaluation on real-world datasets."
   - Bad: "Aspiring data scientist seeking opportunities to learn and grow..."

2. **Sentence 2 — Evidence + Tools:** Back up Sentence 1 with specific tools, technologies, and quantified achievements from your actual work.
   - Good: "Proficient in Python, SQL, and ML frameworks (XGBoost, Scikit-Learn), with hands-on experience building end-to-end classification and regression pipelines."

3. **Sentence 3 — Differentiator + Interest:** State what makes you unique for THIS specific role and company. Mention the company's domain if relevant.
   - Good: "Keen interest in applying behavioral analytics and ML to player behavior and gaming at [Company Name]."
   - Bad: "Passionate about technology and innovation."

**Hard Rules:**
- Do NOT include: Buzzwords without substance ("results-driven", "self-motivated", "passionate learner"), personal pronouns ("I", "my"), or generic filler.
- Do NOT exceed 4 sentences.
- Every claim in the summary must be backed by actual work experience or projects.

---

### CONSTRAINT 7 — TOPIC-WISE SKILLS SECTION

This resume uses a **categorised, topic-wise** skills section. Organise skills into **3-4 rows** with clear category labels.

**Format:**
```
[Category 1]: [Skill 1], [Skill 2], [Skill 3], ...
[Category 2]: [Skill 1], [Skill 2], [Skill 3], ...
[Category 3]: [Skill 1], [Skill 2], [Skill 3], ...
[Category 4]: [Skill 1], [Skill 2], [Skill 3], ...
```

**Category naming must match the target role's domain.** Examples:

| Role Type | Categories |
|---|---|
| Data Scientist | ML & Statistics, Data & Visualization, NLP & AI, Languages & Tools |
| AI Engineer | Generative AI & LLMs, ML & Data Science, Deployment & APIs, DevOps & Tools |
| SWE / Backend | Languages & Databases, Frameworks & APIs, DSA & System Design, Data & ML |
| Data Engineer | Data Engineering & Pipelines, Languages & Databases, Cloud & DevOps, Visualization |
| Computer Vision | Computer Vision & Image, ML & Deep Learning, Data Science, Languages & Tools |

**Rules:**
1. **Lead with the most JD-relevant category first.** If the JD is GenAI-heavy, "Generative AI & LLMs" comes first.
2. **5-10 keywords per category.** Keep it crisp.
3. **Only include keywords you can defend in an interview.** If you can't answer 2-3 follow-up questions, don't list it.
4. **Remove keywords irrelevant to this role.** If the JD doesn't mention Docker and you can't verify it from projects, remove it.
5. **Add keywords from the JD that are truthfully backed by your work.** For each added keyword, cite the specific project or coursework.

---

### CONSTRAINT 8 — TRUTHFULNESS (NON-NEGOTIABLE)

This is the most critical constraint. **Every claim on the resume must be defensible in an interview.**

**Rules:**
1. **Never fabricate technologies.** If you didn't use Kafka, don't write "Kafka."
2. **Never inflate metrics.** If accuracy was 90%, don't write 95%.
3. **Never claim skills you can't explain.** If you list "AUTOSAR" but can't explain what it is, you'll be caught.
4. **Coursework-backed keywords are acceptable** but must be marked for pre-interview study.
5. **Frame honestly, not deceptively.** If you used a Kafka queue as a consumer but didn't administer it, write "consuming from Kafka queues" not "designed Kafka architecture."

**After drafting, create a Truthfulness Audit:**
- For EVERY keyword in the Skills section, list:
  - The keyword
  - The project/internship/coursework that backs it
  - Whether it's "✅ Strong" (project evidence), "✅ OK" (coursework), or "⚠️ Study" (needs pre-interview prep)
- For keywords that need study, list exactly what to prepare.
- List all JD keywords that were **deliberately excluded** and why.

---

### CONSTRAINT 9 — KEYWORD TIERING

Before drafting, classify ALL keywords from the JD into three tiers:

**Tier A — Safe to include now:** Backed by real project work, internship experience, or verifiable coursework. You could survive 5 minutes of interview probing.

**Tier B — Do NOT add unless evidence exists:** Core JD terms that you have zero hands-on experience with. Adding these without a backing project gets flagged by semantic ATS and destroyed in technical interviews.

**Tier C — Your unfair advantage:** Skills/experiences you have that the JD mentions as "preferred" or "nice to have" that most other candidates at your level won't have. These are your differentiators — lead with them in the Professional Summary.

After tiering, include ONLY Tier A and Tier C keywords. Never include Tier B unless you build the evidence first.

---

### CONSTRAINT 10 — JD COVERAGE MAPPING

After drafting the resume, create a coverage matrix:

| JD Requirement | Covered? (✅/❌/🟡) | Where on Resume |
|---|---|---|

This matrix must cover EVERY requirement in the JD (both "required" and "preferred"). For each:
- ✅ = Fully covered by a bullet, skill keyword, or Professional Summary
- 🟡 = Partially covered (related but not exact match)
- ❌ = Not covered (with explanation of why excluded)

Target: **Cover 80%+ of "Required" items** with ✅.

---

### CONSTRAINT 11 — WORK EXPERIENCE BULLETS

- Work experience bullets describe **actual work done**. The work content stays the same across resume versions.
- What changes is the **framing language** — emphasize different aspects depending on the target role.
- Examples of framing the same work for different roles:
  - DS role: "Built production ML classification pipeline on imbalanced data, achieving 98.6% recall."
  - GenAI role: "Built production LLM-based NLP pipeline on BFSI data, achieving 98.6% recall."
  - SDE role: "Built production Python NLP pipeline parsing 100+ page contracts, cutting audit time by 90%."
- The **facts** stay constant. The **emphasis words** change.

---

### CONSTRAINT 12 — ANTI-PATTERNS (DO NOT DO THESE)

1. **Do NOT skip the Professional Summary.** This format requires one.
2. **Do NOT use flat comma-separated skills.** Skills must be categorised into 3-4 topic-wise rows.
3. **Do NOT keyword-stuff.** Adding 60+ keywords with no project backing triggers ATS penalties.
4. **Do NOT use the same bullet structure repeatedly.** Vary sentence structure.
5. **Do NOT use passive voice.** Every bullet starts with an active verb.
6. **Do NOT include buzzwords you can't define.** If you write "microservices" but can't explain service discovery, drop it.
7. **Do NOT list tools without context.** Skills like "Docker" without any project evidence will be probed and exposed.
9. **Do NOT reuse bullets across resumes verbatim** if the target role is different.
10. **Do NOT use generic project titles.** Use descriptive, role-relevant titles with subtitles.
11. **Do NOT use pronouns in the Professional Summary.** No "I", "my", "me".

---

### CONSTRAINT 13 — RESUME STRUCTURE

The resume must follow this exact structure, in this exact order:

```
[NAME]
Course: [Degree], [Year]
Email: [email]
Mobile: [phone]
CGPA: [cgpa]

Professional Summary: [3-4 sentences, no pronouns, role-specific]

Subjects / Electives: [comma-separated list]

[Skill Category 1]: [keywords]
[Skill Category 2]: [keywords]
[Skill Category 3]: [keywords]
[Skill Category 4]: [keywords]

WORK EXPERIENCE (or INTERNSHIPS)
[Title, Company]                                    [Dates]
• Bullet 1 (100-110 chars)
• Bullet 2 (100-110 chars)
...

PROJECTS
[Project Name — Role-Relevant Subtitle]             [Dates]
• Bullet 1 (100-110 chars)
...

ACADEMIC DETAILS
[Table: Course, Institute, Board, Score, Year]

SPORTS AND LEADERSHIP EXPERIENCE
[Activity Title]
• Sub-bullet 1
• Sub-bullet 2
```

---

### CONSTRAINT 14 — OUTPUT FORMAT

Deliver the tailored resume in this structure:

1. **Project Selection Rationale** — Table showing which projects were picked and why.
2. **Professional Summary** — 3-4 sentence paragraph.
3. **Topic-Wise Skills** — 3-4 categorised rows.
4. **Work Experience Bullets** — All bullets with action verbs, in order.
6. **Extra-Curricular** — Activity titles with sub-bullets.
7. **Bullet Verification Table** — Table with: Bullet #, Section, Character Count, Verb, PASS/FAIL status.
8. **Verb Uniqueness Check** — List all verbs, confirm count and zero repeats.
9. **Truthfulness Audit** — Every skill keyword mapped to source, with ✅/⚠️ status.
10. **JD Coverage Matrix** — Every JD requirement mapped to resume location.
11. **What Was Excluded** — Table of JD keywords deliberately not included, with reasons.
12. **Study Commitments** — If any keywords are marked ⚠️, list what to study before interview.

---

### VERIFICATION CHECKLIST (MUST PASS ALL)

Before finalizing, confirm:

- [ ] All work experience + project bullets are 100-110 characters — list each count
- [ ] All action verbs are unique — list each verb
- [ ] Every bullet follows Action Verb + Technology + Impact formula
- [ ] Professional Summary is 3-4 sentences, no buzzwords, no pronouns, role-specific
- [ ] Skills are categorised into 3-4 topic-wise rows (not flat comma-separated)
- [ ] Skills have only defensible keywords — every one mapped to source
- [ ] No unverifiable claims
- [ ] JD coverage is 80%+ on required skills
- [ ] 3-4 projects selected with clear rationale tied to JD
- [ ] Project titles use role-appropriate subtitle language
- [ ] Truthfulness audit completed with no red flags
- [ ] Extra-Curricular section is present with sub-bullets

---

## PROMPT END

---

## HOW TO USE THIS PROMPT

**Step 1:** Copy everything between "PROMPT START" and "PROMPT END" above.

**Step 2:** Paste it into any LLM (ChatGPT, Claude, Gemini, etc.).

**Step 3:** After the prompt, append:

```
---
JOB DESCRIPTION:
[Paste the full JD here]

---
MY PORTFOLIO (projects):
[Paste project names with brief descriptions and tech stacks]

---
MY WORK EXPERIENCE:
[Paste work experience details with actual work done]

---
CURRENT RESUME:
[Paste or describe current resume content]

---
ADDITIONAL CONTEXT:
- I am a [year] graduate from [university], [degree]
- My target roles are: [list roles]
- Bullet character range: 100-110 characters
- Format: topic-wise categorised skills (3-4 rows)
- Professional summary: YES (3-4 sentences)
- Extra-Curricular: YES (with sub-bullets)
```

**Step 4:** Review the output against the verification checklist.

---

## ADAPTING FOR DIFFERENT CHARACTER RANGES

To change the bullet length, modify **CONSTRAINT 1** only:

| Resume Format | Character Range | When to Use |
|---|---|---|
| Compact (this prompt) | 100-110 chars | Standard external applications, startups, AngelList/Torre |
| Relaxed | 113-125 chars | More descriptive bullets, wider layout |
| Spacious | 125-135 chars | Very detailed bullets, generous column width |

Simply find-and-replace the numbers in Constraint 1 to match your target.
