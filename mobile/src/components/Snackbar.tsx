import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, space, useTheme } from "../theme";

interface Message {
  text: string;
  undo?: () => void;
}

/** A single-message snackbar with an optional Undo, e.g. after dismissing a job. */
export function useSnackbar() {
  const [msg, setMsg] = useState<Message | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, undo?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg({ text, undo });
    timer.current = setTimeout(() => setMsg(null), undo ? 6000 : 3000);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const node = msg ? <Snackbar message={msg} onClose={() => setMsg(null)} /> : null;
  return { show, node };
}

function Snackbar({ message, onClose }: { message: Message; onClose: () => void }) {
  const t = useTheme();
  return (
    <View pointerEvents="box-none" style={s.wrap}>
      <View accessibilityLiveRegion="polite" style={[s.bar, { backgroundColor: t.ink }]}>
        <Text style={{ color: t.bg, flex: 1 }}>{message.text}</Text>
        {message.undo ? (
          <Pressable accessibilityRole="button" onPress={() => { message.undo?.(); onClose(); }}>
            <Text style={{ color: t.accent, fontWeight: "700", paddingLeft: space.md }}>Undo</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: space.lg, right: space.lg, bottom: space.lg },
  bar: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: space.lg },
});
