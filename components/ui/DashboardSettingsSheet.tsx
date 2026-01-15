"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { closeDashboardSettingsPanel } from "@/lib/store/slices/uiSlice";
import { updateDashboardName, setDashboardTheme } from "@/lib/store/slices/dashboardsSlice";
import { setDefaultTheme } from "@/lib/store/slices/globalConfigSlice";
import { getAllPredefinedThemes, getThemeById, DEFAULT_THEME_ID } from "@/lib/constants/themes";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import type { ThemeColors } from "@/lib/types/theme";

export default function DashboardSettingsSheet() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.dashboardSettingsPanel);
  const { activeDashboardId, dashboards } = useAppSelector((state) => state.dashboards);
  const defaultTheme = useAppSelector((state) => state.globalConfig.defaultTheme);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  
  const [dashboardName, setDashboardName] = useState(active?.name || "");
  const [selectedThemeId, setSelectedThemeId] = useState(
    active?.theme || defaultTheme || DEFAULT_THEME_ID
  );
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    background: "#ffffff",
    foreground: "#171717",
    accent: "#f59e0b",
    border: "#e5e7eb",
    text: "#171717",
  });
  
  // Update local state when active dashboard changes
  useEffect(() => {
    if (active) {
      setDashboardName(active.name);
      setSelectedThemeId(active.theme || defaultTheme || DEFAULT_THEME_ID);
    }
  }, [active, defaultTheme]);

  const predefinedThemes = getAllPredefinedThemes();
  const currentTheme = getThemeById(selectedThemeId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeDashboardSettingsPanel());
    }
  };

  const handleClose = () => {
    dispatch(closeDashboardSettingsPanel());
  };

  const handleNameChange = (newName: string) => {
    setDashboardName(newName);
    if (activeDashboardId && newName.trim()) {
      dispatch(updateDashboardName({ dashboardId: activeDashboardId, name: newName.trim() }));
    }
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedThemeId(themeId);
    if (activeDashboardId) {
      dispatch(setDashboardTheme({ dashboardId: activeDashboardId, themeId }));
    }
  };

  const handleDefaultThemeChange = (themeId: string) => {
    dispatch(setDefaultTheme(themeId));
  };

  if (!active) {
    return null;
  }

  // Determine theme for styling the sheet itself
  const sheetTheme = currentTheme?.id || defaultTheme || DEFAULT_THEME_ID;
  const isTronTheme = sheetTheme === "tron";

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="config-sheet-overlay fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className={clsx(
          "config-sheet-content fixed right-0 top-0 h-full w-full max-w-lg shadow-xl z-50 overflow-y-auto",
          isTronTheme 
            ? "bg-black/95 border-l-2 border-tron-neon/50" 
            : "bg-white"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={clsx(
              "flex items-center justify-between p-4 border-b sticky top-0 z-10",
              isTronTheme 
                ? "border-tron-neon/50 bg-black/95" 
                : "border-gray-200 bg-white"
            )}>
              <Dialog.Title className={clsx(
                "text-xl font-semibold",
                isTronTheme ? "text-white tron-glow" : "text-gray-900"
              )}>
                Dashboard Settings
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className={clsx(
                    "text-2xl leading-none focus:outline-none focus:ring-2 rounded p-1",
                    isTronTheme
                      ? "text-white/70 hover:text-white hover:bg-black/50 focus:ring-tron-neon"
                      : "text-gray-500 hover:text-gray-700 focus:ring-blue-500"
                  )}
                  aria-label="Close settings"
                >
                  ×
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-6">
              {/* Dashboard Name */}
              <div>
                <label className={clsx(
                  "block text-sm font-medium mb-2",
                  isTronTheme ? "text-white" : "text-gray-700"
                )}>
                  Dashboard Name
                </label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={(e) => handleNameChange(e.target.value)}
                  className={clsx(
                    "w-full rounded-md border px-3 py-2 outline-none focus:ring-2",
                    isTronTheme
                      ? "bg-black/50 border-tron-neon/50 text-white placeholder-white/50 focus:ring-tron-neon focus:border-tron-neon"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  )}
                  placeholder="Enter dashboard name"
                />
              </div>

              {/* Theme Selection */}
              <div>
                <label className={clsx(
                  "block text-sm font-medium mb-2",
                  isTronTheme ? "text-white" : "text-gray-700"
                )}>
                  Theme
                </label>
                <div className="space-y-2">
                  {predefinedThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={clsx(
                        "w-full text-left rounded-lg border-2 p-3 transition",
                        selectedThemeId === theme.id
                          ? isTronTheme
                            ? "bg-tron-neon/20 border-tron-neon text-white"
                            : "bg-blue-50 border-blue-500 text-blue-900"
                          : isTronTheme
                            ? "border-tron-neon/30 hover:border-tron-neon/50 text-white/70 hover:text-white bg-black/30"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <div className={clsx(
                        "font-medium",
                        isTronTheme && selectedThemeId === theme.id && "tron-glow"
                      )}>
                        {theme.name}
                      </div>
                      {theme.description && (
                        <div className={clsx(
                          "text-sm mt-1",
                          isTronTheme ? "text-white/60" : "text-gray-600"
                        )}>
                          {theme.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Theme (Global Setting) */}
              <div>
                <label className={clsx(
                  "block text-sm font-medium mb-2",
                  isTronTheme ? "text-white" : "text-gray-700"
                )}>
                  Default Theme (for new dashboards)
                </label>
                <select
                  value={defaultTheme}
                  onChange={(e) => handleDefaultThemeChange(e.target.value)}
                  className={clsx(
                    "w-full rounded-md border px-3 py-2 outline-none focus:ring-2",
                    isTronTheme
                      ? "bg-black/50 border-tron-neon/50 text-white focus:ring-tron-neon focus:border-tron-neon"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  )}
                >
                  {predefinedThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Theme Editor */}
              <div>
                <label className={clsx(
                  "block text-sm font-medium mb-2",
                  isTronTheme ? "text-white" : "text-gray-700"
                )}>
                  Custom Theme Editor
                </label>
                <div className={clsx(
                  "rounded-lg border-2 p-4 space-y-4",
                  isTronTheme
                    ? "border-tron-neon/30 bg-black/30"
                    : "border-gray-200 bg-gray-50"
                )}>
                  <div className={clsx(
                    "text-xs mb-3",
                    isTronTheme ? "text-white/60" : "text-gray-500"
                  )}>
                    Create a custom color scheme for this dashboard. Full custom theme support coming soon.
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Primary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.primary || "#3b82f6"}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.primary || "#3b82f6"}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Secondary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.secondary || "#8b5cf6"}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.secondary || "#8b5cf6"}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Background
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.background || "#ffffff"}
                          onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.background || "#ffffff"}
                          onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Accent
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.accent || "#f59e0b"}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.accent || "#f59e0b"}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Text
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.text || "#171717"}
                          onChange={(e) => setCustomColors({ ...customColors, text: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.text || "#171717"}
                          onChange={(e) => setCustomColors({ ...customColors, text: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={clsx(
                        "block text-xs mb-1",
                        isTronTheme ? "text-white/70" : "text-gray-600"
                      )}>
                        Border
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColors.border || "#e5e7eb"}
                          onChange={(e) => setCustomColors({ ...customColors, border: e.target.value })}
                          className="w-12 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColors.border || "#e5e7eb"}
                          onChange={(e) => setCustomColors({ ...customColors, border: e.target.value })}
                          className={clsx(
                            "flex-1 rounded px-2 py-1 text-xs",
                            isTronTheme
                              ? "bg-black/50 border border-tron-neon/30 text-white"
                              : "bg-white border border-gray-300"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      // TODO: Implement custom theme saving
                      alert("Custom theme saving will be implemented soon. This will create a custom theme and apply it to this dashboard.");
                    }}
                    className={clsx(
                      "w-full rounded-md px-4 py-2 text-sm font-medium transition",
                      isTronTheme
                        ? "bg-tron-neon/20 border-2 border-tron-neon text-white hover:bg-tron-neon/30"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    )}
                  >
                    Save Custom Theme
                  </button>
                </div>
              </div>

              {/* AI Assistance - Placeholder for future */}
              <div>
                <div className={clsx(
                  "text-sm font-medium mb-2",
                  isTronTheme ? "text-white/70" : "text-gray-500"
                )}>
                  AI Assistance
                </div>
                <div className={clsx(
                  "rounded-lg border-2 p-4 text-sm",
                  isTronTheme
                    ? "border-tron-neon/30 text-white/50 bg-black/30"
                    : "border-gray-200 text-gray-500 bg-gray-50"
                )}>
                  AI assistance for dashboard creation and module updates coming soon.
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
