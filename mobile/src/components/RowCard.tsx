import React from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import type { Api } from "../api";
import { openPdf } from "../pdf";
import { space, useTheme } from "../theme";
import type { TrackerRow } from "../types";
import { Button, Card, Chip, type Tone } from "./ui";

const STATUS_TONE: Record<string, Tone> = {
  drafted: "accent", applied: "neutral", interview: "good", offer: "good", hired: "good",
  rejected: "bad", withdrawn: "warn", "no response": "warn", "no_response": "warn",
};

/** A tracker row with its CV / cover-letter PDFs. `onApplied` shows an "I applied" action for drafted rows. */
export function RowCard({ row, api, onApplied }: { row: TrackerRow; api: Api | null; onApplied?: () => void }) {
  const t = useTheme();
  const link = /^https?:\/\//i.test(row.source) ? row.source : null;
  return (
    <Card style={{ gap: space.sm }}>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.muted, fontSize: 13 }}>{row.company}</Text>
          <Text style={{ color: t.ink, fontSize: 16, fontWeight: "600" }}>{row.role}</Text>
        </View>
        <Chip label={row.status} tone={STATUS_TONE[row.status] || "neutral"} />
      </View>
      <View style={s.chips}>
        {row.date ? <Chip label={row.date} /> : null}
        {row.fit_rating ? <Chip label={`Fit ${row.fit_rating}`} /> : null}
        {row.deadline ? <Chip label={`Closes ${row.deadline}`} tone="warn" /> : null}
        {row.channel ? <Chip label={row.channel} /> : null}
      </View>
      {row.notes ? <Text style={{ color: t.muted, fontSize: 13 }} numberOfLines={3}>{row.notes}</Text> : null}
      <View style={s.chips}>
        {row.cv_file ? <Button label="CV" onPress={() => openPdf(api, row.cv_file)} /> : null}
        {row.cover_letter_file ? <Button label="Cover letter" onPress={() => openPdf(api, row.cover_letter_file)} /> : null}
        {link ? (
          <Button kind="ghost" label="Posting" onPress={() => Linking.openURL(link).catch(() => Alert.alert("Cannot open", "No app could open this link."))} />
        ) : null}
        {onApplied ? <Button kind="primary" label="I applied" onPress={onApplied} /> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: space.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
