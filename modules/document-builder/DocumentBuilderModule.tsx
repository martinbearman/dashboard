"use client";

import { ModuleProps } from "@/lib/types/dashboard";
import DocumentBuilderView from "./components/DocumentBuilderView";

/**
 * Document builder module: editable document of blocks (heading, paragraph,
 * bullets, table, image) with drag-to-reorder. Prototype for LLM-assisted docs later.
 */
export default function DocumentBuilderModule({ moduleId }: ModuleProps) {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <DocumentBuilderView moduleId={moduleId} />
    </div>
  );
}
