import type { TrackerRow } from "./types";

// Tracker status logic, pure (no React / native imports) so it is unit-testable in Node.
// Mirrors /outcome's "Tracker status vocabulary" (.claude/commands/outcome.md).

export const STATUSES = [
  "drafted", "applied", "interview", "offer", "hired", "rejected", "no_response", "offer_declined", "withdrawn",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  drafted: "Drafted", applied: "Applied", interview: "Interview", offer: "Offer", hired: "Hired",
  rejected: "Rejected", no_response: "No response", offer_declined: "Offer declined", withdrawn: "Withdrawn",
};

const FINAL: ReadonlySet<string> = new Set(["hired", "rejected", "no_response", "offer_declined", "withdrawn"]);

/** Legacy space spellings ("no response") read as the canonical underscore form. */
export function canonicalStatus(status: string | undefined | null): string {
  return (status || "").trim().toLowerCase().replace(/\s+/g, "_");
}

export function statusLabel(status: string | undefined | null): string {
  const c = canonicalStatus(status);
  return (STATUS_LABEL as Record<string, string>)[c] || status || "Unknown";
}

export const isFinal = (row: TrackerRow): boolean => FINAL.has(canonicalStatus(row.status));

/** Number of `followed up YYYY-MM-DD` markers /outcome and the app append to notes. */
export function followUps(row: TrackerRow): number {
  return (row.notes || "").match(/followed up \d{4}-\d{2}-\d{2}/g)?.length ?? 0;
}

const DAY_MS = 86_400_000;

/** Days since the row's date or the latest dated entry in its notes, whichever is more recent. */
export function daysQuiet(row: TrackerRow, now: number = Date.now()): number | null {
  const dates = [row.date, ...((row.notes || "").match(/\d{4}-\d{2}-\d{2}/g) || [])]
    .map((d) => Date.parse(d || ""))
    .filter((t) => !Number.isNaN(t));
  if (!dates.length) return null;
  return Math.max(0, Math.floor((now - Math.max(...dates)) / DAY_MS));
}

/** /outcome's follow-up rule: submitted, still open, 10+ days quiet, fewer than two follow-ups. */
export function needsFollowUp(row: TrackerRow, now: number = Date.now()): boolean {
  const s = canonicalStatus(row.status);
  if (s !== "applied" && s !== "interview") return false;
  const quiet = daysQuiet(row, now);
  return quiet !== null && quiet >= 10 && followUps(row) < 2;
}

export type TrackerView = "open" | "followup" | "closed" | "all";

export function filterRows(rows: TrackerRow[], view: TrackerView, now: number = Date.now()): TrackerRow[] {
  const keep = {
    open: (r: TrackerRow) => !isFinal(r),
    followup: (r: TrackerRow) => needsFollowUp(r, now),
    closed: isFinal,
    all: () => true,
  }[view];
  return rows.filter(keep).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** Current-status counts for the funnel strip; every final status lands in `closed`. */
export function funnel(rows: TrackerRow[]): Record<"drafted" | "applied" | "interview" | "offer" | "closed", number> {
  const out = { drafted: 0, applied: 0, interview: 0, offer: 0, closed: 0 };
  for (const r of rows) {
    const s = canonicalStatus(r.status);
    if (isFinal(r)) out.closed++;
    else if (s === "drafted" || s === "applied" || s === "interview" || s === "offer") out[s]++;
  }
  return out;
}
