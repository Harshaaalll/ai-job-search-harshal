// Shapes served by dashboard/server.py (GET /api/state). Fields the pipeline has not
// written for a given job are absent, so everything optional really is optional.

export interface Job {
  key: string;
  title: string;
  company: string;
  url: string;
  location?: string;
  portal?: string;
  ats?: string;
  first_seen?: string;
  posted_date?: string | null;
  deadline?: string | null;
  // pipeline state
  status?: "new" | "ranked" | "expired" | "skipped";
  fit?: string;
  rank_score?: number | null;
  rank_verdict?: string;
  location_verdict?: string;
  language_gate?: string;
  language_note?: string;
  strengths?: string[];
  gaps?: string[];
  pipeline_state?: "selected" | "drafted" | "skipped" | "failed";
  pipeline_note?: string;
  apply_queue?: number;
  user_status?: "dismissed" | "applied";
  tracker_status?: string | null;
  tracker_source?: string | null;
  // freehire facets (see pipeline/run.py)
  slug?: string;
  work_mode?: string | null;
  category?: string | null;
  seniority?: string | null;
  skills?: string[];
  experience_note?: string;
  pay_evidence?: string;
  pay_note?: string;
}

export interface TrackerRow {
  date: string;
  company: string;
  sector: string;
  role: string;
  role_type: string;
  channel: string;
  status: string;
  contact_person: string;
  fit_rating: string;
  notes: string;
  cv_file: string;
  cover_letter_file: string;
  source: string;
  deadline: string;
}

export interface PipelineStatus {
  running?: boolean;
  started?: string;
  finished?: string | null;
  stage?: string | null;
  ok?: boolean;
  error?: string | null;
  stages?: Record<string, { ok?: boolean; at?: string; current?: string | null; [k: string]: unknown }>;
}

export interface DashboardState {
  jobs: Job[];
  tracker: TrackerRow[];
  status: PipelineStatus;
  next_run: string | null;
  counts: { seen_total: number };
  now: string;
}

export interface JobDetail {
  description: string | null;
  skills: string[];
  note?: string;
}

export type JobAction = "applied" | "dismiss" | "restore" | "queue" | "unqueue";
