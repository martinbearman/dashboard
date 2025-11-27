import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/**
 * Priority levels for todos
 */
export type TodoPriority = 'low' | 'medium' | 'high' | null

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
}

/**
 * Todo State Interface
 */

const DEFAULT_TODO_LIST_ID = 'default'

export interface TodoState {
  todosByList: Record<string, Todo[]>
}

const initialState: TodoState = {
  todosByList: {
    [DEFAULT_TODO_LIST_ID]: [],
  },
}

const getAllTodos = (state: TodoState): Todo[] => {
  return Object.values(state.todosByList).flat()
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // Create a new todo
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
        isActiveGoal: action.payload.setAsActive ?? false
      }
      if (!state.todosByList[targetListId]) {
        state.todosByList[targetListId] = []
      }
      state.todosByList[targetListId].push(newTodo)
    },
    // Toggle todo completion status
    toggleTodo: (state, action: PayloadAction<string>) => {
      // Search across all lists to find the todo
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    // Update todo description
    updateTodo: (state, action: PayloadAction<{ id: string; description: string }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.description = action.payload.description
      }
    },
    // Update todo priority
    updateTodoPriority: (state, action: PayloadAction<{ id: string; priority: TodoPriority }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.priority = action.payload.priority
      }
    },
    // Update todo due date
    updateTodoDueDate: (state, action: PayloadAction<{ id: string; dueDate: number | null }>) => {
      const allTodos = getAllTodos(state)
      const todo = allTodos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.dueDate = action.payload.dueDate
      }
    },
    // Set a todo as the active goal (being timed)
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
    // Clear the active goal
    clearActiveGoal: (state) => {
      getAllTodos(state).forEach(todo => {
        todo.isActiveGoal = false
      })
    },
    // Record a Pomodoro session for a todo
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
    // Delete a todo
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
    // Load todos from storage
    loadTodos: (state, action: PayloadAction<Todo[]>) => {
      // Migration: if todos don't have listId, assign them to default list
      const todosWithListId = action.payload.map(todo => {
        if (!todo.listId) {
          return { ...todo, listId: DEFAULT_TODO_LIST_ID }
        }
        return todo
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
  }
})

// Slice action creators expose core todo behaviors used throughout the app.
export const { 
  createTodo, 
  toggleTodo, 
  updateTodo, 
  updateTodoPriority,
  updateTodoDueDate,
  setActiveGoal,
  clearActiveGoal,
  completeSession,
  deleteTodo, 
  loadTodos 
} = todoSlice.actions
export default todoSlice.reducer

/**
 * Selectors for querying todo data subsets (all, incomplete-only, completed-only).
 * These keep filtering logic centralized so modules can consume the precise view they need.
 */

export const selectTodos = (state: RootState) => getAllTodos(state.todo)
export const selectIncompleteTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => !todo.completed)
)
export const selectCompletedTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => todo.completed)
)

/**
 * Per-list selectors - filter todos by specific listId
 */
export const selectTodosByListId = (state: RootState, listId: string): Todo[] => {
  return state.todo.todosByList[listId] ?? []
}

export const selectIncompleteTodosByListId = createSelector(
  [(state: RootState) => state.todo.todosByList, (_: RootState, listId: string) => listId],
  (todosByList, listId) => {
    const todos = todosByList[listId] ?? []
    return todos.filter(todo => !todo.completed)
  }
)

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
export const selectAllCompletedTodos = createSelector(
  [(state: RootState) => state.todo.todosByList],
  (todosByList) => {
    return Object.values(todosByList).flat().filter(todo => todo.completed)
  }
)
