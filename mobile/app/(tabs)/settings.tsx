import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { ApiError, createApi, normalizeBaseUrl } from "../../src/api";
import { Button, Card, Heading } from "../../src/components/ui";
import { useData } from "../../src/data";
import { DEFAULT_FILTERS } from "../../src/filters";
import { space, useTheme } from "../../src/theme";

export default function SettingsScreen() {
  const t = useTheme();
  const { baseUrl, token, saveConnection, state, setFilters, refresh } = useData();
  const [url, setUrl] = useState(baseUrl);
  const [tok, setTok] = useState(token);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Fill the fields once the saved connection has loaded from storage.
  useEffect(() => { setUrl(baseUrl); setTok(token); }, [baseUrl, token]);

  const test = async () => {
    const clean = normalizeBaseUrl(url);
    if (!clean) return setResult({ ok: false, text: "Enter the server address first." });
    setBusy(true);
    try {
      const s = await createApi({ baseUrl: clean, token: tok.trim() }).state();
      setResult({ ok: true, text: `Connected. ${s.counts.seen_total} jobs seen, ${s.tracker.length} tracked.` });
    } catch (e) {
      setResult({ ok: false, text: e instanceof ApiError ? e.message : "Connection failed" });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    await saveConnection(url, tok);
    setResult({ ok: true, text: "Saved." });
  };

  const input = { color: t.ink, borderColor: t.control, backgroundColor: t.panel, borderWidth: 1, borderRadius: 10, paddingHorizontal: space.md, minHeight: 44, fontSize: 15 } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
      <Card style={{ gap: space.md }}>
        <Heading>Job server</Heading>
        <Text style={{ color: t.muted, fontSize: 13 }}>
          The machine running dashboard/server.py, reachable from this phone (same Wi-Fi, or a private VPN such as Tailscale).
          Example: 100.101.102.103:8787
        </Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="192.168.1.20:8787"
          placeholderTextColor={t.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={input}
        />
        <TextInput
          value={tok}
          onChangeText={setTok}
          placeholder="Access token (JOB_DASHBOARD_TOKEN)"
          placeholderTextColor={t.muted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          style={input}
        />
        {result ? <Text style={{ color: result.ok ? t.good : t.bad }}>{result.text}</Text> : null}
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Button label={busy ? "Testing…" : "Test"} disabled={busy} onPress={test} />
          <Button kind="primary" label="Save" disabled={busy} onPress={save} />
        </View>
        <Text style={{ color: t.muted, fontSize: 12 }}>
          The token travels in clear text over http, so only use this on a network you trust. It is stored in the device's secure storage.
        </Text>
      </Card>

      <Card style={{ gap: space.md }}>
        <Heading>Data</Heading>
        <Text style={{ color: t.muted }}>
          {state ? `${state.counts.seen_total} jobs seen · ${state.tracker.length} applications tracked` : "Not loaded"}
        </Text>
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Button label="Refresh" onPress={refresh} />
          <Button label="Reset filters" onPress={() => setFilters(DEFAULT_FILTERS)} />
        </View>
      </Card>
    </ScrollView>
  );
}
