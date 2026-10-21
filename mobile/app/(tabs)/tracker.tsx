import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, View } from "react-native";
import { ConnectCard } from "../../src/components/Connect";
import { RowCard } from "../../src/components/RowCard";
import { useSnackbar } from "../../src/components/Snackbar";
import { StatusSheet } from "../../src/components/StatusSheet";
import { Card, Empty, Stat, Toggle } from "../../src/components/ui";
import { useData } from "../../src/data";
import { space } from "../../src/theme";
import { filterRows, funnel, type TrackerView } from "../../src/tracker";
import type { TrackerRow } from "../../src/types";

const VIEWS: [TrackerView, string][] = [["open", "Open"], ["followup", "Follow up"], ["closed", "Closed"], ["all", "All"]];

const EMPTY: Record<TrackerView, [string, string]> = {
  open: ["No open applications", "Drafts from /apply and applications you mark sent appear here."],
  followup: ["No follow-ups due", "An application shows here after 10 quiet days, up to two follow-ups."],
  closed: ["Nothing closed yet", "Hired, rejected, no response, declined and withdrawn applications land here."],
  all: ["No applications yet", "Drafts and applications recorded by /apply and /outcome appear here."],
};

export default function TrackerScreen() {
  const { ready, configured, state, error, loading, refresh, api } = useData();
  const [view, setView] = useState<TrackerView>("open");
  const [editing, setEditing] = useState<TrackerRow | null>(null);
  const snack = useSnackbar();

  const rows = state?.tracker ?? [];
  const counts = useMemo(() => {
    const out = {} as Record<TrackerView, number>;
    for (const [v] of VIEWS) out[v] = filterRows(rows, v).length;
    return out;
  }, [rows]);
  const stages = useMemo(() => funnel(rows), [rows]);
  const shown = useMemo(() => filterRows(rows, view), [rows, view]);

  if (!ready) return <ActivityIndicator style={{ marginTop: 80 }} />;
  if (!configured) return <ConnectCard />;
  if (!state) return error ? <ConnectCard error={error} /> : <ActivityIndicator style={{ marginTop: 80 }} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={shown}
        keyExtractor={(r, i) => `${r.company}|${r.role}|${r.date}|${i}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 96 }}
        ListHeaderComponent={
          <View style={{ gap: space.md }}>
            <Card style={{ flexDirection: "row", paddingHorizontal: space.sm }}>
              <Stat value={stages.drafted} label="Drafted" tone="accent" />
              <Stat value={stages.applied} label="Applied" />
              <Stat value={stages.interview} label="Interview" tone="good" />
              <Stat value={stages.offer} label="Offer" tone="good" />
              <Stat value={stages.closed} label="Closed" />
            </Card>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {VIEWS.map(([v, label]) => (
                <Toggle key={v} label={`${label} ${counts[v]}`} selected={view === v} onPress={() => setView(v)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<Empty title={EMPTY[view][0]} hint={EMPTY[view][1]} />}
        renderItem={({ item }) => <RowCard row={item} api={api} onPress={() => setEditing(item)} />}
      />
      <StatusSheet
        row={editing}
        api={api}
        onClose={() => setEditing(null)}
        onDone={(message) => { snack.show(message); refresh(); }}
      />
      {snack.node}
    </View>
  );
}
