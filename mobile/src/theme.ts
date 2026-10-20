import { useColorScheme } from "react-native";

// Same palette as dashboard/index.html so the two UIs feel like one product.
const light = {
  bg: "#f4f5f7", panel: "#ffffff", panel2: "#f8f9fb", ink: "#16191d", muted: "#58626f", line: "#e2e5ea",
  control: "#8a94a3", accent: "#2b55d6", accentSoft: "#e8eefc", accentInk: "#ffffff",
  good: "#16734a", goodSoft: "#e3f4ec", warn: "#8f4a00", warnSoft: "#fdf0e1", bad: "#b42318", badSoft: "#fde8e7",
};
const dark: typeof light = {
  bg: "#0e1014", panel: "#161920", panel2: "#1b1f27", ink: "#e8ebf0", muted: "#a0a9b8", line: "#262b35",
  control: "#5d6677", accent: "#86a5ff", accentSoft: "#1d2640", accentInk: "#0e1014",
  good: "#5ccf96", goodSoft: "#13291f", warn: "#f2ae5c", warnSoft: "#2d2213", bad: "#ff8a80", badSoft: "#2e1717",
};

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === "dark" ? dark : light);

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, pill: 999 };
