import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { ApiError } from "../../src/api";
import { JobActions, JobChips, relativeDate } from "../../src/components/JobCard";
import { RowCard } from "../../src/components/RowCard";
import { useSnackbar } from "../../src/components/Snackbar";
import { Card, Chip, Empty, Heading, ScoreBadge } from "../../src/components/ui";
import { useData } from "../../src/data";
import { scoreTone, trackerRowFor } from "../../src/filters";
import { space, useTheme } from "../../src/theme";
import type { JobAction, JobDetail } from "../../src/types";

export default function JobScreen() {
  const t = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const { state, api, act } = useData();
  const snack = useSnackbar();
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  const perform = async (action: JobAction) => {
    try {
      await act(action, job.key);
      if (action === "dismiss") snack.show("Job dismissed", () => { act("restore", job.key).catch(() => {}); });
      else snack.show(action === "applied" ? "Marked as applied" : "Done");
    } catch (e) {
      Alert.alert("Action failed", e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: job.company }} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 96 }}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.muted }}>{job.company}</Text>
              <Text style={{ color: t.ink, fontSize: 20, fontWeight: "700" }}>{job.title}</Text>
              {posted ? <Text style={{ color: t.muted, fontSize: 12 }}>Posted {posted}</Text> : null}
            </View>
            <ScoreBadge score={job.rank_score} tone={scoreTone(job.rank_score)} />
          </View>
          <JobChips job={job} />
          <JobActions job={job} onAction={perform} />
        </Card>

        {job.strengths?.length || job.gaps?.length ? (
          <Card style={{ gap: space.md }}>
            <Heading>Why this score</Heading>
            {job.rank_verdict ? <Chip label={job.rank_verdict} tone="accent" /> : null}
            {job.strengths?.length ? (
              <View style={{ gap: 4 }}>
                <Text style={{ color: t.good, fontWeight: "600" }}>Strengths</Text>
                {job.strengths.map((s, i) => <Text key={i} style={{ color: t.ink }}>• {s}</Text>)}
              </View>
            ) : null}
            {job.gaps?.length ? (
              <View style={{ gap: 4 }}>
                <Text style={{ color: t.warn, fontWeight: "600" }}>Gaps</Text>
                {job.gaps.map((g, i) => <Text key={i} style={{ color: t.ink }}>• {g}</Text>)}
              </View>
            ) : null}
            {job.language_note ? <Text style={{ color: t.muted }}>{job.language_note}</Text> : null}
          </Card>
        ) : null}

        {row ? <RowCard row={row} api={api} /> : null}

        {skills.length ? (
          <Card style={{ gap: space.sm }}>
            <Heading>Skills</Heading>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {skills.map((s) => <Chip key={s} label={s} />)}
            </View>
          </Card>
        ) : null}

        <Card style={{ gap: space.sm }}>
          <Heading>Description</Heading>
          {detail ? (
            <Text selectable style={{ color: t.ink, lineHeight: 21 }}>
              {detail.description || detail.note || "No description available. Open the posting for the full text."}
            </Text>
          ) : detailError ? (
            <Text style={{ color: t.bad }}>{detailError}</Text>
          ) : (
            <ActivityIndicator />
          )}
        </Card>
      </ScrollView>
      {snack.node}
    </View>
  );
}
