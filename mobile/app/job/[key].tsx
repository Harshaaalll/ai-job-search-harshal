import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError } from "../../src/api";
import { JobChips, confirmApplied, openPosting, relativeDate } from "../../src/components/JobCard";
import { RowCard } from "../../src/components/RowCard";
import { useSnackbar } from "../../src/components/Snackbar";
import { StatusSheet } from "../../src/components/StatusSheet";
import { Button, Card, Chip, Empty, Heading, IconButton, ScoreMeter } from "../../src/components/ui";
import { useData } from "../../src/data";
import { SENIOR_TAGS, scoreBand, scoreTone, trackerRowFor } from "../../src/filters";
import { space, useTheme } from "../../src/theme";
import type { Job, JobAction, JobDetail, TrackerRow } from "../../src/types";

type Gate = { label: string; ok: boolean; detail: string };

/** The eligibility checks /rank and the pipeline ran, as a readable checklist. */
function gates(job: Job): Gate[] {
  const out: Gate[] = [
    job.experience_note
      ? { label: "Experience", ok: false, detail: `Asks ${job.experience_note} (stretch for 0-2 yrs)` }
      : { label: "Experience", ok: true, detail: "No 3+ year requirement found" },
  ];
  if (job.seniority) {
    const senior = SENIOR_TAGS.includes(job.seniority);
    out.push({ label: "Seniority", ok: !senior, detail: senior ? `Tagged ${job.seniority}` : job.seniority });
  }
  if (job.location_verdict) {
    out.push({ label: "Location", ok: job.location_verdict !== "FLAG", detail: job.location || job.location_verdict });
  }
  if (job.language_gate) {
    out.push({ label: "Language", ok: job.language_gate !== "FLAG", detail: job.language_note || job.language_gate });
  }
  return out;
}

const DESCRIPTION_LINES = 14;

export default function JobScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const { state, api, act, refresh } = useData();
  const snack = useSnackbar();
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<TrackerRow | null>(null);

  const job = state?.jobs.find((j) => j.key === key);

  useEffect(() => {
    if (!api || !key) return;
    let cancelled = false;
    api.detail(key).then(
      (d) => { if (!cancelled) setDetail(d); },
      (e) => { if (!cancelled) setDetailError(e instanceof ApiError ? e.message : "Could not load the description"); },
    );
    return () => { cancelled = true; };
  }, [api, key]);

  if (!state) return <ActivityIndicator style={{ marginTop: 80 }} />;
  if (!job) return <Empty title="Job not found" hint="It may have been removed in the latest pipeline run." />;

  const row = trackerRowFor(job, state.tracker);
  const posted = relativeDate(job.posted_date || job.first_seen);
  const skills = detail?.skills?.length ? detail.skills : job.skills || [];
  const band = scoreBand(job.rank_score);
  const dismissed = job.user_status === "dismissed";
  const description = detail?.description || detail?.note || "No description available. Open the posting for the full text.";

  const perform = async (action: JobAction) => {
    try {
      await act(action, job.key);
      if (action === "dismiss") snack.show("Job dismissed", () => { act("restore", job.key).catch(() => {}); });
      else snack.show({ applied: "Marked as applied", queue: "Queued for the next run", unqueue: "Removed from the draft queue", restore: "Restored" }[action] || "Done");
    } catch (e) {
      Alert.alert("Action failed", e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: job.company }} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 120 + insets.bottom }}>
        <Card style={{ gap: space.md }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: t.muted, fontWeight: "600" }}>{job.company}</Text>
            <Text style={{ color: t.ink, fontSize: 22, fontWeight: "800", lineHeight: 28 }}>{job.title}</Text>
            {posted ? <Text style={{ color: t.muted, fontSize: 12 }}>Posted {posted}{job.portal ? ` · found on ${job.portal}` : ""}</Text> : null}
          </View>
          <ScoreMeter score={job.rank_score} tone={scoreTone(job.rank_score)} band={band} />
          <JobChips job={job} />
        </Card>

        <Card style={{ gap: space.md }}>
          <Heading>Why this score</Heading>
          {job.strengths?.length || job.gaps?.length ? (
            <>
              {job.strengths?.map((x, i) => (
                <View key={`s${i}`} style={s.reason}>
                  <Ionicons name="checkmark-circle" size={18} color={t.good} />
                  <Text style={{ color: t.ink, flex: 1, lineHeight: 20 }}>{x}</Text>
                </View>
              ))}
              {job.gaps?.map((x, i) => (
                <View key={`g${i}`} style={s.reason}>
                  <Ionicons name="alert-circle" size={18} color={t.warn} />
                  <Text style={{ color: t.ink, flex: 1, lineHeight: 20 }}>{x}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={{ color: t.muted }}>Not ranked yet. /rank adds strengths and gaps on the next pipeline run.</Text>
          )}
        </Card>

        <Card style={{ gap: space.md }}>
          <Heading>Eligibility checks</Heading>
          {gates(job).map((g) => (
            <View key={g.label} style={s.reason}>
              <Ionicons name={g.ok ? "shield-checkmark" : "flag"} size={18} color={g.ok ? t.good : t.warn} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontWeight: "600" }}>{g.label}</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>{g.detail}</Text>
              </View>
            </View>
          ))}
        </Card>

        {row ? <RowCard row={row} api={api} onPress={() => setEditing(row)} /> : null}

        {skills.length ? (
          <Card style={{ gap: space.sm }}>
            <Heading>Skills</Heading>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {skills.map((x) => <Chip key={x} label={x} />)}
            </View>
          </Card>
        ) : null}

        <Card style={{ gap: space.sm }}>
          <Heading>Description</Heading>
          {detail ? (
            <>
              <Text selectable style={{ color: t.ink, lineHeight: 21 }} numberOfLines={expanded ? undefined : DESCRIPTION_LINES}>
                {description}
              </Text>
              {description.length > 600 ? (
                <Pressable accessibilityRole="button" onPress={() => setExpanded(!expanded)} hitSlop={8}>
                  <Text style={{ color: t.accent, fontWeight: "600" }}>{expanded ? "Show less" : "Show full description"}</Text>
                </Pressable>
              ) : null}
            </>
          ) : detailError ? (
            <Text style={{ color: t.bad }}>{detailError}</Text>
          ) : (
            <ActivityIndicator />
          )}
        </Card>
      </ScrollView>

      <View style={[s.bar, { backgroundColor: t.panel, borderTopColor: t.line, paddingBottom: space.md + insets.bottom }]}>
        <Button kind="primary" label="Open posting" onPress={() => openPosting(job)} style={{ flex: 1 }} />
        <Button label={job.apply_queue ? `Queued #${job.apply_queue}` : "Queue draft"} onPress={() => perform(job.apply_queue ? "unqueue" : "queue")} />
        <IconButton icon="checkmark-done" label="I applied" tone="good" onPress={() => confirmApplied(job, () => perform("applied"))} />
        <IconButton icon={dismissed ? "arrow-undo" : "eye-off-outline"} label={dismissed ? "Restore" : "Dismiss"} tone={dismissed ? "accent" : "bad"} onPress={() => perform(dismissed ? "restore" : "dismiss")} />
      </View>

      <StatusSheet row={editing} api={api} onClose={() => setEditing(null)} onDone={(m) => { snack.show(m); refresh(); }} />
      {snack.node}
    </View>
  );
}

const s = StyleSheet.create({
  reason: { flexDirection: "row", alignItems: "flex-start", gap: space.sm },
  bar: {
    position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center",
    gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: 1,
  },
});
