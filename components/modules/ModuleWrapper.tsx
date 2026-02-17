"use client";

import type { ReactNode } from "react";
import { ModuleActionsMenu } from "@/components/modules/ModuleActionsMenu";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import type { MultiMenuMode } from "@/lib/store/slices/uiSlice";
import { toggleModuleSelected } from "@/lib/store/slices/uiSlice";

export default function ModuleWrapper({
  children,
  moduleId,
}: {
  children: ReactNode;
  moduleId: string;
}) {
  const dispatch = useAppDispatch();

  const locked =
    useAppSelector(
      (state) => state.moduleConfigs.configs[moduleId]?.locked ?? false,
    );
  
  // Get the module type from the active dashboard
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const moduleInstance = active?.modules.find((m) => m.id === moduleId);
  const moduleMeta = moduleInstance ? getModuleByType(moduleInstance.type) : null;
  const moduleName = moduleMeta?.displayName ?? "Module";

  const { multiMenuMode, selectedModuleIds } = useAppSelector((s) => s.ui);
  const mode = multiMenuMode;
  const isSelected = !!mode && selectedModuleIds.includes(moduleId);

  const hoverRingByMode: Record<Exclude<MultiMenuMode, null>, string> = {
    context: "hover:ring-4 hover:ring-green-500",
    organise: "hover:ring-4 hover:ring-yellow-400",
    delete: "hover:ring-4 hover:ring-red-500",
    stash: "hover:ring-4 hover:ring-blue-500",
  };

  const selectedRingByMode: Record<Exclude<MultiMenuMode, null>, string> = {
    context: "ring-4 ring-green-500",
    organise: "ring-4 ring-yellow-400",
    delete: "ring-4 ring-red-500",
    stash: "ring-4 ring-blue-500",
  };

  let modeRingClass = "";
  if (mode) {
    modeRingClass = isSelected
      ? selectedRingByMode[mode]
      : hoverRingByMode[mode];
  }

  const handleClick = () => {
    // Only toggle selection when a mode is active
    if (!mode) return;
    // Optionally prevent selecting locked modules for delete mode
    if (locked && mode === "delete") return;
    dispatch(toggleModuleSelected(moduleId));
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white rounded-lg shadow-md text-black relative w-full h-full flex flex-col overflow-hidden transition-all ${modeRingClass}`}
      data-locked={locked}
    >
      <ModuleActionsMenu moduleId={moduleId} locked={locked} moduleName={moduleName} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

