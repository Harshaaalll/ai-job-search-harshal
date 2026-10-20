import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CITY_LABEL, CITY_ORDER, DEFAULT_FILTERS, type CityId, type Filters, type SortKey } from "../filters";
import { space, useTheme } from "../theme";
import { Button, Heading, Toggle } from "./ui";

const CATEGORIES: [string, string][] = [
  ["ml_ai", "ML / AI"], ["ai_engineering", "AI Engineering"], ["data_science", "Data Science"], ["unknown", "Uncategorised"],
];
const WORK_MODES: [string, string][] = [["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"], ["unknown", "Unknown"]];
const POSTED: [number, string][] = [[0, "Any time"], [1, "24 hours"], [3, "3 days"], [7, "7 days"], [14, "14 days"]];
const SCORES: [number, string][] = [[0, "Any"], [50, "50+"], [60, "60+"], [70, "70+"], [75, "75+ strong"]];
const SORTS: [SortKey, string][] = [["score", "Best fit"], ["newest", "Newest"], ["city", "City"], ["company", "Company"]];

function toggleIn<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <Heading>{title}</Heading>
      <View style={s.row}>{children}</View>
    </View>
  );
}

interface Props {
  visible: boolean;
  filters: Filters;
  atsOptions: string[];
  resultCount: number;
  onChange: (f: Filters) => void;
  onClose: () => void;
}

export function FilterSheet({ visible, filters: f, atsOptions, resultCount, onChange, onClose }: Props) {
  const t = useTheme();
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={[s.header, { borderBottomColor: t.line }]}>
          <Text style={{ color: t.ink, fontSize: 18, fontWeight: "700", flex: 1 }}>Filters</Text>
          <Button kind="ghost" label="Reset" onPress={() => onChange({ ...DEFAULT_FILTERS, query: f.query })} />
        </View>

        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: space.sm }}>
            <Heading>Keyword</Heading>
            <TextInput
              value={f.query}
              onChangeText={(query) => set({ query })}
              placeholder="Title, company, skill (e.g. llm pytorch)"
              placeholderTextColor={t.muted}
              autoCapitalize="none"
              autoCorrect={false}
              style={[s.input, { color: t.ink, borderColor: t.control, backgroundColor: t.panel }]}
            />
          </View>

          <Section title="City">
            {CITY_ORDER.map((id: CityId) => (
              <Toggle key={id} label={CITY_LABEL[id]} selected={f.cities.includes(id)} onPress={() => set({ cities: toggleIn(f.cities, id) })} />
            ))}
          </Section>

          <Section title="Domain">
            {CATEGORIES.map(([id, label]) => (
              <Toggle key={id} label={label} selected={f.categories.includes(id)} onPress={() => set({ categories: toggleIn(f.categories, id) })} />
            ))}
          </Section>

          <Section title="Work mode">
            {WORK_MODES.map(([id, label]) => (
              <Toggle key={id} label={label} selected={f.workModes.includes(id)} onPress={() => set({ workModes: toggleIn(f.workModes, id) })} />
            ))}
          </Section>

          <Section title="Posted within">
            {POSTED.map(([days, label]) => (
              <Toggle key={days} label={label} selected={f.postedWithin === days} onPress={() => set({ postedWithin: days })} />
            ))}
          </Section>

          <Section title="Minimum fit score">
            {SCORES.map(([n, label]) => (
              <Toggle key={n} label={label} selected={f.minScore === n} onPress={() => set({ minScore: n })} />
            ))}
          </Section>

          {atsOptions.length ? (
            <Section title="Company portal (ATS)">
              {atsOptions.map((a) => (
                <Toggle key={a} label={a} selected={f.ats.includes(a)} onPress={() => set({ ats: toggleIn(f.ats, a) })} />
              ))}
            </Section>
          ) : null}

          <View style={{ gap: space.md }}>
            <Heading>Experience</Heading>
            <View style={s.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink }}>Hide stretch roles</Text>
                <Text style={{ color: t.muted, fontSize: 12 }}>Postings asking "2-4 years" style ranges</Text>
              </View>
              <Switch value={f.hideStretch} onValueChange={(hideStretch) => set({ hideStretch })} />
            </View>
            <View style={s.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink }}>Hide senior-tagged roles</Text>
                <Text style={{ color: t.muted, fontSize: 12 }}>Senior, lead, staff, principal</Text>
              </View>
              <Switch value={f.hideSenior} onValueChange={(hideSenior) => set({ hideSenior })} />
            </View>
          </View>

          <Section title="Sort by">
            {SORTS.map(([id, label]) => (
              <Toggle key={id} label={label} selected={f.sort === id} onPress={() => set({ sort: id })} />
            ))}
          </Section>
        </ScrollView>

        <View style={[s.footer, { borderTopColor: t.line, backgroundColor: t.panel }]}>
          <Pressable accessibilityRole="button" onPress={onClose} style={[s.apply, { backgroundColor: t.accent }]}>
            <Text style={{ color: t.accentInk, fontWeight: "600", fontSize: 16 }}>Show {resultCount} {resultCount === 1 ? "job" : "jobs"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg, paddingVertical: space.sm, borderBottomWidth: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: space.md, minHeight: 44, fontSize: 15 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  footer: { padding: space.lg, borderTopWidth: 1 },
  apply: { minHeight: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
