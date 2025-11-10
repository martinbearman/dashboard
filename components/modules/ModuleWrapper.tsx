"use client";

import type { ReactNode } from "react";
import { ModuleActionsMenu } from "@/components/modules/ModuleActionsMenu";
import { useAppSelector } from "@/lib/store/hooks";

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

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 text-black relative w-full h-full"
      data-locked={locked}
    >
      <ModuleActionsMenu moduleId={moduleId} locked={locked} />
      <div className="h-full w-full">{children}</div>
    </div>
  );
}

