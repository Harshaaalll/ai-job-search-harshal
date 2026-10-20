import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "../src/data";
import { useTheme } from "../src/theme";

export default function RootLayout() {
  const t = useTheme();
  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: t.panel }, headerTintColor: t.ink, contentStyle: { backgroundColor: t.bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="job/[key]" options={{ title: "Job" }} />
        </Stack>
      </DataProvider>
    </SafeAreaProvider>
  );
}
