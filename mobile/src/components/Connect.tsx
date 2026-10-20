import { useRouter } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { space, useTheme } from "../theme";
import { Button, Card } from "./ui";

/** Shown on data screens until a server address is saved, or when the server cannot be reached. */
export function ConnectCard({ error }: { error?: string | null }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <Card style={{ margin: space.lg, gap: space.md }}>
      <Text style={{ color: t.ink, fontSize: 16, fontWeight: "600" }}>{error ? "Can't load your jobs" : "Connect to your job server"}</Text>
      <Text style={{ color: t.muted }}>
        {error || "Enter the address and token of the dashboard server (dashboard/server.py) running on your machine."}
      </Text>
      <Button kind="primary" label="Open settings" onPress={() => router.push("/settings")} />
    </Card>
  );
}
