export const THEME_STORAGE_KEY = "portfolio-theme";

export type ThemeId = "dark" | "light" | "dragon";

export const DEFAULT_THEME: ThemeId = "light";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "dark",
    label: "Dark",
    description: "Low-light workspace look.",
  },
  {
    id: "light",
    label: "Light",
    description: "The default. Bright, understated, recruiter-friendly.",
  },
  {
    id: "dragon",
    label: "Dragon",
    description: "Animated ember glow & dragon silhouette.",
  },
];

export const THEME_IDS: ThemeId[] = THEMES.map((t) => t.id);

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && (THEME_IDS as string[]).includes(value);
}

/**
 * Inline script injected into <head> so the correct theme attribute is set
 * before first paint/hydration. Prevents a flash of the wrong theme.
 */
export const themeInitScript = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var valid = ${JSON.stringify(THEME_IDS)};
    var stored = localStorage.getItem(key);
    var theme = valid.indexOf(stored) !== -1 ? stored : ${JSON.stringify(DEFAULT_THEME)};
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(DEFAULT_THEME)});
  }
})();
`;