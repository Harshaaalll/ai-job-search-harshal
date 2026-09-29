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
Location not stated on CV (CV header: Bangalore)
- Shipped a Gemini Live agent with tool calling on FastAPI, serving 5 regulated clients across 10 languages.
- Mitigated hallucinated figures by gating 4 LLM tools behind a deterministic Python verifier every turn.
- Mined 36,091 PostgreSQL records into cohort insights that redirected the product's promise-date policy.
- Instrumented a 34-check eval suite with byte-identical control arms, gating each production release.
- Context: regulated (financial) setting, 5 enterprise clients.

### Data & Analytics Consultant - Goel Exports (Jul 2026 - Aug 2026)
- Modelled a furniture exporter's full order-to-cash process into a documented 4-phase Odoo 19 data model.
- Enforced field-level data quality rules across 6 pipeline stages via a critical-datapoint framework.
- Traced CRM automation defects through Odoo system logs, fixing tag-trigger and activity-routing errors.

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
- **Market Analysis Using LLMs - Automated Insights & Self-Service Dashboard** (Jun 2024 - Jul 2024): scraped 500+ articles with BeautifulSoup into an analysis-ready dataset; orchestrated BART summarisation and RoBERTa sentiment stages, rebalancing skewed labels using SMOTE; launched a Flask REST API with a Streamlit dashboard for self-service outputs. Repo: github.com/Harshaaalll/market-analysis-llm
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
