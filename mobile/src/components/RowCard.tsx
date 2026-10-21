import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { Api } from "../api";
import { openPdf } from "../pdf";
import { space, useTheme } from "../theme";
import { canonicalStatus, daysQuiet, followUps, isFinal, needsFollowUp, statusLabel } from "../tracker";
import type { TrackerRow } from "../types";
import { Button, Card, Chip, type Tone } from "./ui";

export const STATUS_TONE: Record<string, Tone> = {
  drafted: "accent", applied: "neutral", interview: "good", offer: "good", hired: "good",
  rejected: "bad", withdrawn: "warn", no_response: "warn", offer_declined: "warn",
};

export const statusTone = (status: string | undefined | null): Tone => STATUS_TONE[canonicalStatus(status)] || "neutral";

/**
 * A tracker row with its CV / cover-letter PDFs. `onApplied` shows an "I applied" action for drafted
 * rows; `onPress` makes the card open the status sheet.
 */
export function RowCard({ row, api, onApplied, onPress }: { row: TrackerRow; api: Api | null; onApplied?: () => void; onPress?: () => void }) {
  const t = useTheme();
  const link = /^https?:\/\//i.test(row.source) ? row.source : null;
  const quiet = isFinal(row) || canonicalStatus(row.status) === "drafted" ? null : daysQuiet(row);
  const sent = followUps(row);
  const due = needsFollowUp(row);

  const head = (
    <View style={s.head}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.muted, fontSize: 13, fontWeight: "600" }}>{row.company}</Text>
        <Text style={{ color: t.ink, fontSize: 16, fontWeight: "700" }}>{row.role}</Text>
      </View>
      <Chip label={statusLabel(row.status)} tone={statusTone(row.status)} />
      {onPress ? <Ionicons name="chevron-forward" size={18} color={t.muted} /> : null}
    </View>
  );

  return (
    <Card style={{ gap: space.sm, borderColor: due ? t.warn : t.line }}>
      {onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${row.role} at ${row.company}, update status`} onPress={onPress}>
          {head}
        </Pressable>
      ) : head}
      <View style={s.chips}>
        {due ? <Chip label="Follow-up due" tone="warn" /> : null}
        {row.date ? <Chip label={row.date} /> : null}
        {quiet !== null ? <Chip label={`Quiet ${quiet}d`} tone={quiet >= 10 ? "warn" : "neutral"} /> : null}
        {sent ? <Chip label={`${sent} follow-up${sent > 1 ? "s" : ""}`} /> : null}
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
  head: { flexDirection: "row", alignItems: "center", gap: space.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
