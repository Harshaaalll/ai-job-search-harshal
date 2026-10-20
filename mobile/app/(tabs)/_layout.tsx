import { Tabs } from "expo-router";
import React from "react";
import { useTheme } from "../../src/theme";

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.panel },
        headerTintColor: t.ink,
        tabBarStyle: { backgroundColor: t.panel, borderTopColor: t.line },
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarIconStyle: { display: "none" },
        tabBarLabelStyle: { fontSize: 14, paddingBottom: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Pipeline" }} />
      <Tabs.Screen name="tracker" options={{ title: "Tracker" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
