import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { radius, space, useTheme } from "../theme";

export type Tone = "neutral" | "good" | "warn" | "bad" | "accent";

export function Chip({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const t = useTheme();
  const palette = {
    neutral: [t.panel2, t.muted], good: [t.goodSoft, t.good], warn: [t.warnSoft, t.warn],
    bad: [t.badSoft, t.bad], accent: [t.accentSoft, t.accent],
  }[tone];
  return (
    <View style={[s.chip, { backgroundColor: palette[0], borderColor: t.line }]}>
      <Text style={[s.chipText, { color: palette[1] }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/** A selectable chip for filter sheets and segmented controls. */
export function Toggle({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.toggle, { borderColor: selected ? t.accent : t.control, backgroundColor: selected ? t.accentSoft : t.panel }]}
    >
      <Text style={{ color: selected ? t.accent : t.ink, fontSize: 14, fontWeight: selected ? "600" : "400" }}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label, onPress, kind = "default", disabled, style,
}: { label: string; onPress: () => void; kind?: "default" | "primary" | "ghost" | "danger"; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const bg = kind === "primary" ? t.accent : kind === "danger" ? t.badSoft : t.panel;
  const fg = kind === "primary" ? t.accentInk : kind === "danger" ? t.bad : kind === "ghost" ? t.muted : t.ink;
  const border = kind === "ghost" ? "transparent" : kind === "primary" ? t.accent : kind === "danger" ? t.bad : t.control;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.button, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.55 : 1 }, style]}
    >
      <Text style={{ color: fg, fontSize: 14, fontWeight: "500" }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[s.card, { backgroundColor: t.panel, borderColor: t.line }, style]}>{children}</View>;
}

export function Heading({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.muted, fontSize: 12, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase" }, style]}>{children}</Text>;
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ padding: space.xl, alignItems: "center", gap: space.xs }}>
      <Text style={{ color: t.ink, fontSize: 16, fontWeight: "600" }}>{title}</Text>
      {hint ? <Text style={{ color: t.muted, textAlign: "center" }}>{hint}</Text> : null}
    </View>
  );
}

export function ScoreBadge({ score, tone }: { score: number | null | undefined; tone: "good" | "warn" | "bad" | "none" }) {
  const t = useTheme();
  const [bg, fg] = { good: [t.goodSoft, t.good], warn: [t.warnSoft, t.warn], bad: [t.badSoft, t.bad], none: [t.panel2, t.muted] }[tone];
  return (
    <View accessibilityLabel={score == null ? "Not scored" : `Fit score ${score}`} style={[s.score, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 18, fontWeight: "700" }}>{score ?? "–"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, maxWidth: 220 },
  chipText: { fontSize: 12, fontWeight: "500" },
  toggle: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 36, justifyContent: "center" },
  button: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, minHeight: 40, alignItems: "center", justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: radius.md, padding: space.lg },
  score: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
});
