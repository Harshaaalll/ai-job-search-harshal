import type { Job, TrackerRow } from "./types";

// Pure filter / sort / bucket logic. No React or native imports, so it is unit-testable in Node.

export type CityId = "bengaluru" | "hyderabad" | "pune" | "gurugram" | "other";
export type SortKey = "score" | "newest" | "company" | "city";
export type Bucket = "top" | "ready" | "queue" | "new" | "hidden";

export interface Filters {
  query: string;
  cities: CityId[]; // empty = any
  categories: string[]; // ml_ai | ai_engineering | data_science | unknown; empty = any
  workModes: string[]; // remote | hybrid | onsite | unknown; empty = any
  postedWithin: number; // days; 0 = any
  hideStretch: boolean; // hide postings that state "2-4 years" style ranges
  hideSenior: boolean; // hide senior/lead/staff/principal seniority tags
  ats: string[]; // source ATS ids; empty = any
  minScore: number; // 0 = any
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  cities: [],
  categories: [],
  workModes: [],
  postedWithin: 0,
  hideStretch: false,
  hideSenior: true,
  ats: [],
  minScore: 0,
  sort: "score",
};

// Same order as pipeline/config.json "city_priority": Bangalore first.
export const CITY_ORDER: CityId[] = ["bengaluru", "hyderabad", "pune", "gurugram", "other"];
export const CITY_LABEL: Record<CityId, string> = {
  bengaluru: "Bengaluru",
  hyderabad: "Hyderabad",
  pune: "Pune",
  gurugram: "Gurugram",
  other: "Other",
};
const CITY_PATTERN: Record<Exclude<CityId, "other">, RegExp> = {
  bengaluru: /bengaluru|bangalore/i,
  hyderabad: /hyderabad/i,
  pune: /\bpune\b/i,
  gurugram: /gurugram|gurgaon/i,
};

export const SENIOR_TAGS = ["senior", "lead", "staff", "principal", "c_level"];

export function cityOf(location: string | undefined | null): CityId {
  const loc = location || "";
  for (const id of ["bengaluru", "hyderabad", "pune", "gurugram"] as const) {
    if (CITY_PATTERN[id].test(loc)) return id;
  }
  return "other";
}

const DAY_MS = 86_400_000;

function postedAt(j: Job): number | null {
  const t = Date.parse(j.posted_date || j.first_seen || "");
  return Number.isNaN(t) ? null : t;
}

export function matchesFilters(j: Job, f: Filters, now: number): boolean {
  const q = f.query.trim().toLowerCase();
  if (q) {
    const hay = [j.title, j.company, j.location, ...(j.skills || [])].join(" ").toLowerCase();
    if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
  }
  if (f.cities.length && !f.cities.includes(cityOf(j.location))) return false;
  if (f.categories.length && !f.categories.includes(j.category || "unknown")) return false;
  if (f.workModes.length && !f.workModes.includes(j.work_mode || "unknown")) return false;
  if (f.ats.length && !f.ats.includes(j.ats || "unknown")) return false;
  if (f.minScore && (j.rank_score ?? -1) < f.minScore) return false;
  if (f.hideStretch && j.experience_note) return false;
  if (f.hideSenior && j.seniority && SENIOR_TAGS.includes(j.seniority)) return false;
  if (f.postedWithin) {
    const t = postedAt(j);
    // An undated posting is kept: unknown is not a reason to hide it.
    if (t !== null && now - t > f.postedWithin * DAY_MS) return false;
  }
  return true;
}

export function sortJobs(jobs: Job[], sort: SortKey): Job[] {
  const cityIdx = (j: Job) => CITY_ORDER.indexOf(cityOf(j.location));
  const compare: Record<SortKey, (a: Job, b: Job) => number> = {
    score: (a, b) => (b.rank_score ?? -1) - (a.rank_score ?? -1) || cityIdx(a) - cityIdx(b),
    newest: (a, b) => String(b.posted_date || b.first_seen || "").localeCompare(String(a.posted_date || a.first_seen || "")),
    company: (a, b) => a.company.localeCompare(b.company),
    city: (a, b) => cityIdx(a) - cityIdx(b) || (b.rank_score ?? -1) - (a.rank_score ?? -1),
  };
  return jobs.slice().sort(compare[sort]);
}

export function applyFilters(jobs: Job[], f: Filters, now: number = Date.now()): Job[] {
  return sortJobs(jobs.filter((j) => matchesFilters(j, f, now)), f.sort);
}

export function activeFilterCount(f: Filters): number {
  const d = DEFAULT_FILTERS;
  return [
    f.cities.length > 0,
    f.categories.length > 0,
    f.workModes.length > 0,
    f.ats.length > 0,
    f.postedWithin !== d.postedWithin,
    f.minScore !== d.minScore,
    f.hideStretch !== d.hideStretch,
    f.hideSenior !== d.hideSenior,
  ].filter(Boolean).length;
}

// ---- buckets (mirror dashboard/index.html so both UIs agree) ----

export interface ReadyItem {
  row: TrackerRow;
  job: Job | undefined;
}

export interface Buckets {
  top: Job[];
  queue: Job[];
  new: Job[];
  hidden: Job[];
  ready: ReadyItem[];
  applied: ReadyItem[];
}

const norm = (s: string | undefined | null) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function bucketize(jobs: Job[], tracker: TrackerRow[]): Buckets {
  const findJob = (r: TrackerRow) =>
    jobs.find((j) => r.source && j.tracker_source === r.source && norm(j.company) === norm(r.company)) ||
    jobs.find((j) => norm(j.company) === norm(r.company) && norm(j.title) === norm(r.role));
  const isApplied = (j: Job) => j.user_status === "applied" || (!!j.tracker_status && j.tracker_status !== "drafted");
  const active = jobs.filter((j) => j.user_status !== "dismissed" && !isApplied(j) && j.status !== "expired");
  return {
    top: active.filter((j) => j.status === "ranked" && j.tracker_status !== "drafted"),
    queue: active
      .filter((j) => j.apply_queue && j.tracker_status !== "drafted")
      .sort((a, b) => (a.apply_queue ?? 0) - (b.apply_queue ?? 0)),
    new: active.filter((j) => j.status === "new"),
    hidden: jobs.filter(
      (j) => j.user_status === "dismissed" || j.status === "expired" || ["skipped", "failed"].includes(j.pipeline_state || ""),
    ),
    ready: tracker.filter((r) => r.status === "drafted").map((row) => ({ row, job: findJob(row) })),
    applied: tracker.filter((r) => r.status && r.status !== "drafted").map((row) => ({ row, job: findJob(row) })),
  };
}

/** The tracker row for a job (latest wins), matched like the web dashboard: URL first, then company + role. */
export function trackerRowFor(job: Job, tracker: TrackerRow[]): TrackerRow | undefined {
  const byUrl = tracker.filter((r) => r.source && job.tracker_source === r.source && norm(r.company) === norm(job.company));
  const byRole = tracker.filter((r) => norm(r.company) === norm(job.company) && norm(r.role) === norm(job.title));
  return (byUrl.length ? byUrl : byRole).at(-1);
}

/** Distinct ATS ids present in the data, for the filter sheet. */
export function atsOptions(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.ats).filter((a): a is string => !!a))].sort();
}

/** The /rank fit bands from 04-job-evaluation.md. */
export function scoreBand(score: number | null | undefined): string {
  if (score == null) return "Unscored";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 45) return "Moderate";
  if (score >= 30) return "Weak";
  return "Poor";
}

export function scoreTone(score: number | null | undefined): "good" | "warn" | "bad" | "none" {
  if (score == null) return "none";
  if (score >= 75) return "good";
  if (score >= 60) return "warn";
  return "bad";
}
