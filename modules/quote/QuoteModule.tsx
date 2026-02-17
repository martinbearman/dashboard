"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import QuoteDisplay from "./components/QuoteDisplay";

/**
 * Quote Module Component Wrapper
 * 
 * This component wraps the quote module's main display to integrate
 * with the dashboard module system. It receives moduleId and config
 * props from the dashboard.
 */
export default function QuoteModule({ moduleId, config }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-auto p-4">
      <QuoteDisplay moduleId={moduleId} config={config} />
    </div>
  );
}

