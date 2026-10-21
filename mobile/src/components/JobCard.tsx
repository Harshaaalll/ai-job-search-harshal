import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRef } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { CITY_LABEL, cityOf, scoreBand, scoreTone } from "../filters";
import { radius, space, useTheme } from "../theme";
import type { Job, JobAction } from "../types";
import { Button, Card, Chip, IconButton, ScoreBadge } from "./ui";

export function relativeDate(iso: string | null | undefined, now: number = Date.now()): string {
  const t = Date.parse(iso || "");
  if (Number.isNaN(t)) return "";
  const days = Math.floor((now - t) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return days < 30 ? `${days}d ago` : `${Math.floor(days / 30)}mo ago`;
}

/** Job chips shared by the list card and the detail screen. */
export function JobChips({ job }: { job: Job }) {
  return (
    <View style={s.chips}>
      {job.location ? <Chip label={job.location} /> : null}
      {job.work_mode ? <Chip label={job.work_mode} /> : null}
      {job.ats ? <Chip label={`via ${job.ats}`} /> : null}
      {job.pay_evidence ? <Chip label={`₹ ${job.pay_evidence}`} tone={/below|<10/i.test(job.pay_evidence) ? "bad" : "good"} /> : null}
      {job.deadline ? <Chip label={`Closes ${job.deadline}`} tone="warn" /> : null}
      {job.experience_note ? <Chip label={`Asks ${job.experience_note}`} tone="warn" /> : null}
      {job.location_verdict === "FLAG" ? <Chip label="Check location" tone="warn" /> : null}
      {job.language_gate === "FLAG" ? <Chip label="Check language" tone="warn" /> : null}
      {job.apply_queue ? <Chip label={`Queued #${job.apply_queue}`} tone="good" /> : null}
      {job.pipeline_state === "failed" || job.pipeline_state === "skipped" ? (
        <Chip label={`Pipeline ${job.pipeline_state}${job.pipeline_note ? `: ${job.pipeline_note}` : ""}`} tone={job.pipeline_state === "failed" ? "bad" : "warn"} />
      ) : null}
    </View>
  );
}

export function openPosting(job: Job) {
  // Only http(s): a scraped URL must never be able to launch another scheme.
  if (!/^https?:\/\//i.test(job.url)) return Alert.alert("Cannot open", "This posting has no valid link.");
  Linking.openURL(job.url).catch(() => Alert.alert("Cannot open", "No app could open this link."));
}

export function confirmApplied(job: Job, onConfirm: () => void) {
  Alert.alert("Mark as applied?", `${job.title} at ${job.company}`, [
    { text: "Cancel", style: "cancel" },
    { text: "I applied", onPress: onConfirm },
  ]);
}

/** One line of the ranker's reasoning: the first strength, else the first gap. */
function WhyLine({ job }: { job: Job }) {
  const t = useTheme();
  const strength = job.strengths?.[0];
  const gap = job.gaps?.[0];
  if (!strength && !gap) return null;
  return (
    <View style={{ gap: 4 }}>
      {strength ? (
        <View style={s.why}>
          <Ionicons name="checkmark-circle" size={15} color={t.good} />
          <Text style={{ color: t.ink, fontSize: 13, flex: 1 }} numberOfLines={1}>{strength}</Text>
        </View>
      ) : null}
      {gap ? (
        <View style={s.why}>
          <Ionicons name="alert-circle" size={15} color={t.warn} />
          <Text style={{ color: t.muted, fontSize: 13, flex: 1 }} numberOfLines={1}>{gap}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SwipeAction({ icon, label, color, align }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; color: string; align: "left" | "right" }) {
  const t = useTheme();
  return (
    <View style={[s.swipe, { backgroundColor: color, alignItems: align === "left" ? "flex-start" : "flex-end" }]}>
      <View style={{ alignItems: "center", gap: 2 }}>
        <Ionicons name={icon} size={22} color={t.accentInk} />
        <Text style={{ color: t.accentInk, fontWeight: "700", fontSize: 12 }}>{label}</Text>
      </View>
    </View>
  );
}

/** A job in the feed. Swipe right to queue / unqueue a draft, swipe left to dismiss / restore. */
export function JobCard({ job, onOpen, onAction }: { job: Job; onOpen: () => void; onAction: (a: JobAction) => void }) {
  const t = useTheme();
  const ref = useRef<Swipeable>(null);
  const posted = relativeDate(job.posted_date || job.first_seen);
  const city = cityOf(job.location);
  const dismissed = job.user_status === "dismissed";
  const queueAction: JobAction = job.apply_queue ? "unqueue" : "queue";
  const hideAction: JobAction = dismissed ? "restore" : "dismiss";
  const meta = [city === "other" ? job.location : CITY_LABEL[city], job.work_mode, posted && `posted ${posted}`].filter(Boolean).join(" · ");

  return (
    <Swipeable
      ref={ref}
      friction={1.6}
      leftThreshold={72}
      rightThreshold={72}
      overshootFriction={8}
      renderLeftActions={() => <SwipeAction icon={job.apply_queue ? "remove-circle" : "add-circle"} label={job.apply_queue ? "Unqueue" : "Queue"} color={t.good} align="left" />}
      renderRightActions={() => <SwipeAction icon={dismissed ? "arrow-undo" : "eye-off"} label={dismissed ? "Restore" : "Dismiss"} color={dismissed ? t.accent : t.bad} align="right" />}
      onSwipeableOpen={(direction) => {
        ref.current?.close();
        onAction(direction === "left" ? queueAction : hideAction);
      }}
    >
      <Card style={{ gap: space.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${job.title} at ${job.company}, open details`} onPress={onOpen} style={{ gap: space.md }}>
          <View style={s.head}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.muted, fontSize: 13, fontWeight: "600" }} numberOfLines={1}>{job.company}</Text>
              <Text style={{ color: t.ink, fontSize: 16, fontWeight: "700", lineHeight: 21 }} numberOfLines={2}>{job.title}</Text>
              {meta ? <Text style={{ color: t.muted, fontSize: 12 }} numberOfLines={1}>{meta}</Text> : null}
            </View>
            <ScoreBadge score={job.rank_score} tone={scoreTone(job.rank_score)} band={job.rank_score == null ? undefined : scoreBand(job.rank_score)} />
          </View>
          <WhyLine job={job} />
          <CardFlags job={job} />
        </Pressable>
        <View style={s.actions}>
          <Button
            kind={job.apply_queue ? "default" : "primary"}
            label={job.apply_queue ? `Queued #${job.apply_queue}` : "Queue draft"}
            onPress={() => onAction(queueAction)}
            style={{ flex: 1 }}
          />
          <IconButton icon="open-outline" label="Open posting" onPress={() => openPosting(job)} />
          <IconButton icon="checkmark-done" label="I applied" tone="good" onPress={() => confirmApplied(job, () => onAction("applied"))} />
          <IconButton icon={dismissed ? "arrow-undo" : "eye-off-outline"} label={dismissed ? "Restore" : "Dismiss"} tone={dismissed ? "accent" : "bad"} onPress={() => onAction(hideAction)} />
        </View>
      </Card>
    </Swipeable>
  );
}

/** Only the chips that need attention; the full set is on the detail screen. */
function CardFlags({ job }: { job: Job }) {
  const flags = [
    job.experience_note ? <Chip key="exp" label={`Asks ${job.experience_note}`} tone="warn" /> : null,
    job.deadline ? <Chip key="dl" label={`Closes ${job.deadline}`} tone="warn" /> : null,
    job.location_verdict === "FLAG" ? <Chip key="loc" label="Check location" tone="warn" /> : null,
    job.language_gate === "FLAG" ? <Chip key="lang" label="Check language" tone="warn" /> : null,
    job.pay_evidence ? <Chip key="pay" label={`₹ ${job.pay_evidence}`} tone={/below|<10/i.test(job.pay_evidence) ? "bad" : "good"} /> : null,
    job.pipeline_state === "failed" || job.pipeline_state === "skipped" ? (
      <Chip key="pl" label={`Pipeline ${job.pipeline_state}`} tone={job.pipeline_state === "failed" ? "bad" : "warn"} />
    ) : null,
  ].filter(Boolean);
  return flags.length ? <View style={s.chips}>{flags}</View> : null;
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "flex-start", gap: space.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, alignItems: "center" },
  why: { flexDirection: "row", alignItems: "center", gap: 6 },
  swipe: { flex: 1, justifyContent: "center", paddingHorizontal: space.xl, borderRadius: radius.md },
});
