import React from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { scoreTone } from "../filters";
import { space, useTheme } from "../theme";
import type { Job, JobAction } from "../types";
import { Button, Card, Chip, ScoreBadge } from "./ui";

export function relativeDate(iso: string | null | undefined, now: number = Date.now()): string {
  const t = Date.parse(iso || "");
  if (Number.isNaN(t)) return "";
  const days = Math.floor((now - t) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return days < 30 ? `${days}d ago` : `${Math.floor(days / 30)}mo ago`;
}

/** Job chips shared by the list card and the detail screen. */
export function JobChips({ job }: { job: Job }) {
  return (
    <View style={s.chips}>
      {job.location ? <Chip label={job.location} /> : null}
      {job.work_mode ? <Chip label={job.work_mode} /> : null}
      {job.ats ? <Chip label={`via ${job.ats}`} /> : null}
      {job.pay_evidence ? <Chip label={`₹ ${job.pay_evidence}`} tone={/below|<10/i.test(job.pay_evidence) ? "bad" : "good"} /> : null}
      {job.deadline ? <Chip label={`Closes ${job.deadline}`} tone="warn" /> : null}
      {job.experience_note ? <Chip label={`Asks ${job.experience_note}`} tone="warn" /> : null}
      {job.location_verdict === "FLAG" ? <Chip label="Check location" tone="warn" /> : null}
      {job.language_gate === "FLAG" ? <Chip label="Check language" tone="warn" /> : null}
      {job.apply_queue ? <Chip label={`Queued #${job.apply_queue}`} tone="good" /> : null}
      {job.pipeline_state === "failed" || job.pipeline_state === "skipped" ? (
        <Chip label={`Pipeline ${job.pipeline_state}${job.pipeline_note ? `: ${job.pipeline_note}` : ""}`} tone={job.pipeline_state === "failed" ? "bad" : "warn"} />
      ) : null}
    </View>
  );
}

export function openPosting(job: Job) {
  // Only http(s): a scraped URL must never be able to launch another scheme.
  if (!/^https?:\/\//i.test(job.url)) return Alert.alert("Cannot open", "This posting has no valid link.");
  Linking.openURL(job.url).catch(() => Alert.alert("Cannot open", "No app could open this link."));
}

export function confirmApplied(job: Job, onConfirm: () => void) {
  Alert.alert("Mark as applied?", `${job.title} at ${job.company}`, [
    { text: "Cancel", style: "cancel" },
    { text: "I applied", onPress: onConfirm },
  ]);
}

export function JobActions({ job, onAction }: { job: Job; onAction: (a: JobAction) => void }) {
  const dismissed = job.user_status === "dismissed";
  return (
    <View style={s.actions}>
      <Button kind="primary" label="Open posting" onPress={() => openPosting(job)} />
      <Button label={job.apply_queue ? "Unqueue" : "Queue draft"} onPress={() => onAction(job.apply_queue ? "unqueue" : "queue")} />
      <Button kind="ghost" label="I applied" onPress={() => confirmApplied(job, () => onAction("applied"))} />
      <Button kind="ghost" label={dismissed ? "Restore" : "Dismiss"} onPress={() => onAction(dismissed ? "restore" : "dismiss")} />
    </View>
  );
}

export function JobCard({ job, onOpen, onAction }: { job: Job; onOpen: () => void; onAction: (a: JobAction) => void }) {
  const t = useTheme();
  const posted = relativeDate(job.posted_date || job.first_seen);
  return (
    <Card style={{ gap: space.md }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${job.title} at ${job.company}`} onPress={onOpen} style={s.head}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: t.muted, fontSize: 13 }} numberOfLines={1}>{job.company}</Text>
          <Text style={{ color: t.ink, fontSize: 16, fontWeight: "600" }} numberOfLines={2}>{job.title}</Text>
          {posted ? <Text style={{ color: t.muted, fontSize: 12 }}>Posted {posted}</Text> : null}
        </View>
        <ScoreBadge score={job.rank_score} tone={scoreTone(job.rank_score)} />
      </Pressable>
      <JobChips job={job} />
      <JobActions job={job} onAction={onAction} />
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: space.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
