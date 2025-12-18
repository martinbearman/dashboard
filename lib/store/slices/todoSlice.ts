import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/**
 * Priority levels for todos
 */
export type TodoPriority = 'low' | 'medium' | 'high' | null

export type TodoLinkType = 'url' | 'dashboard' | 'module'

export interface TodoLink {
  type: TodoLinkType
  target: string
  label?: string
}

/**
 * Session Interface - represents an individual Pomodoro session for a todo
 */
export interface TodoSession {
  id: string
  todoId: string
  sessionDate: number
  duration: number  // Duration in seconds
  completed: boolean
}

/**
 * Todo Interface - represents a task/todo item
 */
export interface Todo {
  id: string
  listId: string            // The list this todo belongs to, default is DEFAULT_LIST_ID
  description: string
  completed: boolean
  createdAt: number
  priority: TodoPriority
  dueDate: number | null  // Timestamp, null if no due date
  // Timer-related fields
  totalTimeStudied: number  // Total time spent (in seconds) across all sessions
  sessions: TodoSession[]    // Array of Pomodoro sessions for this todo
  isActiveGoal: boolean     // Whether this todo is currently being timed
  link?: TodoLink | null    // Optional single link attached to the todo
}

/**
 * Todo State Interface
 */

const DEFAULT_TODO_LIST_ID = 'default'

export interface TodoState {
  todosByList: Record<string, Todo[]>
}

/**
 * Initial state groups todos by list id.
 * Currently we start with a single empty default list.
 */
const initialState: TodoState = {
  todosByList: {
    [DEFAULT_TODO_LIST_ID]: [],
  },
}

/**
 * Returns every todo across all lists as a single array.
 * Useful for cross-list operations such as global searches or filters.
 */
const getAllTodos = (state: TodoState): Todo[] => {
  return Object.values(state.todosByList).flat()
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // Create a new todo
    /**
     * Creates a new todo item, optionally in a specific list and optionally
     * marking it as the currently active goal for timing.
     *
     * - If `listId` is omitted, the todo is added to the default list.
     * - If `setAsActive` is true, all other todos across all lists are cleared
     *   as active goals and this new todo becomes the only active one.
     */
    createTodo: (state, action: PayloadAction<{
      listId?: string // optional for backwards compatibility
      description: string
      priority?: TodoPriority
      dueDate?: number | null
      setAsActive?: boolean  // Optionally set this todo as the active goal
    }>) => {
      // Get the target list id
      const targetListId = action.payload.listId ?? DEFAULT_TODO_LIST_ID
      // If setting as active, clear all other active goals first (across all lists)
      if (action.payload.setAsActive) {
        getAllTodos(state).forEach(todo => {
          todo.isActiveGoal = false
        })
      }
      
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        listId: targetListId,
        description: action.payload.description,
        completed: false,
        createdAt: Date.now(),
        priority: action.payload.priority ?? null,
        dueDate: action.payload.dueDate ?? null,
        // Timer-related fields initialized
        totalTimeStudied: 0,
        sessions: [],
        isActiveGoal: action.payload.setAsActive ?? false,
        link: null,
      }
      if (!state.todosByList[targetListId]) {
        state.todosByList[targetListId] = []
      }
      state.todosByList[targetListId].push(newTodo)
    },
    /**
     * Toggles the `completed` flag for the specified todo id, searching across all lists.
     */
    toggleTodo: (state, action: PayloadAction<string>) => {
      // Search across all lists to find the todo
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    /**
     * Updates the description text for a given todo.
     */
    updateTodo: (state, action: PayloadAction<{ id: string; description: string }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.description = action.payload.description
      }
    },
    /**
     * Sets or clears the single link for a todo.
     */
    setTodoLink: (state, action: PayloadAction<{ id: string; link: TodoLink | null }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.link = action.payload.link
      }
    },
    /**
     * Sets the priority level for a given todo.
     */
    updateTodoPriority: (state, action: PayloadAction<{ id: string; priority: TodoPriority }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.priority = action.payload.priority
      }
    },
    /**
     * Sets or clears the due date for a given todo.
     *
     * Use `null` for `dueDate` to remove the due date.
     */
    updateTodoDueDate: (state, action: PayloadAction<{ id: string; dueDate: number | null }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.dueDate = action.payload.dueDate
      }
    },
    /**
     * Marks exactly one todo as the active goal for timing.
     * All other todos across all lists are cleared as active.
     */
    setActiveGoal: (state, action: PayloadAction<string>) => {
      // Clear all active goals first (across all lists)
      getAllTodos(state).forEach(todo => {
        todo.isActiveGoal = false
      })
      // Set the specified todo as active
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.isActiveGoal = true
      }
    },
    /**
     * Clears the `isActiveGoal` flag from every todo in every list.
     */
    clearActiveGoal: (state) => {
      getAllTodos(state).forEach(todo => {
        todo.isActiveGoal = false
      })
    },
    /**
     * Appends a completed (or interrupted) Pomodoro session record to a todo
     * and increments its total accumulated study time.
     */
    completeSession: (state, action: PayloadAction<{ 
      todoId: string
      duration: number  // Duration in seconds
      completed: boolean 
    }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(t => t.id === action.payload.todoId)
      if (!todo) return
      
      // Create session record
      const newSession: TodoSession = {
        id: crypto.randomUUID(),
        todoId: action.payload.todoId,
        sessionDate: Date.now(),
        duration: action.payload.duration,
        completed: action.payload.completed
      }
      todo.sessions.push(newSession)
      
      // Update total time studied
      todo.totalTimeStudied += action.payload.duration
    },
    /**
     * Removes a todo from whichever list currently contains it.
     */
    deleteTodo: (state, action: PayloadAction<string>) => {
      // Find which list contains this todo
      for (const listId in state.todosByList) {
        const list = state.todosByList[listId]
        const index = list.findIndex(todo => todo.id === action.payload)
        if (index !== -1) {
          list.splice(index, 1)
          break
        }
      }
    },
    /**
     * Replaces the current state with todos loaded from storage.
     *
     * - Performs a light migration: any todo missing `listId` is assigned
     *   to the default list.
     * - Normalizes incoming todos into the `todosByList` map structure.
     */
    loadTodos: (state, action: PayloadAction<Todo[]>) => {
      // Migration: if todos don't have listId, assign them to default list
      const todosWithListId = action.payload.map(todo => {
        if (!todo.listId) {
          return { ...todo, listId: DEFAULT_TODO_LIST_ID }
        }
        // Ensure link field exists for older saves
        return { ...todo, link: todo.link ?? null }
      })
      
      // Group todos by listId
      const todosByList: Record<string, Todo[]> = {}
      todosWithListId.forEach(todo => {
        if (!todosByList[todo.listId]) {
          todosByList[todo.listId] = []
        }
        todosByList[todo.listId].push(todo)
      })
      
      state.todosByList = todosByList
    },
    /**
     * Reorders todos within a single list, based on drag-and-drop operations.
     * The relative order of todos in the array is treated as the canonical ordering.
     */
    reorderTodosInList: (
      state,
      action: PayloadAction<{ listId: string; activeId: string; overId: string }>
    ) => {
      const { listId, activeId, overId } = action.payload
      const list = state.todosByList[listId]
      if (!list) return

      const oldIndex = list.findIndex(todo => todo.id === activeId)
      const newIndex = list.findIndex(todo => todo.id === overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return
      }

      const [moved] = list.splice(oldIndex, 1)
      list.splice(newIndex, 0, moved)
    },
  }
})

// Slice action creators expose core todo behaviors used throughout the app.
export const { 
  createTodo, 
  toggleTodo, 
  updateTodo, 
  updateTodoPriority,
  updateTodoDueDate,
  setTodoLink,
  setActiveGoal,
  clearActiveGoal,
  completeSession,
  deleteTodo, 
  loadTodos,
  reorderTodosInList,
} = todoSlice.actions
export default todoSlice.reducer

/**
 * Selectors for querying todo data subsets (all, incomplete-only, completed-only).
 * These keep filtering logic centralized so modules can consume the precise view they need.
 */

/**
 * Returns every todo across every list as a flat array.
 * Most other selectors build on top of this.
 */
export const selectTodos = (state: RootState) => getAllTodos(state.todo)
/**
 * Returns only todos that are not completed, across all lists.
 */
export const selectIncompleteTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => !todo.completed)
)
/**
 * Returns only todos that are completed, across all lists.
 */
export const selectCompletedTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => todo.completed)
)

/**
 * Per-list selectors - filter todos by specific listId
 */
/**
 * Returns all todos for a specific list id, or an empty array if the list does not exist.
 */
export const selectTodosByListId = (state: RootState, listId: string): Todo[] => {
  return state.todo.todosByList[listId] ?? []
}

/**
 * Returns only the incomplete todos for a given list id.
 */
export const selectIncompleteTodosByListId = createSelector(
  [(state: RootState) => state.todo.todosByList, (_: RootState, listId: string) => listId],
  (todosByList, listId) => {
    const todos = todosByList[listId] ?? []
    return todos.filter(todo => !todo.completed)
  }
)

/**
 * Returns only the completed todos for a given list id.
 */
export const selectCompletedTodosByListId = createSelector(
  [(state: RootState) => state.todo.todosByList, (_: RootState, listId: string) => listId],
  (todosByList, listId) => {
    const todos = todosByList[listId] ?? []
    return todos.filter(todo => todo.completed)
  }
)

/**
 * Master completed selector - all completed todos across all lists
 */
/**
 * Returns every completed todo, regardless of which list it belongs to.
 */
export const selectAllCompletedTodos = createSelector(
  [(state: RootState) => state.todo.todosByList],
  (todosByList) => {
    return Object.values(todosByList).flat().filter(todo => todo.completed)
  }
)
