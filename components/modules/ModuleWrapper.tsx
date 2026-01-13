"use client";

import type { ReactNode } from "react";
import { ModuleActionsMenu } from "@/components/modules/ModuleActionsMenu";
import { useAppSelector } from "@/lib/store/hooks";
import { getModuleByType } from "@/modules/registry";
import { clsx } from "clsx";

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
  const theme = useAppSelector((state) => state.globalConfig.theme);
  
  // Get the module type from the active dashboard
  const { activeDashboardId, dashboards } = useAppSelector((s) => s.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  const moduleInstance = active?.modules.find((m) => m.id === moduleId);
  const moduleMeta = moduleInstance ? getModuleByType(moduleInstance.type) : null;
  const moduleName = moduleMeta?.displayName ?? "Module";

  const wrapperClassName = clsx(
    "rounded-lg shadow-md relative w-full h-full flex flex-col overflow-hidden",
    theme === "tron"
      ? "tron-bg tron-border text-white"
      : "bg-white text-black"
  );

  return (
    <div
      className={wrapperClassName}
      data-locked={locked}
    >
      <ModuleActionsMenu moduleId={moduleId} locked={locked} moduleName={moduleName} />
      <div className="flex-1 p-4 overflow-auto">{children}</div>
    </div>
  );
}

