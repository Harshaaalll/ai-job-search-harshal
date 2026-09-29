---
framework_version: 1.1.1
---

# Candidate Profile

<!-- Populated by /setup on 2026-09-28 from documents/cv/Harshal_Bhambhani_Resume_Mastercard_AI_Engineer.pdf,
     the portfolio (harshaaalll.github.io) and public GitHub (github.com/Harshaaalll).
     The CV is the source of truth for titles and dates. Portfolio/GitHub-only items are tagged [source: ...]. -->

## Identity
- **Name:** Harshal Bhambhani
- **Location:** Bangalore, Karnataka, India
- **Phone:** +91 8561972727
- **Email:** bhambhaniharshal@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/harshal-bhambhani-hhbb24
- **GitHub:** https://github.com/Harshaaalll
- **Portfolio:** https://harshaaalll.github.io/
- **Status:** 2026 graduate (B.E., BITS Pilani Hyderabad). Currently employed as AI Engineer at OTO Capital (since Aug 2026). Looking for entry-level / fresher (0-2 years) roles in AI, ML, Data Science, GenAI and AI Agents.
- **Availability:** 30-day notice period at OTO Capital. Salary floor INR 10 LPA total CTC.
- **Constraints:** Based in Bangalore (first priority). Willing to relocate within India to other metros (Hyderabad, Pune, Gurugram/Delhi NCR, Mumbai, Chennai). Not searching abroad.

### Languages

| Language | Level | Notes |
|----------|-------|-------|
| English | Professional working proficiency (fluent) | All CVs, cover letters and interviews in English |

## Education

| Degree | Period | Institution | Key Topics |
|--------|--------|-------------|------------|
| B.E. Electrical & Electronics Engineering, Minor in Computer Science | 2022-2026 | BITS Pilani, Hyderabad Campus | Machine Learning, Statistics & Probability for Analytics, Database Systems, Artificial Intelligence, DSA, Operating Systems, OOP, Computer Programming [coursework source: portfolio] |
| CBSE Class XII | 2021 | MDS Public School [source: portfolio] | 92.2% |
| CBSE Class X | 2019 | St. Paul's Convent School [source: portfolio] | 91.2% |

- **CGPA:** 6.8/10 [source: portfolio]. Deliberately **not printed on the CV**. See the Academic Cutoff Gate in `04-job-evaluation.md`: many Indian campus/fresher postings state a CGPA cutoff (commonly 7.0 or 7.5), and the application must never misstate it on a form that asks.

## Professional Experience

### AI Engineer - OTO Capital (Aug 2026 - Present)
Location not stated on CV (CV header: Bangalore). Source of truth: OTO work record (24 Aug - 29 Sep 2026), received 2026-09-29.
Product: Gemini Live voice agent for loan collections (EMI recovery calls) plus post-call analytics (PCA), regulated lending (RBI norms).

**Scale:** 137 commits over 37 days (110 voice agent, 27 PCA), 2 repos, 24 branches, +31,834/-37,185 lines; 5 lending tenants
(Jana Small Finance Bank, Swarnodhayam MFI, Fusion MFI, Seed Fincap, OTO Capital); 10 languages (Hindi, English, Marathi,
Gujarati, Kannada, Telugu, Tamil, Bengali, Punjabi, Odia); 6 dispatcher routes.
**Stack:** Gemini Live API (native-audio speech-to-speech), Gemini 3.5 Flash, Vertex AI, Pipecat, FastAPI, WebSocket streaming,
Exotel telephony, VAD/barge-in, sub-200ms voice latency budget; tool/function calling, structured output (response_schema),
context caching (CachedContent), prompt engineering/compression, few-shot + dynamic few-shot retrieval, LLM-as-judge, verifier
pattern, guardrails; PostgreSQL (asyncpg, CTEs, window functions), AWS RDS, GCP; A/B arms, regression testing, feature flags,
telemetry, RBI compliance / PII-disclosure controls.

Verified facts (use these numbers exactly):
- **Negotiation engine (flagship):** moved negotiation policy out of the prompt into a deterministic Python state machine
  (3,090-line gate) that approves/refuses the model's calls to 4 gated tools before it speaks; chosen because an LLM verifier
  adds 500ms+ per turn against a sub-200ms voice budget. 15 consequences, 6 severity bands x 7 dials (monotonicity asserted at
  import), 3-step concession ladder, date ladder, figure ratchet, third-party/impersonation latches (87 third-party + 13
  impersonation patterns), 14 reason/stance families with 57 opener variants, 12 mined scenes across 10 situations.
- **Prompt compression (headline):** system prompt cut from ~16,558 to ~3,490 tokens per turn (**79% reduction**) by moving
  situational content into tool responses; a real 22-turn call cost ~101K prompt tokens vs ~370K on the old prompt.
  Token model calibrated from production logs (tokens ~ 0.27135 x chars - 32). Consolidation pass: 420 tokens recovered, 23/23 behaviours retained.
- **Reliability / evals:** regression suite grew 34 -> 89 -> **276 checks**, all passing; 500-call borrower simulator with 5
  archetypes (found 2 bugs on first run; lifted a dpd-45 account from Rs 580 to **Rs 880 per simulated call**); control arm
  byte-identical on every change so other tenants cannot regress; 10 prompt-gate agreement checks; commit gate blocks commits unless all tests pass.
- **Live-call debugging:** **45+ defects** found and fixed across 16 live-call review cycles, each traced from a transcript to a
  line of code (e.g. disclosure to a stranger, invented figures, unguarded call exit, Devanagari parsing, date parsing).
- **Data mining (PCA):** mined **36,091** telecall rows (PostgreSQL) -> 8,600 connected -> 42 verified same-day payments ->
  26 analysed -> 12 curated few-shot scenes. Finding: same-day promise converts 14.1% vs 7.3% (+1 day), 4.8% (+2), ~0% (+3) -
  each day of delay roughly halves recovery; became the product's date ladder.
- **Cost fix:** found Gemini context caches recreated on every restart (140 creations for 23 needed; ~824,500 tokens wasted);
  fixed with lookup-before-create keyed on content hash, verified 10 restarts -> 1 creation.
- **Compliance:** audited 26 human-collector calls against RBI norms: 17 practices flagged, 9 locked as prohibited in the agent;
  closed 3 breach classes (disclosure, impersonation, prohibited advice).
- **Tenant onboarding:** onboarded Jana Small Finance Bank end to end (call stack, schema, auto-debit + WhatsApp payment link,
  escalation routing, identity confirmation); built PCA client with disposition vocabulary (Hardship, Dispute, Senior
  Escalation, Grievance, Query), PTP-verification endpoint, `salvage_json_fields` recovery for Gemini MAX_TOKENS truncation,
  prompt registry (7 blocks, 4 few-shot sets); A/B readout SQL, automated call QA against 12 recurring failure modes.
- Superseded CV wording: "34-check eval suite" is out of date - use 276 checks.

### Data & Analytics Consultant - Goel Exports (Jul 2026 - Aug 2026)
Mostly non-technical ERP/process consulting for a furniture exporter. Source files: documents/projects/goel_exports/ (extracted 2026-09-29).
Verified facts (use these numbers; the files are the source of truth):
- **Order-to-cash model:** 18-stage workflow across 4 phases (Sales FMS stages 1-8, O2D 9-11, PMS 12-14 with a 19-step
  production sub-flow, D2C 15-18) plus Accounts; Mermaid flowcharts (.mmd/.html); "golden thread" key chain lead_id ->
  design_id -> PI -> Order No (master key) -> PO / Job Card / Invoice; 3 fragile links and 5 order types (T1, T2, T3, 3A/SY, T4)
  identified; sales stages verified by the client.
- **Datapoint map:** 132 datapoint entries (120 unique) over 14 stage groups / 60 step rows, **41 unique critical** datapoints
  (failure-mode test: can't trace / wrong flow / wrong money / SLA); each tagged by lineage (Generated/Used/Passed) and system
  of record (ERP, FMS sheet, Google Form, or gap); doer + TAT for 6 client-type columns.
- **CRM configuration:** 24 Odoo CRM activities standardised across 6 pipeline stages by client type.
- **Data reconciliation:** product master 886 vs 859 originals - 855 exact matches, 4 whitespace-only key mismatches, 27 true
  additions classified (incl. 3 junk/test records); 6 vs 3 column schema differences.
- **CRM defect diagnosis:** concerns tracker (Excel data validation + COUNTIF); log analysis showed 6 of 6 forward stage moves
  reversed within the same minute (100%) and activities re-firing; hypothesised an activity-gated automation rule, wrote a
  4-step test plan and an ir.sequence/Studio-field fix design. **Status in files: Open / Blocked - do NOT claim it was fixed.**
- **HR import:** 16-field Odoo employee import template for 11 user seats with dedup and test-before-load rules.
- Version note: files say "Odoo" only; "Odoo 19" comes from the candidate's own CV. Keep only if the candidate confirms.
- Framing for AI/ML/DS roles: lead with data modelling, lineage, data-quality gates, reconciliation and log-based root-cause analysis.

### Data Science Intern - Standard Chartered Global Business Services Pvt. Ltd. (Jul 2025 - Dec 2025)
Bangalore [location source: portfolio]
- Deployed a production NLP pipeline on Dataiku DSS, parsing 100+ page contracts (LMA loan agreements) and cutting audit time 90%.
- Calibrated confidence-threshold guardrails, filtering 95%+ false positives before human compliance review.
- Fine-tuned DistilBERT under a weighted loss, reaching 98.6% recall on rare clauses in 90%+ irrelevant text.
- Adapted SBERT with MultipleNegativesRankingLoss, retrieving gold-standard clauses by cosine similarity.
- Streamlined ETL ingestion with 250-token windows and 50-token overlaps, holding zero data loss on files.
- Official title is **Data Science Intern** (confirmed by candidate 2026-09-28; the portfolio's "Data Scientist" label must not be used on applications).

### Machine Learning Engineer Intern - DG Liger Consulting (Jun 2024 - Jul 2024)
Gurgaon [location source: portfolio]
- Constructed a LangChain RAG assistant over 30+ client PDFs, routing MiniLM embeddings through FAISS.
- Indexed document embeddings into a FAISS vector store, enabling sub-second semantic search at query time.
- Integrated a 3B-parameter LLM over retrieval, grounding answers for business teams in internal documents.
- Official title is **Machine Learning Engineer Intern** (confirmed by candidate 2026-09-28; the portfolio's "Data Analyst Intern" label must not be used on applications).

## Independent Projects

On the CV:
- **Medical Bill OCR - LLM Extraction & Automated Anomaly Detection** (Nov 2025, datathon): structured noisy OCR text into schema-validated JSON via Qwen 7B, standardising fields across templates; flagged billing anomalies with IQR outlier statistics, reconciliation checks and SHA-256 duplicate rules (4 automated fraud checks); processed scanned bills through PaddleOCR with CLAHE and 4x DPI upscaling at 90%+ extraction accuracy. Repo: github.com/Harshaaalll/medical-bill-ocr-fraud
- **Market Analysis Using LLMs - Automated Insights & Self-Service Dashboard** (Jun 2024 - Jul 2024): scraped 500+ articles with BeautifulSoup into an analysis-ready dataset; orchestrated BART summarisation and RoBERTa sentiment stages, rebalancing skewed labels using SMOTE; launched a Flask REST API with a Streamlit dashboard for self-service outputs. README details: LangChain text chunking; two-pass BART (facebook/bart-large-cnn, 4-beam, 900-token chunks then summary-of-summaries) for a 1024-token context limit, 70% length reduction; cardiffnlp twitter-roberta sentiment with compound softmax-weighted score; SMOTE applied after train-test split (55:46 imbalance). Repo: github.com/Harshaaalll/market-analysis-llm
- **Multilingual ASR - Zero-shot Urdu speech recognition** [source: GitHub README]: two-stage pipeline separating acoustic from linguistic correction: audio preprocessing (mono, loudness normalised to -20 dBFS, silence trim, 16 kHz resample, spectral subtraction with librosa + noisereduce for ~-10 dB noise), OpenAI Whisper (small) zero-shot with language="ur" biasing, then IndicBERT masked-LM corrector that replaces words whose probability is below 0.4; reduced Word Error Rate by 14%. Handles Urdu-Hindi code-switching. Repo: github.com/Harshaaalll/multilingual-asr
- **AutoTransFlow - On-Premise Document Pipeline Under Data Constraints** (Aug 2025 - Nov 2025): on-premise NLLB-200 translation pipeline across 200 languages under a zero-external-API data policy; doc-layout-yolo layout detection at a recall-first 0.25 confidence threshold; re-rendered translated text at original bounding boxes with OpenCV, preserving layout. Repo: github.com/Harshaaalll/autotransflow

From GitHub / portfolio (not on the current CV - usable when relevant, verify details in the repo before quoting numbers):
- **Sanwaad - multi-agent complaint resolution** [source: GitHub README, Sep 2026]: LangGraph state machine (listener -> triage -> pattern/judge -> retrieval -> ghostwriter -> validation -> planning -> human review gate -> execution) with 4 agents (Listener, Pattern, Judge, Ghostwriter); act-observe-verify-retry support loop with explicit budgets; Gemini with fallbacks and token caps; local hybrid retrieval (ONNX embeddings + BM25 fused with RRF); FastAPI; typed tool registry with approval requirements; SQLite checkpoints. Offline evals: 15/15 trajectory scenarios, 0 safety violations, 13 loop-eval scenarios, 19 retrieval golden-set cases in English/Hindi/Hinglish (recall@5 1.00, MRR 0.75), tool-call success 0.973, p50/p95 latency 1349.8 ms / 1911.6 ms. Repo: github.com/Harshaaalll/sanwaad. **Strongest AI-agents evidence outside work.**
- **Knowledge Graph RAG for Legal AI** [source: portfolio]: hybrid KG + RAG over 1,000 Indian Supreme Court cases using Neo4j, Vespa, InLegalBERT and Mistral with IRAC-style reasoning.
- **Career Copilot 2.0** [source: portfolio/GitHub]: AI job-search system with 11 modules - FAISS-based job matching, response prediction, ATS optimisation; LangChain + Groq LLaMA 3. Repo: github.com/Harshaaalll/career-copilot
- **Multilingual ASR System** [source: portfolio]: zero-shot Urdu speech recognition with Whisper plus an IndicBERT MLM corrector; 14% WER. Repo: github.com/Harshaaalll/multilingual-asr
- **AirFare-ML** [source: portfolio]: airline ticket price prediction benchmarking 6 regression algorithms (LightGBM, XGBoost, scikit-learn) with SHAP; R^2 93.9%, MAE Rs 689. Repo: github.com/Harshaaalll/airfare-ml
- **HydRERA Analytics** [source: portfolio]: real-estate analytics platform, ELT pipeline Python -> PostgreSQL -> dbt, Power BI builder scorecards, XGBoost delay prediction. Repo: github.com/Harshaaalll/hydera-analytics
- **Audit Insight - NLP Analytics** [source: portfolio]: RoBERTa sentiment, Gensim LDA topics, spaCy, t-SNE clustering, Streamlit dashboard for audit text. Repo: github.com/Harshaaalll/audit-insight
- **Hasthkala Setu** [source: portfolio, BITS design project]: XGBoost + SHAP conflict-resolution model (AUC 0.938, 776 subjects) plus a Flutter/Firebase app for artisans.
- **Road Safety NLP Analysis** [source: portfolio]: spaCy NER classification of accident severity from 8 Hyderabad news outlets.
- **StemCells DBMS** [source: portfolio]: Flask + MySQL donor/patient/hospital management system.
- **Agentic tooling exploration** [source: GitHub]: agentic-api_me (Rust, stateful API logic for agentic apps with vLLM), deepseek-harness (TypeScript plugin harness). Treat as exploration; do not claim production use.

## Technical Skills

### Programming & ML
- **Python** (primary, production use): Pandas, NumPy, scikit-learn, FastAPI, Flask, Streamlit
- **SQL** (production use): PostgreSQL, MySQL; dbt [portfolio project]
- **GenAI & Agents:** LLMs, prompt engineering, agentic AI, tool calling, RAG, LangChain, LangGraph [Sanwaad], FAISS, guardrails, hallucination mitigation, Gemini (Gemini Live), Qwen 7B, Mistral, LLaMA 3 (Groq), vector search, hybrid retrieval (BM25 + embeddings, RRF)
- **NLP:** Transformers fine-tuning (DistilBERT, SBERT/sentence-transformers with MultipleNegativesRankingLoss), BART, RoBERTa, NLLB-200, Whisper, IndicBERT, InLegalBERT, spaCy, Gensim
- **Classical ML:** XGBoost, LightGBM, SHAP, SMOTE, regression/classification benchmarking
- **Computer vision / documents:** PaddleOCR, OpenCV (CLAHE), doc-layout-yolo
- **Evaluation & Responsible AI:** eval suites, A/B control arms, trajectory evals, retrieval evals (recall@k, MRR), model monitoring, compliance-aware design

### Domain Expertise
- Document AI / contract and legal NLP (banking loan agreements, Supreme Court cases)
- GenAI in regulated financial services (fintech, banking)
- Multilingual NLP (200-language translation, 10-language voice agent, Indic ASR)
- Business analytics and data modelling (ERP/Odoo order-to-cash, cohort analysis)

### Software & Tools
- GCP Vertex AI, AWS (S3), Docker, Kubernetes [portfolio - exposure level], Git, Dataiku DSS, Power BI, Odoo 19, Neo4j, Vespa, Firebase, Flutter, BeautifulSoup, Selenium, REST APIs, technical documentation

## Publications
None.

## Awards
- State-level representative in two sports (basketball and cricket) [source: portfolio]
- Volleyball gold medalist [source: portfolio]
- Former logistics team captain [source: portfolio]

## References
Not yet provided. "Available upon request."
