"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { toggleSearchResultsPanel } from "@/lib/store/slices/uiSlice";

/**
 * Small tab on the right edge, vertically centered. Toggles the search results panel.
 * Only visible when there are results to show.
 */
export default function SearchResultsTab() {
  const dispatch = useAppDispatch();
  const { results, isOpen } = useAppSelector((s) => s.ui.searchResultsPanel);

  if (results.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleSearchResultsPanel())}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center w-10 h-16 rounded-l-lg border-2 border-r-0 border-slate-300 bg-white shadow-lg hover:bg-slate-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-shadow"
      aria-label={isOpen ? "Close search results" : "Open search results"}
      aria-expanded={isOpen}
      title={`Search results (${results.length}) – click to ${isOpen ? "close" : "open"}`}
    >
      <svg
        className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
