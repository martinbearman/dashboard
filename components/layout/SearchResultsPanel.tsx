"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import {
  closeSearchResultsPanel,
  toggleSearchResultSelected,
} from "@/lib/store/slices/uiSlice";
import { addSelectedSearchResultsToDashboard } from "@/lib/store/thunks/dashboardThunks";
import type { SearchResult } from "@/lib/types/search";

function ResultItem({
  result,
  selected,
  onToggle,
}: {
  result: SearchResult;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-col w-full text-left rounded-lg border p-3 transition-colors ${
        selected
          ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-400/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      }`}
      aria-pressed={selected}
    >
      <span className="flex-1 min-w-0">
        {result.type === "image" && (
          <span className="flex flex-col gap-2">
            <img
              src={result.data.regularUrl}
              alt={result.data.alt || ""}
              className="w-full h-auto object-cover rounded"
            />
            <span className="text-sm text-slate-700 line-clamp-2">{result.data.alt || "Image"}</span>
          </span>
        )}
        {result.type === "text" && (
          <span className="text-sm text-slate-700">
            {result.data.title && <strong className="block">{result.data.title}</strong>}
            <span className="line-clamp-2">{result.data.body}</span>
          </span>
        )}
      </span>
    </button>
  );
}

export default function SearchResultsPanel() {
  const dispatch = useAppDispatch();
  const { isOpen, query, results, selectedResultIds } = useAppSelector(
    (s) => s.ui.searchResultsPanel
  );
  const activeDashboardId = useAppSelector((s) => s.dashboards.activeDashboardId);

  const selectedCount = selectedResultIds.length;
  const canAdd = activeDashboardId && selectedCount > 0;

  const handleAddSelected = () => {
    if (!canAdd) return;
    dispatch(addSelectedSearchResultsToDashboard());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        aria-hidden
        onClick={() => dispatch(closeSearchResultsPanel())}
      />

      {/* Slide-out panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-[slide-in-from-right_0.25s_ease-out]"
        role="dialog"
        aria-label="Search results"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            Search results{query ? `: “${query}”` : ""}
          </h2>
          <button
            type="button"
            onClick={() => dispatch(closeSearchResultsPanel())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close panel"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="text-slate-500 text-sm">No results. Try a different search.</p>
          ) : (
            <ul className="space-y-2 list-none p-0 m-0">
              {results.map((result) => (
                <li key={result.id}>
                  <ResultItem
                    result={result}
                    selected={selectedResultIds.includes(result.id)}
                    onToggle={() => dispatch(toggleSearchResultSelected(result.id))}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600">
            {selectedCount > 0 ? `${selectedCount} selected` : "Select items to add"}
          </span>
          <button
            type="button"
            onClick={handleAddSelected}
            disabled={!canAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add selected
          </button>
        </div>
      </div>
    </>
  );
}
