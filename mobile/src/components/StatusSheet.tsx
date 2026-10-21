import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, type Api } from "../api";
import { radius, space, useTheme } from "../theme";
import { STATUSES, STATUS_LABEL, canonicalStatus, followUps, isFinal, type Status } from "../tracker";
import type { TrackerRow } from "../types";
import { Button, Heading, Toggle } from "./ui";

interface Props {
  row: TrackerRow | null; // null = closed
  api: Api | null;
  onClose: () => void;
  onDone: (message: string) => void; // after a successful write; the caller refreshes
}

/** Bottom sheet to move an application through the /outcome statuses or log a follow-up. */
export function StatusSheet({ row, api, onClose, onDone }: Props) {
  const t = useTheme();
  const [status, setStatus] = useState<Status>("applied");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!row) return;
    const current = canonicalStatus(row.status);
    setStatus((STATUSES as readonly string[]).includes(current) ? (current as Status) : "applied");
    setNote("");
  }, [row]);

  if (!row) return null;
  const current = canonicalStatus(row.status);
  const changed = status !== current || note.trim() !== "";
  const canFollowUp = !isFinal(row) && current !== "drafted";

  const run = async (write: () => Promise<unknown>, message: string) => {
    if (!api) return;
    setBusy(true);
    try {
      await write();
      onDone(message);
      onClose();
    } catch (e) {
      Alert.alert("Could not update", e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" style={[s.backdrop]} onPress={onClose} />
      {/* box-none: taps above the sheet fall through to the backdrop and close it */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.dock} pointerEvents="box-none">
        <SafeAreaView edges={["bottom"]} style={[s.sheet, { backgroundColor: t.panel, borderColor: t.line }]}>
          <View style={[s.grabber, { backgroundColor: t.control }]} />
          <View style={{ gap: 2 }}>
            <Text style={{ color: t.muted, fontSize: 13, fontWeight: "600" }}>{row.company}</Text>
            <Text style={{ color: t.ink, fontSize: 18, fontWeight: "700" }}>{row.role}</Text>
          </View>

          <View style={{ gap: space.sm }}>
            <Heading>Status</Heading>
            <View style={s.row}>
              {STATUSES.map((st) => (
                <Toggle key={st} label={STATUS_LABEL[st]} selected={status === st} onPress={() => setStatus(st)} />
              ))}
            </View>
            {current === "drafted" && status !== "drafted" ? (
              <Text style={{ color: t.muted, fontSize: 12 }}>The row's date becomes today, the day you sent it.</Text>
            ) : null}
          </View>

          <View style={{ gap: space.sm }}>
            <Heading>Note (optional)</Heading>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. round 1 with the hiring manager on Friday"
              placeholderTextColor={t.muted}
              style={[s.input, { color: t.ink, borderColor: t.control, backgroundColor: t.bg }]}
              maxLength={200}
            />
          </View>

          <View style={s.row}>
            <Button
              kind="primary"
              label={busy ? "Saving…" : "Save"}
              disabled={busy || !changed}
              onPress={() => run(() => api!.setRowStatus(row, status, note), `Status set to ${STATUS_LABEL[status]}`)}
              style={{ flex: 1 }}
            />
            {canFollowUp ? (
              <Button
                label={`Log follow-up${followUps(row) ? ` (${followUps(row)} sent)` : ""}`}
                disabled={busy}
                onPress={() => run(() => api!.logFollowUp(row), "Follow-up logged")}
              />
            ) : null}
            <Button kind="ghost" label="Cancel" onPress={onClose} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  dock: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: space.lg, gap: space.lg },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: radius.pill, marginTop: -space.sm },
  row: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, alignItems: "center" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: space.md, minHeight: 44, fontSize: 15 },
});
