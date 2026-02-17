"use client";

import type { ReactNode } from "react";
import { ModuleActionsMenu } from "@/components/modules/ModuleActionsMenu";
import { useAppSelector } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";

export default function ModuleWrapper({
  children,
  moduleId,
}: {
  children: ReactNode;
  moduleId: string;
}) {
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

  return (
    <div
      className="bg-white rounded-lg shadow-md text-black relative w-full h-full flex flex-col overflow-hidden"
      data-locked={locked}
    >
      <ModuleActionsMenu moduleId={moduleId} locked={locked} moduleName={moduleName} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

