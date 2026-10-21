import Ionicons from "@expo/vector-icons/Ionicons";
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

type ScoreTone = "good" | "warn" | "bad" | "none";

function scoreColors(t: ReturnType<typeof useTheme>, tone: ScoreTone): [string, string] {
  return ({ good: [t.goodSoft, t.good], warn: [t.warnSoft, t.warn], bad: [t.badSoft, t.bad], none: [t.panel2, t.muted] } as const)[tone] as [string, string];
}

export function ScoreBadge({ score, tone, band }: { score: number | null | undefined; tone: ScoreTone; band?: string }) {
  const t = useTheme();
  const [bg, fg] = scoreColors(t, tone);
  return (
    <View accessibilityLabel={score == null ? "Not scored" : `Fit score ${score}${band ? `, ${band}` : ""}`} style={[s.score, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontSize: 18, fontWeight: "700" }}>{score ?? "–"}</Text>
      {band ? <Text style={{ color: fg, fontSize: 10, fontWeight: "600" }}>{band}</Text> : null}
    </View>
  );
}

/** A 0-100 fit bar with ticks at the Good (60) and Strong (75) thresholds. */
export function ScoreMeter({ score, tone, band }: { score: number | null | undefined; tone: ScoreTone; band: string }) {
  const t = useTheme();
  const [, fg] = scoreColors(t, tone);
  const pct = Math.max(0, Math.min(100, score ?? 0));
  return (
    <View style={{ gap: 6 }} accessibilityLabel={score == null ? "Not scored yet" : `Fit ${score} of 100, ${band}`}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
        <Text style={{ color: fg, fontSize: 28, fontWeight: "800" }}>{score ?? "–"}</Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>/ 100</Text>
        <Text style={{ color: fg, fontSize: 15, fontWeight: "700", marginLeft: "auto" }}>{band}</Text>
      </View>
      <View style={[s.track, { backgroundColor: t.panel2, borderColor: t.line }]}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: fg, borderRadius: radius.pill }} />
        {[60, 75].map((tick) => (
          <View key={tick} style={[s.tick, { left: `${tick}%`, backgroundColor: t.control }]} />
        ))}
      </View>
    </View>
  );
}

/** A round icon-only button; `label` is the accessibility name. */
export function IconButton({
  icon, label, onPress, tone = "neutral",
}: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void; tone?: Tone }) {
  const t = useTheme();
  const fg = { neutral: t.ink, good: t.good, warn: t.warn, bad: t.bad, accent: t.accent }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [s.iconButton, { borderColor: t.line, backgroundColor: pressed ? t.panel2 : t.panel }]}
    >
      <Ionicons name={icon} size={18} color={fg} />
    </Pressable>
  );
}

/** A number over a label, for summary strips. */
export function Stat({ value, label, tone = "neutral" }: { value: number; label: string; tone?: Tone }) {
  const t = useTheme();
  const fg = { neutral: t.ink, good: t.good, warn: t.warn, bad: t.bad, accent: t.accent }[tone];
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 2 }} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={{ color: value ? fg : t.muted, fontSize: 20, fontWeight: "700" }}>{value}</Text>
      <Text style={{ color: t.muted, fontSize: 11 }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, maxWidth: 220 },
  chipText: { fontSize: 12, fontWeight: "500" },
  toggle: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 36, justifyContent: "center" },
  button: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, minHeight: 40, alignItems: "center", justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: radius.md, padding: space.lg },
  score: { minWidth: 56, height: 52, paddingHorizontal: 4, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  track: { height: 10, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  tick: { position: "absolute", top: 0, bottom: 0, width: 1.5 },
  iconButton: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
