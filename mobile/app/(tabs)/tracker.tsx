import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, View } from "react-native";
import { ConnectCard } from "../../src/components/Connect";
import { RowCard } from "../../src/components/RowCard";
import { Empty, Toggle } from "../../src/components/ui";
import { useData } from "../../src/data";
import { space } from "../../src/theme";

export default function TrackerScreen() {
  const { ready, configured, state, error, loading, refresh, api } = useData();
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(
    () => (state?.tracker ?? []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [state],
  );
  const statuses = useMemo(() => [...new Set(rows.map((r) => r.status).filter(Boolean))], [rows]);
  const shown = status === "all" ? rows : rows.filter((r) => r.status === status);

  if (!ready) return <ActivityIndicator style={{ marginTop: 80 }} />;
  if (!configured) return <ConnectCard />;
  if (!state) return error ? <ConnectCard error={error} /> : <ActivityIndicator style={{ marginTop: 80 }} />;

  return (
    <FlatList
      data={shown}
      keyExtractor={(r, i) => `${r.company}|${r.role}|${r.date}|${i}`}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      ListHeaderComponent={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingBottom: space.sm }}>
          <Toggle label={`All ${rows.length}`} selected={status === "all"} onPress={() => setStatus("all")} />
          {statuses.map((st) => (
            <Toggle key={st} label={`${st} ${rows.filter((r) => r.status === st).length}`} selected={status === st} onPress={() => setStatus(st)} />
          ))}
        </ScrollView>
      }
      ListEmptyComponent={<Empty title="No applications yet" hint="Drafts and applications recorded by /apply and /outcome appear here." />}
      renderItem={({ item }) => <RowCard row={item} api={api} />}
    />
  );
}
