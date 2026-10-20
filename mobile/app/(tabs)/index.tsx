import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "../../src/api";
import { ConnectCard } from "../../src/components/Connect";
import { FilterSheet } from "../../src/components/FilterSheet";
import { JobCard } from "../../src/components/JobCard";
import { RowCard } from "../../src/components/RowCard";
import { useSnackbar } from "../../src/components/Snackbar";
import { Button, Card, Empty, Toggle } from "../../src/components/ui";
import { useData } from "../../src/data";
import { activeFilterCount, applyFilters, atsOptions, bucketize, type Bucket } from "../../src/filters";
import { space, useTheme } from "../../src/theme";
import type { Job, JobAction, PipelineStatus } from "../../src/types";

const BUCKETS: [Bucket, string][] = [
  ["top", "Top picks"], ["ready", "Ready"], ["queue", "Queue"], ["new", "New"], ["hidden", "Hidden"],
];

const MESSAGES: Record<string, string> = {
  applied: "Marked as applied", queue: "Queued for the next run", unqueue: "Removed from the draft queue",
  restore: "Restored", run: "Pipeline started",
};

function describeStatus(status: PipelineStatus | undefined, nextRun: string | null): string {
  if (!status || (!status.started && !status.finished)) return nextRun ? `Next run ${nextRun.replace("T", " ")}` : "No run yet";
  if (status.running) {
    const current = status.stages?.draft?.current;
    return `Running: ${status.stage ?? "starting"}${current ? ` (${current})` : ""}`;
  }
  const finished = (status.finished || "").replace("T", " ").slice(0, 16);
  const base = status.ok === false ? `Last run failed${status.error ? `: ${status.error}` : ""}` : `Last run ${finished}`;
  return nextRun ? `${base} · next ${nextRun.replace("T", " ")}` : base;
}

export default function PipelineScreen() {
  const t = useTheme();
  const router = useRouter();
  const { ready, configured, state, error, loading, refresh, act, api, filters, setFilters } = useData();
  const [bucket, setBucket] = useState<Bucket>("top");
  const [sheet, setSheet] = useState(false);
  const snack = useSnackbar();

  const buckets = useMemo(() => (state ? bucketize(state.jobs, state.tracker) : null), [state]);
  const ats = useMemo(() => (state ? atsOptions(state.jobs) : []), [state]);

  const counts: Record<Bucket, number> = {
    top: buckets?.top.length ?? 0, ready: buckets?.ready.length ?? 0, queue: buckets?.queue.length ?? 0,
    new: buckets?.new.length ?? 0, hidden: buckets?.hidden.length ?? 0,
  };

  const jobs: Job[] = useMemo(() => {
    if (!buckets || bucket === "ready") return [];
    return applyFilters(buckets[bucket], filters);
  }, [buckets, bucket, filters]);

  // The filter sheet's live count: what the current bucket would show.
  const sheetCount = bucket === "ready" ? counts.ready : jobs.length;

  const perform = async (job: Job, action: JobAction) => {
    try {
      await act(action, job.key);
      if (action === "dismiss") snack.show("Job dismissed", () => { act("restore", job.key).catch(() => {}); });
      else snack.show(MESSAGES[action] || "Done");
    } catch (e) {
      Alert.alert("Action failed", e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  const runPipeline = () =>
    Alert.alert("Run the pipeline now?", "Scrapes, ranks and drafts. This can take a while.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Run",
        onPress: () =>
          act("run").then(
            () => snack.show(MESSAGES.run),
            (e) => Alert.alert("Could not start", e instanceof ApiError ? e.message : "Something went wrong"),
          ),
      },
    ]);

  if (!ready) return <ActivityIndicator style={{ marginTop: 80 }} />;
  if (!configured) return <ConnectCard />;
  if (!state) return error ? <ConnectCard error={error} /> : <ActivityIndicator style={{ marginTop: 80 }} />;

  const filterCount = activeFilterCount(filters);
  const running = !!state.status?.running;

  const header = (
    <View style={{ gap: space.md, padding: space.lg, paddingBottom: space.sm }}>
      <Card style={s.statusRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: running ? t.warn : t.ink, fontWeight: "600" }}>{running ? "Pipeline running" : "Pipeline"}</Text>
          <Text style={{ color: t.muted, fontSize: 13 }}>{describeStatus(state.status, state.next_run)}</Text>
        </View>
        <Button kind="primary" label={running ? "Running…" : "Run now"} disabled={running} onPress={runPipeline} />
      </Card>
      {error ? <Text style={{ color: t.bad }}>{error} (showing last data)</Text> : null}

      <View style={s.searchRow}>
        <TextInput
          value={filters.query}
          onChangeText={(query) => setFilters({ ...filters, query })}
          placeholder="Search title, company, skill"
          placeholderTextColor={t.muted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={[s.search, { color: t.ink, borderColor: t.control, backgroundColor: t.panel }]}
        />
        <Button label={filterCount ? `Filters · ${filterCount}` : "Filters"} onPress={() => setSheet(true)} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {BUCKETS.map(([id, label]) => (
          <Toggle key={id} label={`${label} ${counts[id]}`} selected={bucket === id} onPress={() => setBucket(id)} />
        ))}
      </ScrollView>
    </View>
  );

  const refreshControl = <RefreshControl refreshing={loading} onRefresh={refresh} />;

  return (
    <View style={{ flex: 1 }}>
      {bucket === "ready" ? (
        <FlatList
          data={buckets?.ready ?? []}
          keyExtractor={(item, i) => `${item.row.company}|${item.row.role}|${i}`}
          ListHeaderComponent={header}
          refreshControl={refreshControl}
          contentContainerStyle={{ paddingBottom: 96 }}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          ListEmptyComponent={<Empty title="No drafts waiting" hint="Drafted CVs and cover letters appear here until you mark them applied." />}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: space.lg }}>
              <RowCard
                row={item.row}
                api={api}
                onApplied={() =>
                  Alert.alert("Mark as applied?", `${item.row.role} at ${item.row.company}`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "I applied",
                      onPress: () =>
                        api?.markRowApplied(item.row.company, item.row.role).then(
                          () => { snack.show(MESSAGES.applied); refresh(); },
                          (e) => Alert.alert("Action failed", e instanceof ApiError ? e.message : "Something went wrong"),
                        ),
                    },
                  ])
                }
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => j.key}
          ListHeaderComponent={header}
          refreshControl={refreshControl}
          contentContainerStyle={{ paddingBottom: 96 }}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          ListEmptyComponent={
            <Empty
              title={filterCount || filters.query ? "No jobs match these filters" : "Nothing here yet"}
              hint={filterCount || filters.query ? "Loosen a filter or reset them." : "New postings show up after the next pipeline run."}
            />
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: space.lg }}>
              <JobCard job={item} onOpen={() => router.push({ pathname: "/job/[key]", params: { key: item.key } })} onAction={(a) => perform(item, a)} />
            </View>
          )}
        />
      )}

      <FilterSheet
        visible={sheet}
        filters={filters}
        atsOptions={ats}
        resultCount={sheetCount}
        onChange={setFilters}
        onClose={() => setSheet(false)}
      />
      {snack.node}
    </View>
  );
}

const s = StyleSheet.create({
  statusRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  searchRow: { flexDirection: "row", gap: space.sm, alignItems: "center" },
  search: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: space.md, minHeight: 40, fontSize: 15 },
});
