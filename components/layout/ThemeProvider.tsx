"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.globalConfig.theme);

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove("tron-theme", "light-theme", "dark-theme");
    
    // Add the current theme class
    if (theme === "tron") {
      document.body.classList.add("tron-theme");
    } else if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.add("light-theme");
    }
  }, [theme]);

  return <>{children}</>;
}
