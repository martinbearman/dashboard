"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { 
  setActiveGoal, 
  deleteTodo, 
  clearActiveGoal, 
  createTodo,
  selectIncompleteTodosByListId,
  toggleTodo,
  updateTodo,
  setTodoLink,
  reorderTodosInList,
  type TodoLinkType,
  type Todo
} from "@/lib/store/slices/todoSlice";
import { setActiveDashboard } from "@/lib/store/slices/dashboardsSlice";
import { setTimeRemaining, DEFAULT_TIMER_ID, DEFAULT_TIMER_VALUES } from "@/modules/timer/store/slices/timerSlice";
import { useState, useRef, useEffect } from "react";
import SortableTodoCard from "./SortableTodoCard";
import { getModuleByType } from "@/modules/registry";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const MAX_GOAL_DESCRIPTION_LENGTH = 120;

interface TodoListProps {
  moduleId: string;
  config?: Record<string, any>;
}

/**
 * TodoList Component
 * 
 * Displays and manages todos. Migrated from GoalHistory functionality.
 * Shows todos with timer-related information and allows switching active goals.
 */
export default function TodoList({ moduleId, config }: TodoListProps) {
  const listId = (config?.listId as string) ?? "default";

  // Get the linked timer ID from config, or use default
  const linkedTimerId = (config?.linkedTimerId as string) || DEFAULT_TIMER_ID;

  const todos = useAppSelector((state) =>
    selectIncompleteTodosByListId(state, listId)
  );
  const { dashboards, activeDashboardId } = useAppSelector((state) => state.dashboards);
  const dashboardList = Object.values(dashboards);

  // Get the specific timer instance, with fallback defaults
  const timer = useAppSelector(state => {
    const timerInstance = state.timer.timers[linkedTimerId];
    // Fallback to defaults if timer doesn't exist yet
    return timerInstance || {
      isRunning: DEFAULT_TIMER_VALUES.isRunning,
      studyDuration: DEFAULT_TIMER_VALUES.studyDuration,
    };
  });

  const isRunning = timer.isRunning;
  const studyDuration = timer.studyDuration;

  const dispatch = useAppDispatch();
  const [newTodoText, setNewTodoText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [linkSheetOpen, setLinkSheetOpen] = useState(false);
  const [linkTodoId, setLinkTodoId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState<{
    type: TodoLinkType;
    label: string;
    url: string;
    dashboardId: string;
    moduleId: string;
  }>({
    type: "url",
    label: "",
    url: "",
    dashboardId: activeDashboardId ?? "",
    moduleId: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const labelLimit = 60;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Use the underlying list order from state as the canonical ordering so that
  // drag-and-drop operations can persist their order.
  const orderedTodos = todos;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    dispatch(
      reorderTodosInList({
        listId,
        activeId: String(active.id),
        overId: String(over.id),
      })
    );
  };

  const handleTodoClick = (todoId: string) => {
    // Only allow switching if timer is NOT running
    if (!isRunning) {
      const todo = todos.find(t => t.id === todoId);
      if (!todo || todo.isActiveGoal) return;
      
      // Set this todo as the active goal
      dispatch(setActiveGoal(todoId));
      
      // Reset timer to full duration when switching goals
      dispatch(setTimeRemaining({ 
        timerId: linkedTimerId, 
        seconds: studyDuration 
      }));
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // If this is the active goal, clear it first
    if (todo.isActiveGoal) {
      dispatch(clearActiveGoal());
    }
    dispatch(deleteTodo(todoId));
  };

  const handleCompleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.completed) return;

    if (todo.isActiveGoal) {
      dispatch(clearActiveGoal());
    }

    dispatch(toggleTodo(todoId));
  };

  // Auto-focus input when it appears
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const handleCreateTodo = () => {
    if (newTodoText.trim() === "") return;
    
    dispatch(createTodo({
      description: newTodoText.trim().slice(0, MAX_GOAL_DESCRIPTION_LENGTH),
      listId,
    }));
    
    setNewTodoText("");
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateTodo();
    } else if (e.key === "Escape") {
      setNewTodoText("");
      setShowInput(false);
    }
  };

  const handleToggleInput = () => {
    setShowInput(!showInput);
    if (!showInput) {
      // Clear text when opening
      setNewTodoText("");
    }
  };

  const handleStartEdit = (todoId: string, description: string) => {
    setEditingTodoId(todoId);
    setEditingText(description);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText("");
  };

  const handleSaveEdit = () => {
    if (!editingTodoId) return;
    const trimmed = editingText.trim();
    if (trimmed === "") {
      handleCancelEdit();
      return;
    }
    const bounded = trimmed.slice(0, MAX_GOAL_DESCRIPTION_LENGTH);
    const todo = todos.find(t => t.id === editingTodoId);
    if (!todo || todo.description === bounded) {
      handleCancelEdit();
      return;
    }
    dispatch(updateTodo({ id: editingTodoId, description: bounded }));
    handleCancelEdit();
  };

  const isEditing = (todoId: string) => editingTodoId === todoId;

  const moduleOptions = dashboardList.flatMap((dashboard) =>
    dashboard.modules
      .filter((m) => m.type === "Timer")
      .map((m) => {
        const meta = getModuleByType(m.type);
        return {
          moduleId: m.id,
          dashboardId: dashboard.id,
          dashboardName: dashboard.name,
          displayName: meta?.displayName ?? m.type,
        };
      })
  );

  const getDefaultDashboardId = () => activeDashboardId ?? dashboardList[0]?.id ?? "";

  const openLinkSheet = (todo: Todo) => {
    const link = todo.link;
    setLinkTodoId(todo.id);
    setLinkForm({
      type: link?.type ?? "url",
      label: link?.label ?? "",
      url: link?.type === "url" ? link.target : "",
      dashboardId:
        link?.type === "dashboard"
          ? link.target
          : getDefaultDashboardId(),
      moduleId: link?.type === "module" ? link.target : "",
    });
    setLinkSheetOpen(true);
  };

  const closeLinkSheet = () => {
    setLinkSheetOpen(false);
    setLinkTodoId(null);
    setLinkForm({
      type: "url",
      label: "",
      url: "",
      dashboardId: getDefaultDashboardId(),
      moduleId: "",
    });
  };

  const findModuleContext = (moduleId: string) => {
    for (const dash of dashboardList) {
      const mod = dash.modules.find((m) => m.id === moduleId);
      if (mod) {
        const meta = getModuleByType(mod.type);
        return {
          dashboardId: dash.id,
          dashboardName: dash.name,
          displayName: meta?.displayName ?? mod.type,
        };
      }
    }
    return null;
  };

  const getLinkLabel = (link?: Todo["link"] | null) => {
    if (!link) return "";
    if (link.label?.trim()) return link.label.trim();
    if (link.type === "url") {
      try {
        const url = new URL(link.target);
        return url.host;
      } catch {
        return "Link";
      }
    }
    if (link.type === "dashboard") {
      const dash = dashboards[link.target];
      return dash?.name ?? "Dashboard";
    }
    if (link.type === "module") {
      const context = findModuleContext(link.target);
      return context ? `${context.displayName}` : "Module";
    }
    return "";
  };

  const handleLinkNavigate = (todo: Todo) => {
    const link = todo.link;
    if (!link) return;
    if (link.type === "url") {
      window.open(link.target, "_blank", "noopener,noreferrer");
      return;
    }
    if (link.type === "dashboard") {
      dispatch(setActiveDashboard(link.target));
      return;
    }
    if (link.type === "module") {
      const context = findModuleContext(link.target);
      if (context) {
        dispatch(setActiveDashboard(context.dashboardId));
      }
    }
  };

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // default to https if no scheme provided
    return `https://${trimmed}`;
  };

  const handleSaveLink = () => {
    if (!linkTodoId) return;
    const label = linkForm.label.trim().slice(0, labelLimit);
    let linkPayload: { type: TodoLinkType; target: string; label?: string } | null = null;

    if (linkForm.type === "url") {
      const normalized = normalizeUrl(linkForm.url);
      if (!isValidUrl(normalized)) return;
      linkPayload = { type: "url", target: normalized, label: label || undefined };
    } else if (linkForm.type === "dashboard") {
      if (!linkForm.dashboardId) return;
      linkPayload = { type: "dashboard", target: linkForm.dashboardId, label: label || undefined };
    } else if (linkForm.type === "module") {
      if (!linkForm.moduleId) return;
      linkPayload = { type: "module", target: linkForm.moduleId, label: label || undefined };
    }

    dispatch(setTodoLink({ id: linkTodoId, link: linkPayload }));
    closeLinkSheet();
  };

  const handleRemoveLink = () => {
    if (!linkTodoId) return;
    dispatch(setTodoLink({ id: linkTodoId, link: null }));
    closeLinkSheet();
  };

  const canSaveLink = (() => {
    if (linkForm.type === "url") {
      const normalized = normalizeUrl(linkForm.url);
      return isValidUrl(normalized);
    }
    if (linkForm.type === "dashboard") {
      return Boolean(linkForm.dashboardId);
    }
    if (linkForm.type === "module") {
      return Boolean(linkForm.moduleId);
    }
    return false;
  })();

  return (
    <div className="relative h-full flex flex-col">
      {/* Todos List - Scrollable */}
      <div className="flex-1 overflow-auto pb-20 px-4 pt-4">
        {orderedTodos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-gray-500">
            <p className="text-lg">No items yet. Click the + button to add one!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-5">
                {orderedTodos.map((todo) => (
                  <SortableTodoCard
                    key={todo.id}
                    todo={todo}
                    onCardClick={
                      isEditing(todo.id)
                        ? undefined
                        : () => handleTodoClick(todo.id)
                    }
                    onDelete={handleDeleteTodo}
                    onEditStart={() => handleStartEdit(todo.id, todo.description)}
                    isEditing={isEditing(todo.id)}
                    editValue={editingText}
                    onEditChange={(value) => {
                      if (value.length <= MAX_GOAL_DESCRIPTION_LENGTH) {
                        setEditingText(value);
                      }
                    }}
                    onEditSave={handleSaveEdit}
                    onEditCancel={handleCancelEdit}
                    onToggleDetails={() => setShowDetails(!showDetails)}
                    showDetails={showDetails}
                    linkLabel={getLinkLabel(todo.link)}
                    linkType={todo.link?.type}
                    hasLink={Boolean(todo.link)}
                    onLinkClick={() => handleLinkNavigate(todo)}
                    onLinkEdit={() => openLinkSheet(todo)}
                    actionSlot={
                      isEditing(todo.id)
                        ? null
                        : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteTodo(todo.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            aria-label="Mark item done"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      {/* Bottom Section - Button and Input */}
      {showInput && (
        <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-b from-transparent to-white pointer-events-none z-10"></div>
      )}
      <div className="absolute bottom-0 right-0 p-4 flex items-end justify-end gap-2 z-20">
        {/* Item Creation Input - Shown when + button is clicked */}
        {showInput && (
          <div className="flex gap-2 transition-all duration-200 flex-1 max-w-[calc(100%-3rem)]">
            <div className="flex-1 min-w-0 relative">
              <input
                ref={inputRef}
                type="text"
                value={newTodoText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_GOAL_DESCRIPTION_LENGTH) {
                    setNewTodoText(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add a new item..."
                maxLength={MAX_GOAL_DESCRIPTION_LENGTH}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                aria-label="Add a new item"
              />
              <div className="absolute bottom-0 right-0 text-xs text-gray-400 mb-1 mr-2">
                {MAX_GOAL_DESCRIPTION_LENGTH - newTodoText.length}
              </div>
            </div>
            <button
              onClick={handleCreateTodo}
              disabled={newTodoText.trim() === ""}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                newTodoText.trim() === ""
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              aria-label="Add item"
            >
              Add
            </button>
          </div>
        )}
        
        {/* Circular Add Button - Bottom Right */}
        <button
          onClick={handleToggleInput}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 ${
            showInput
              ? "bg-gray-400 hover:bg-gray-500 text-white rotate-45"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          aria-label={showInput ? "Cancel" : "Add new item"}
          title={showInput ? "Cancel" : "Add new item"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </button>
      </div>

      {linkSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4" onClick={closeLinkSheet}>
          <div
            className="w-full max-w-xl bg-white rounded-t-2xl shadow-xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attach a link</p>
                <h3 className="text-lg font-semibold">Link options</h3>
              </div>
              <button
                onClick={closeLinkSheet}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close link sheet"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2">
              {(["url", "dashboard", "module"] as TodoLinkType[]).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setLinkForm((prev) => ({
                      ...prev,
                      type,
                    }))
                  }
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                    linkForm.type === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {type === "url" ? "Hyperlink" : type === "dashboard" ? "Dashboard" : "Module"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Label (optional)
                </label>
                <input
                  value={linkForm.label}
                  onChange={(e) =>
                    setLinkForm((prev) => ({
                      ...prev,
                      label: e.target.value.slice(0, labelLimit),
                    }))
                  }
                  maxLength={labelLimit}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Shown on the chip"
                />
                <div className="text-xs text-gray-400 text-right mt-1">
                  {labelLimit - linkForm.label.length}
                </div>
              </div>

              {linkForm.type === "url" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">URL</label>
                  <input
                    value={linkForm.url}
                    onChange={(e) =>
                      setLinkForm((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Link URL"
                  />
                  <p className="text-xs text-gray-500 mt-1">If no scheme is provided, https:// is assumed.</p>
                </div>
              )}

              {linkForm.type === "dashboard" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Dashboard</label>
                  <select
                    value={linkForm.dashboardId}
                    onChange={(e) =>
                      setLinkForm((prev) => ({
                        ...prev,
                        dashboardId: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {dashboardList.map((dash) => (
                      <option key={dash.id} value={dash.id}>
                        {dash.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {linkForm.type === "module" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Module</label>
                  <select
                    value={linkForm.moduleId}
                    onChange={(e) =>
                      setLinkForm((prev) => ({
                        ...prev,
                        moduleId: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a module</option>
                    {moduleOptions.map((mod) => (
                      <option key={mod.moduleId} value={mod.moduleId}>
                        {mod.displayName} — {mod.dashboardName}
                      </option>
                    ))}
                  </select>
                  {moduleOptions.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No Timer modules available to link.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRemoveLink}
                className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-300"
                disabled={!linkTodoId || !todos.find((t) => t.id === linkTodoId)?.link}
              >
                Remove link
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeLinkSheet}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLink}
                  disabled={!canSaveLink}
                  className={`px-4 py-2 rounded-lg text-white ${
                    canSaveLink
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

