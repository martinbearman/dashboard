"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { getThemeById, getAllPredefinedThemes, DEFAULT_THEME_ID } from "@/lib/constants/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeDashboardId, dashboards } = useAppSelector((state) => state.dashboards);
  const defaultTheme = useAppSelector((state) => state.globalConfig.defaultTheme);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  
  // Resolve theme: dashboard theme -> default theme -> fallback
  const themeId = active?.theme || defaultTheme || DEFAULT_THEME_ID;
  const theme = getThemeById(themeId);

  useEffect(() => {
    // Get all possible theme classes to remove
    const allThemes = getAllPredefinedThemes();
    const allThemeClasses = allThemes.map((t) => t.cssClass);
    
    // Remove all theme classes
    document.body.classList.remove(...allThemeClasses);
    
    // Add the current theme class
    if (theme) {
      document.body.classList.add(theme.cssClass);
    } else {
      // Fallback to default if theme not found
      document.body.classList.add("tron-theme");
    }
  }, [theme, themeId]);

  return <>{children}</>;
}
