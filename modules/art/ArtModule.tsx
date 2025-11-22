"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import ArtDisplay from "./components/ArtDisplay";

/**
 * Art Module Component Wrapper
 * 
 * This component wraps the art module's main display to integrate
 * with the dashboard module system. It receives moduleId and config
 * props from the dashboard.
 */
export default function ArtModule({ moduleId, config }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-auto">
      <ArtDisplay moduleId={moduleId} config={config} />
    </div>
  );
}

