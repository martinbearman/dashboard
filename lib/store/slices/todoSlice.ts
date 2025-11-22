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
export interface TodoState {
  todos: Todo[]
}

/**
 * Initial State
 */
const initialState: TodoState = {
  todos: []
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // Create a new todo
    createTodo: (state, action: PayloadAction<{
      description: string
      priority?: TodoPriority
      dueDate?: number | null
      setAsActive?: boolean  // Optionally set this todo as the active goal
    }>) => {
      // If setting as active, clear all other active goals first
      if (action.payload.setAsActive) {
        state.todos.forEach(todo => {
          todo.isActiveGoal = false
        })
      }
      
      const newTodo: Todo = {
        id: crypto.randomUUID(),
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
      state.todos.push(newTodo)
    },
    // Toggle todo completion status
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    // Update todo description
    updateTodo: (state, action: PayloadAction<{ id: string; description: string }>) => {
      const todo = state.todos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.description = action.payload.description
      }
    },
    // Update todo priority
    updateTodoPriority: (state, action: PayloadAction<{ id: string; priority: TodoPriority }>) => {
      const todo = state.todos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.priority = action.payload.priority
      }
    },
    // Update todo due date
    updateTodoDueDate: (state, action: PayloadAction<{ id: string; dueDate: number | null }>) => {
      const todo = state.todos.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.dueDate = action.payload.dueDate
      }
    },
    // Set a todo as the active goal (being timed)
    setActiveGoal: (state, action: PayloadAction<string>) => {
      // Clear all active goals first
      state.todos.forEach(todo => {
        todo.isActiveGoal = false
      })
      // Set the specified todo as active
      const todo = state.todos.find(todo => todo.id === action.payload)
      if (todo) {
        todo.isActiveGoal = true
      }
    },
    // Clear the active goal
    clearActiveGoal: (state) => {
      state.todos.forEach(todo => {
        todo.isActiveGoal = false
      })
    },
    // Record a Pomodoro session for a todo
    completeSession: (state, action: PayloadAction<{ 
      todoId: string
      duration: number  // Duration in seconds
      completed: boolean 
    }>) => {
      const todo = state.todos.find(t => t.id === action.payload.todoId)
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
      state.todos = state.todos.filter(todo => todo.id !== action.payload)
    },
    // Load todos from storage
    loadTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload
    }
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
export const selectTodos = (state: RootState) => state.todo.todos
export const selectIncompleteTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => !todo.completed)
)
export const selectCompletedTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => todo.completed)
)

