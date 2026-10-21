import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalStatus, daysQuiet, filterRows, followUps, funnel, isFinal, needsFollowUp, statusLabel } from "./tracker.ts";
import type { TrackerRow } from "./types.ts";

const NOW = Date.parse("2026-10-22T00:00:00Z");
const row = (o: Partial<TrackerRow>): TrackerRow => ({
  date: "2026-10-01", company: "Acme", sector: "", role: "ML Engineer", role_type: "", channel: "", status: "applied",
  contact_person: "", fit_rating: "", notes: "", cv_file: "", cover_letter_file: "", source: "", deadline: "", ...o,
});

test("legacy space spellings read as the canonical status", () => {
  assert.equal(canonicalStatus("no response"), "no_response");
  assert.equal(statusLabel("offer declined"), "Offer declined");
  assert.ok(isFinal(row({ status: "no response" })));
  assert.ok(!isFinal(row({ status: "drafted" })));
});

test("days quiet counts from the latest date in the row or its notes", () => {
  assert.equal(daysQuiet(row({}), NOW), 21);
  assert.equal(daysQuiet(row({ notes: "followed up 2026-10-15" }), NOW), 7);
  assert.equal(daysQuiet(row({ date: "", notes: "" }), NOW), null);
});

test("follow-up is due after 10 quiet days, at most twice, only once submitted", () => {
  assert.ok(needsFollowUp(row({}), NOW));
  assert.ok(!needsFollowUp(row({ status: "drafted" }), NOW));
  assert.ok(!needsFollowUp(row({ status: "rejected" }), NOW));
  assert.ok(!needsFollowUp(row({ date: "2026-10-15" }), NOW));
  const twice = row({ date: "2026-09-01", notes: "followed up 2026-09-12; followed up 2026-10-01" });
  assert.equal(followUps(twice), 2);
  assert.ok(!needsFollowUp(twice, NOW));
});

test("views split open from closed, newest first", () => {
  const rows = [row({ date: "2026-09-01", status: "rejected" }), row({ date: "2026-10-05" }), row({ date: "2026-10-10", status: "drafted" })];
  assert.deepEqual(filterRows(rows, "open", NOW).map((r) => r.date), ["2026-10-10", "2026-10-05"]);
  assert.deepEqual(filterRows(rows, "closed", NOW).map((r) => r.status), ["rejected"]);
  assert.deepEqual(filterRows(rows, "followup", NOW).map((r) => r.date), ["2026-10-05"]);
  assert.equal(filterRows(rows, "all", NOW).length, 3);
});

test("funnel counts current status and folds final ones into closed", () => {
  const rows = ["drafted", "applied", "applied", "interview", "rejected", "no response", "hired"].map((status) => row({ status }));
  assert.deepEqual(funnel(rows), { drafted: 1, applied: 2, interview: 1, offer: 0, closed: 3 });
});
