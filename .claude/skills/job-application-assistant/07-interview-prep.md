---
framework_version: 1.0.0
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- Populated by /setup 2026-09-28 from the CV. S/T framing and all numbers are from the CV; the *italic prompts* mark details only Harshal knows - fill them in before relying on the story. -->

### 1. Hallucination verifier for a production voice agent - OTO Capital (reliability, GenAI engineering)
**S:** OTO Capital runs a Gemini Live agent with tool calling on FastAPI for 5 regulated clients across 10 languages. In a regulated setting, the LLM occasionally stated figures that did not match the source data.
**T:** Make the agent's numeric answers trustworthy without losing the natural conversational flow.
**A:** Put 4 LLM tools behind a deterministic Python verifier that checks every turn before the answer reaches the user, and built a 34-check eval suite with byte-identical control arms so every production release is gated on regression results. *[Add: how a failed check is handled - retry, fallback phrase, or human handoff?]*
**R:** Hallucinated figures mitigated on the gated tools, and releases now ship only after passing the 34 checks. *[Add any before/after number if you have one.]*
**Use for:** "Tell me about a hard technical problem", "How do you handle LLM hallucinations?", "How do you test ML/LLM systems?", "Tell me about working in a regulated environment"

### 2. Rare-clause detection in 100+ page loan contracts - Standard Chartered GBS (NLP, imbalanced data, impact)
**S:** Compliance reviewers audited 100+ page contracts manually; the clauses that mattered were rare, buried in 90%+ irrelevant text.
**T:** Build and deploy an NLP pipeline that finds those clauses reliably enough for compliance to trust.
**A:** Chunked documents with 250-token windows and 50-token overlaps (zero data loss); fine-tuned DistilBERT with a weighted loss for class imbalance; adapted SBERT with MultipleNegativesRankingLoss to retrieve gold-standard clauses by cosine similarity; calibrated confidence thresholds to filter false positives; deployed on Dataiku DSS.
**R:** 98.6% recall on rare clauses, 95%+ of false positives filtered before human review, audit time cut by 90%.
**Use for:** "Biggest impact you've had", "How do you handle class imbalance?", "Precision vs recall trade-off", "Walk me through an end-to-end ML project"

### 3. Data that changed a product decision - OTO Capital (data science, stakeholder influence)
**S:** The product had a promise-date policy (when customers are promised something) that was set without cohort evidence.
**T:** Find out what the operational data said about it.
**A:** Mined 36,091 PostgreSQL records into cohort analyses and presented the insights to the product owners. *[Add: what the key finding was and who you convinced.]*
**R:** The insights redirected the product's promise-date policy.
**Use for:** "Tell me about a time data changed a decision", "How do you communicate findings to non-technical stakeholders?", SQL/analytics rounds

### 4. RAG assistant over client documents - DG Liger Consulting (first industry project, RAG fundamentals)
**S:** Business teams needed answers from 30+ internal client PDFs.
**T:** Build an assistant that answers grounded in those documents.
**A:** Built a LangChain RAG pipeline: MiniLM embeddings indexed in FAISS for sub-second semantic search, with a 3B-parameter LLM generating answers over the retrieved context.
**R:** Business teams got grounded answers from internal documents. *[Add: usage or feedback if known.]*
**Use for:** "Explain RAG", "How do you choose chunk size / embeddings?", "How would you evaluate a RAG system?"

### 5. Multi-agent system with evals first - Sanwaad (AI agents, system design, independent initiative)
**S:** Personal project: turn public complaints into resolved cases safely, including actions that move money.
**T:** Design an agent system that is safe to act, not just to chat.
**A:** LangGraph state machine with Listener, Pattern, Judge and Ghostwriter agents, hybrid retrieval (ONNX embeddings + BM25 with RRF), a typed tool registry with approval requirements, and human review gates for money moves; trajectory, loop and retrieval evals built alongside.
**R:** 15/15 trajectory scenarios pass offline with 0 safety violations; recall@5 1.00 on a 19-case English/Hindi/Hinglish retrieval set; tool-call success 0.973.
**Use for:** "Design an AI agent for X", "How do you keep agents safe?", "What are you building outside work?"

### 6. Clean data under a tight timeline - Goel Exports (data modelling, debugging, consulting)
**S:** A furniture exporter was running order-to-cash on Odoo with inconsistent data and broken CRM automations.
**T:** Model the process properly and fix the automation defects in a short engagement.
**A:** Documented a 4-phase Odoo 19 data model; enforced field-level data-quality rules across 6 pipeline stages via a critical-datapoint framework; traced tag-trigger and activity-routing errors through system logs.
**R:** Documented data model and fixed CRM automations within about a month.
**Use for:** "Tell me about debugging something unfamiliar", "Working with non-technical clients", data-quality questions

## Common Tough Questions

### "You joined OTO Capital in August - why are you looking already?" / "Why did you leave Goel Exports after a month?"
> Goel Exports was a short, scoped consulting engagement that ended when the data model and fixes were delivered. At OTO Capital I'm doing work I value - production agents with evals - and I'm exploring roles where I can go deeper in [the specific thing this company offers: scale, mentorship, a GenAI product]. Stay positive about OTO Capital; never criticise it. *[Harshal to adjust to the true reason.]*

### "You don't have [specific skill/experience]."
> Acknowledge it directly, then bridge: "I haven't used X in production, but I've done Y, which covers the same core idea" (e.g. no Kubernetes at scale, but Docker and deployed services on FastAPI/Dataiku). Give one concrete example of learning a new stack quickly - moving from Odoo data modelling to LLM agents within months.

### "Why is your CGPA 6.8?" (common in Indian fresher interviews)
> Be honest and brief, no excuses: "My CGPA doesn't reflect where I put most of my energy - I focused on applied ML, 2 internships and 14+ deployed projects, and state-level sport. I'd rather be judged on what I've shipped", then point to the 98.6% recall / 90% audit-time result. *[Harshal to adjust.]*

### "Where do you see yourself in 5 years?"
> A strong AI/ML engineer who owns GenAI systems end to end, from design and evaluation to production reliability, and mentors newer engineers. Tie it to the company's growth path.

### "What's your biggest weakness?"
> Suggested: "I tend to over-invest in verification before shipping - on the eval suite at OTO I learned to prioritise the checks that catch real failures and ship the rest iteratively." *[Pick a genuine one and keep the mitigation concrete.]*

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

### Technical rounds to prepare for (typical Indian fresher AI/ML loop)
- Online assessment: DSA (arrays, strings, hashing, trees, DP - LeetCode easy/medium), SQL (joins, window functions), Python
- ML fundamentals: bias/variance, regularisation, metrics (precision/recall/F1/AUC), class imbalance, tree ensembles, gradient boosting
- Deep learning / NLP: transformers and attention, fine-tuning vs prompting, embeddings, tokenisation
- GenAI: RAG design (chunking, retrieval, reranking, evaluation), hallucination mitigation, agents and tool calling, LLM evaluation, cost/latency trade-offs
- Project deep-dive: be ready to whiteboard the Standard Chartered pipeline and the OTO Capital agent architecture

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
