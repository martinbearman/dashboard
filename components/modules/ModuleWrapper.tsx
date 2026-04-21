"use client";

import type { ReactNode } from "react";
import { ModuleActionsMenu } from "@/components/modules/ModuleActionsMenu";
import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/store/hooks";
import ModuleService from "@/lib/services/moduleService";
import { getModuleByType } from "@/modules/registry";
import type { MultiMenuMode } from "@/lib/store/slices/uiSlice";
import { toggleModuleSelected } from "@/lib/store/slices/uiSlice";
import { toastMessages } from "@/lib/strings/toastMessages";
import { toast } from "sonner";

export default function ModuleWrapper({
  children,
  moduleId,
}: {
  children: ReactNode;
  moduleId: string;
}) {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const locked =
    useAppSelector(
      (state) => state.moduleConfigs.configs[moduleId]?.locked ?? false,
    );
  
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
    remove: "hover:ring-4 hover:ring-red-500",
    search: "hover:ring-4 hover:ring-blue-500",
  };

  const selectedRingByMode: Record<Exclude<MultiMenuMode, null>, string> = {
    context: "ring-4 ring-green-500",
    organise: "ring-4 ring-yellow-400",
    remove: "ring-4 ring-red-500",
    search: "ring-4 ring-blue-500",
  };

  let modeRingClass = "";
  if (mode) {
    // In search mode, selected modules should not remain visibly highlighted.
    if (mode === "search" && isSelected) {
      modeRingClass = "";
    } else {
      modeRingClass = isSelected
        ? selectedRingByMode[mode]
        : hoverRingByMode[mode];
    }
  }

  const handleMultiModeInteraction = () => {
    if (!mode) return;
    if (locked && mode === "remove") {
      toast.warning(toastMessages.lockedRemove.directTitle(), {
        description: toastMessages.lockedRemove.directDescription(moduleName),
      });
      return;
    }
    if (mode === "remove") {
      if (!activeDashboardId) return;
      ModuleService.removeModule(dispatch, () => store.getState(), activeDashboardId, moduleId);
      if (selectedModuleIds.includes(moduleId)) {
        dispatch(toggleModuleSelected(moduleId));
      }
      return;
    }
    dispatch(toggleModuleSelected(moduleId));
  };

  return (
    <div
      onClick={handleMultiModeInteraction}
      className={`group bg-white rounded-lg shadow-md text-black relative w-full h-full flex flex-col overflow-hidden transition-all ${modeRingClass}`}
      data-locked={locked}
    >
      <ModuleActionsMenu moduleId={moduleId} locked={locked} moduleName={moduleName} />
      <div className="flex-1 overflow-auto relative">
        {children}
        {/* Overlay to block interactions when in selection mode */}
        {mode && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleMultiModeInteraction();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onMouseUp={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  );
}

