import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { useData } from "../../src/data";
import { useTheme } from "../../src/theme";
import { needsFollowUp } from "../../src/tracker";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const icon = (name: IconName, focusedName: IconName) =>
  ({ color, size, focused }: { color: string; size: number; focused: boolean }) =>
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />;

export default function TabsLayout() {
  const t = useTheme();
  const { state } = useData();
  // Badge the Tracker tab with applications that are due a follow-up.
  const due = state ? state.tracker.filter((r) => needsFollowUp(r)).length : 0;
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.panel },
        headerTintColor: t.ink,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: t.panel, borderTopColor: t.line },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Pipeline", tabBarIcon: icon("layers-outline", "layers") }} />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: icon("briefcase-outline", "briefcase"),
          tabBarBadge: due || undefined,
          tabBarBadgeStyle: { backgroundColor: t.warn, color: t.accentInk },
        }}
      />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: icon("settings-outline", "settings") }} />
    </Tabs>
  );
}
