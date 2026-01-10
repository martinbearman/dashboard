import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Timer State Interface
 * 
 * Stores multiple timer instances keyed by timer ID
 */
export interface TimerState {
  timers: Record<string, TimerInstance>
}

/**
 * Timer Instance Interface
 * 
 * Represents a single timer instance with its state and configuration.
 * This will replace the old single TimerState structure.
 */
export interface TimerInstance {
  id: string
  name?: string  // Optional display name
  type: 'pomodoro' | 'reminder' | 'cooking' | 'custom'  // Timer type for standardized interface
  
  // Simple inline link properties (we'll migrate to centralized links later)
  linkedToEntityType?: 'todoList' | 'todoItem' | 'module' | null
  linkedToEntityId?: string
  
  // Timer state fields (existing functionality)
  timeRemaining: number
  isRunning: boolean
  isBreak: boolean
  studyDuration: number
  breakDuration: number
  studyElapsedTime: number
  breakElapsedTime: number
  showBreakPrompt: boolean
  breakMode: 'automatic' | 'manual' | 'none'
}

/**
 * Default Timer ID
 * 
 * The ID for the primary/default timer instance used by the timer module.
 * This is the timer that will be automatically created and used when the
 * module loads.
 */
export const DEFAULT_TIMER_ID = 'default'

/**
 * Default timer instance values (without id)
 * 
 * These values are used when creating a new timer instance.
 * Also exported for use as fallback values in selectors.
 */
export const DEFAULT_TIMER_VALUES: Omit<TimerInstance, 'id'> = {
  name: undefined,
  type: 'pomodoro',
  linkedToEntityType: null,
  linkedToEntityId: undefined,
  timeRemaining: 1500,  // 25 minutes in seconds
  isRunning: false,
  isBreak: false,
  studyDuration: 1500,  // 25 minutes
  breakDuration: 420,   // 7 minutes
  studyElapsedTime: 0,
  breakElapsedTime: 0,
  showBreakPrompt: false,
  breakMode: 'manual'   // Default to manual break control
}

/**
 * Create a default timer instance
 * 
 * Helper function to create a new timer instance with default values.
 */
export const createDefaultTimerInstance = (
  id: string,
  options?: {
    name?: string
    type?: TimerInstance['type']
    linkedToEntityType?: 'todoList' | 'todoItem' | 'module' | null
    linkedToEntityId?: string
  }
): TimerInstance => ({
  id,
  ...DEFAULT_TIMER_VALUES,
  ...options,
})

/**
 * Initial State
 * 
 * Start with an empty record - timers will be created on demand
 */
export const createInitialTimerState = (): TimerState => ({
  timers: {}
})

const initialState: TimerState = createInitialTimerState();


/**
 * Helper function to get a timer by ID, throwing if not found
 */
const getTimer = (state: TimerState, timerId: string): TimerInstance => {
  const timer = state.timers[timerId]
  if (!timer) {
    throw new Error(`Timer with id "${timerId}" not found`)
  }
  return timer
}

/**
 * Timer Slice
 * 
 * A "slice" is a collection of Redux reducer logic and actions
 * for a single feature. This slice handles all timer-related state.
 * 
 * Redux Toolkit automatically generates action creators for each reducer!
 */
const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {

    /**
    * Create a new timer instance
    */
    createTimer: (state, action: PayloadAction<{
      id: string
      name?: string
      type?: TimerInstance['type']
      linkedToEntityType?: 'todoList' | 'todoItem' | 'module' | null
      linkedToEntityId?: string
    }>) => {
      const { id, name, type, linkedToEntityType, linkedToEntityId } = action.payload
      
      // Don't overwrite existing timer
      if (state.timers[id]) {
        return
      }
      
      state.timers[id] = createDefaultTimerInstance(id, { 
        name, 
        type, 
        linkedToEntityType, 
        linkedToEntityId 
      })
    },

    /**
    * Update timer name
    */
    updateTimerName: (state, action: PayloadAction<{
      timerId: string
      name: string | undefined
    }>) => {
      const timer = getTimer(state, action.payload.timerId)
      timer.name = action.payload.name
    },

    /**
     * Update timer link configuration
     */
    updateTimerLink: (state, action: PayloadAction<{
      timerId: string
      linkedToEntityType?: 'todoList' | 'todoItem' | 'module' | null
      linkedToEntityId?: string
    }>) => {
      const timer = getTimer(state, action.payload.timerId)
      if (action.payload.linkedToEntityType !== undefined) {
        timer.linkedToEntityType = action.payload.linkedToEntityType
      }
      if (action.payload.linkedToEntityId !== undefined) {
        timer.linkedToEntityId = action.payload.linkedToEntityId
      }
    },

    /**
    * Start the timer
    */
    start: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isRunning = true
    },

    /**
     * Pause the timer
     */
    pause: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isRunning = false
    },

    /**
     * Reset timer to initial duration
     */
    reset: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isRunning = false
      timer.timeRemaining = timer.isBreak ? timer.breakDuration : timer.studyDuration
    },

    /**
     * Stop the timer
     */
    stop: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isRunning = false
    },

    /**
     * Delete the timer
     */
    deleteTimer: (state, action: PayloadAction<string>) => {
      delete state.timers[action.payload]
    },

    /**
     * Switch between study and break modes
     */
    toggleMode: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isBreak = !timer.isBreak
      timer.timeRemaining = timer.isBreak ? timer.breakDuration : timer.studyDuration
      timer.isRunning = false
    },

    /**
     * Update study duration
     * Payload is the new duration in minutes
     */
    setStudyDuration: (state, action: PayloadAction<{ timerId: string, minutes: number }>) => {
      const timer = getTimer(state, action.payload.timerId)
      const seconds = action.payload.minutes * 60
      timer.studyDuration = seconds
      // Update current time if we're in study mode and not running
      if (!timer.isBreak && !timer.isRunning) {
        timer.timeRemaining = seconds
      }
    },

    /**
     * Update break duration
     * Payload is the new duration in minutes
     */
    setBreakDuration: (state, action: PayloadAction<{timerId: string, minutes: number}>) => {
      const timer = getTimer(state, action.payload.timerId)

      const seconds = action.payload.minutes * 60
      timer.breakDuration = seconds
      // Update current time if we're in break mode and not running
      if (timer.isBreak && !timer.isRunning) {
        timer.timeRemaining = seconds
      }
    },

    setTimeRemaining: (state, action: PayloadAction<{ timerId: string, seconds: number }>) => {
      const timer = getTimer(state, action.payload.timerId)
      timer.timeRemaining = action.payload.seconds
    },

    /**
     * Update elapsed time for the current session type
     */
    updateElapsedTime: (state, action: PayloadAction<{ timerId: string, elapsed: number }>) => {
      const timer = getTimer(state, action.payload.timerId)
      if (timer.isBreak) {
        timer.breakElapsedTime = action.payload.elapsed
      } else {
        timer.studyElapsedTime = action.payload.elapsed
      }
    },

    /**
     * Reset elapsed times (useful when starting a new day/session)
     */
    resetElapsedTimes: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.studyElapsedTime = 0
      timer.breakElapsedTime = 0
    },

    /**
     * Show break prompt when study session ends
     */
    showBreakPrompt: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.showBreakPrompt = true
      timer.isRunning = false
    },

    /**
     * Hide break prompt
     */
    hideBreakPrompt: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.showBreakPrompt = false
    },

    /**
     * Start break timer
     */
    startBreak: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isBreak = true
      timer.timeRemaining = timer.breakDuration
      timer.showBreakPrompt = false
      timer.isRunning = true
    },

    /**
     * Skip break and return to study mode
     */
    skipBreak: (state, action: PayloadAction<string>) => {
      const timer = getTimer(state, action.payload)
      timer.isBreak = false
      timer.timeRemaining = timer.studyDuration
      timer.showBreakPrompt = false
      timer.isRunning = false
    },

    /**
     * Set break mode preference
     */
    setBreakMode: (state, action: PayloadAction<{ timerId: string, mode: 'automatic' | 'manual' | 'none' }>) => {
      const timer = getTimer(state, action.payload.timerId)
      timer.breakMode = action.payload.mode
    },
  },
})

// Export actions to use in components
export const { 
  createTimer,      
  deleteTimer,      
  updateTimerLink,
  updateTimerName,
  start, 
  pause, 
  reset, 
  stop,
  toggleMode, 
  setStudyDuration, 
  setBreakDuration,
  setTimeRemaining,
  updateElapsedTime,
  resetElapsedTimes,
  showBreakPrompt,
  hideBreakPrompt,
  startBreak,
  skipBreak,
  setBreakMode
} = timerSlice.actions

// Export reducer to include in the store
export default timerSlice.reducer
