"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import TimerModulePage from "./app/page";

/**
 * Timer Module Component Wrapper
 * 
 * This component wraps the timer module's main page to integrate
 * with the dashboard module system. It receives moduleId and config
 * props from the dashboard.
 * 
 * The timer module now uses the main dashboard's Redux store, so
 * no separate Providers are needed.
 */
export default function TimerModule({ moduleId, config }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-auto">
      <TimerModulePage />
    </div>
  );
}

