import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_FILTERS, activeFilterCount, applyFilters, bucketize, cityOf } from "./filters.ts";
import type { Job, TrackerRow } from "./types.ts";

const NOW = Date.parse("2026-10-20T00:00:00Z");
const job = (o: Partial<Job>): Job => ({ key: "k", title: "Data Scientist", company: "Acme", url: "https://x", ...o });
const keys = (jobs: Job[]) => jobs.map((j) => j.key);

test("cityOf resolves aliases and falls back to other", () => {
  assert.equal(cityOf("Bengaluru, in"), "bengaluru");
  assert.equal(cityOf("Bangalore, Karnataka"), "bengaluru");
  assert.equal(cityOf("Gurgaon"), "gurugram");
  assert.equal(cityOf("Mumbai"), "other");
  assert.equal(cityOf(undefined), "other");
});

test("city filter keeps only chosen cities", () => {
  const jobs = [job({ key: "a", location: "Pune" }), job({ key: "b", location: "Bengaluru" }), job({ key: "c", location: "Mumbai" })];
  const out = applyFilters(jobs, { ...DEFAULT_FILTERS, cities: ["bengaluru", "pune"], sort: "city" }, NOW);
  assert.deepEqual(keys(out), ["b", "a"]); // Bangalore sorts first
});

test("category and work mode treat missing facets as unknown", () => {
  const jobs = [job({ key: "a", category: "ml_ai" }), job({ key: "b", category: null }), job({ key: "c", category: "data_science" })];
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, categories: ["ml_ai"] }, NOW)), ["a"]);
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, categories: ["unknown"] }, NOW)), ["b"]);
  const wm = [job({ key: "a", work_mode: "remote" }), job({ key: "b" })];
  assert.deepEqual(keys(applyFilters(wm, { ...DEFAULT_FILTERS, workModes: ["unknown"] }, NOW)), ["b"]);
});

test("keyword search matches every word across title, company, location and skills", () => {
  const jobs = [job({ key: "a", title: "ML Engineer", skills: ["pytorch"] }), job({ key: "b", title: "Analyst", company: "Beta" })];
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, query: "ml pytorch" }, NOW)), ["a"]);
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, query: "beta" }, NOW)), ["b"]);
});

test("posted-within drops old postings but keeps undated ones", () => {
  const jobs = [
    job({ key: "new", posted_date: "2026-10-18" }),
    job({ key: "old", posted_date: "2026-09-01" }),
    job({ key: "undated" }),
  ];
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, postedWithin: 7, sort: "newest" }, NOW)).sort(), ["new", "undated"]);
});

test("hideStretch and hideSenior", () => {
  const jobs = [job({ key: "a", experience_note: "2-4 years" }), job({ key: "b", seniority: "senior" }), job({ key: "c" })];
  // "a" is a stretch range and "b" is senior (hidden by default), leaving "c"
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, hideStretch: true }, NOW)), ["c"]);
  assert.deepEqual(keys(applyFilters(jobs, DEFAULT_FILTERS, NOW)).sort(), ["a", "c"]);
});

test("hideSenior is on by default and can be turned off", () => {
  const jobs = [job({ key: "b", seniority: "senior" }), job({ key: "c", seniority: "junior" })];
  assert.deepEqual(keys(applyFilters(jobs, DEFAULT_FILTERS, NOW)), ["c"]);
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, hideSenior: false }, NOW)).sort(), ["b", "c"]);
});

test("min score excludes unscored jobs and sorts by score then city", () => {
  const jobs = [
    job({ key: "a", rank_score: 70, location: "Pune" }),
    job({ key: "b", rank_score: 70, location: "Bengaluru" }),
    job({ key: "c", rank_score: 55 }),
    job({ key: "d" }),
  ];
  assert.deepEqual(keys(applyFilters(jobs, { ...DEFAULT_FILTERS, minScore: 60 }, NOW)), ["b", "a"]);
});

test("activeFilterCount ignores the defaults", () => {
  assert.equal(activeFilterCount(DEFAULT_FILTERS), 0);
  assert.equal(activeFilterCount({ ...DEFAULT_FILTERS, cities: ["pune"], minScore: 60, hideSenior: false }), 3);
});

test("bucketize mirrors the web dashboard", () => {
  const jobs = [
    job({ key: "top", status: "ranked" }),
    job({ key: "drafted", status: "ranked", tracker_status: "drafted", company: "Dco", title: "T" }),
    job({ key: "queued", status: "new", apply_queue: 1 }),
    job({ key: "fresh", status: "new" }),
    job({ key: "gone", status: "ranked", user_status: "dismissed" }),
    job({ key: "applied", status: "ranked", tracker_status: "applied" }),
    job({ key: "failed", status: "ranked", pipeline_state: "failed" }),
  ];
  const tracker = [
    { status: "drafted", company: "Dco", role: "T", source: "" },
    { status: "applied", company: "Acme", role: "Data Scientist", source: "" },
  ] as TrackerRow[];
  const b = bucketize(jobs, tracker);
  assert.deepEqual(keys(b.top).sort(), ["failed", "top"]);
  assert.deepEqual(keys(b.queue), ["queued"]);
  assert.deepEqual(keys(b.new), ["queued", "fresh"]);
  assert.deepEqual(keys(b.hidden).sort(), ["failed", "gone"]);
  assert.equal(b.ready.length, 1);
  assert.equal(b.ready[0].job?.key, "drafted");
  assert.equal(b.applied.length, 1);
});
