import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Timer State Interface
 * 
 * Defines the shape of our timer state.
 * This helps TypeScript catch errors and provides autocomplete.
 */
interface TimerState {
  timeRemaining: number      // Time left in seconds
  isRunning: boolean         // Is the timer currently counting down?
  isBreak: boolean          // Are we in break mode or study mode?
  studyDuration: number     // Study session length in seconds (default: 25 min)
  breakDuration: number     // Break length in seconds (default: 7 min)
  studyElapsedTime: number  // Time spent in study sessions (in seconds)
  breakElapsedTime: number  // Time spent in breaks (in seconds)
  showBreakPrompt: boolean  // Show break options when study session ends
  breakMode: 'automatic' | 'manual' | 'none'  // How breaks are handled
}

/**
 * Initial State
 * 
 * The starting values when the app loads.
 * 25 minutes = 1500 seconds
 * 7 minutes = 420 seconds
 */
export const createInitialTimerState = (): TimerState => ({
  timeRemaining: 1500,  // 25 minutes in seconds
  isRunning: false,
  isBreak: false,
  studyDuration: 1500,  // 25 minutes
  breakDuration: 420,   // 7 minutes
  studyElapsedTime: 0,  // No time elapsed initially
  breakElapsedTime: 0,  // No time elapsed initially
  showBreakPrompt: false,
  breakMode: 'manual'   // Default to manual break control
})

const initialState: TimerState = createInitialTimerState();

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
     * Start the timer
     */
    start: (state) => {
      state.isRunning = true;
    },

    /**
     * Pause the timer
     */
    pause: (state) => {
      state.isRunning = false
    },

    /**
     * Reset timer to initial duration
     */
    reset: (state) => {
      state.isRunning = false
      state.timeRemaining = state.isBreak ? state.breakDuration : state.studyDuration
    },


    /**
     * Stop the timer
     */
    stop: (state) => {
      state.isRunning = false
    },

    /**
     * Switch between study and break modes
     */
    toggleMode: (state) => {
      state.isBreak = !state.isBreak
      state.timeRemaining = state.isBreak ? state.breakDuration : state.studyDuration
      state.isRunning = false
    },

    /**
     * Update study duration
     * Payload is the new duration in minutes
     */
    setStudyDuration: (state, action: PayloadAction<number>) => {
      const seconds = action.payload * 60
      state.studyDuration = seconds
      // Update current time if we're in study mode and not running
      if (!state.isBreak && !state.isRunning) {
        state.timeRemaining = seconds
      }
    },

    /**
     * Update break duration
     * Payload is the new duration in minutes
     */
    setBreakDuration: (state, action: PayloadAction<number>) => {
      const seconds = action.payload * 60
      state.breakDuration = seconds
      // Update current time if we're in break mode and not running
      if (state.isBreak && !state.isRunning) {
        state.timeRemaining = seconds
      }
    },

    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload
    },

    /**
     * Update elapsed time for the current session type
     */
    updateElapsedTime: (state, action: PayloadAction<number>) => {
      if (state.isBreak) {
        state.breakElapsedTime = action.payload
      } else {
        state.studyElapsedTime = action.payload
      }
    },

    /**
     * Reset elapsed times (useful when starting a new day/session)
     */
    resetElapsedTimes: (state) => {
      state.studyElapsedTime = 0
      state.breakElapsedTime = 0
    },

    /**
     * Show break prompt when study session ends
     */
    showBreakPrompt: (state) => {
      state.showBreakPrompt = true
      state.isRunning = false
    },

    /**
     * Hide break prompt
     */
    hideBreakPrompt: (state) => {
      state.showBreakPrompt = false
    },

    /**
     * Start break timer
     */
    startBreak: (state) => {
      state.isBreak = true
      state.timeRemaining = state.breakDuration
      state.showBreakPrompt = false
      state.isRunning = true
    },

    /**
     * Skip break and return to study mode
     */
    skipBreak: (state) => {
      state.isBreak = false
      state.timeRemaining = state.studyDuration
      state.showBreakPrompt = false
      state.isRunning = false
    },

    /**
     * Set break mode preference
     */
    setBreakMode: (state, action: PayloadAction<'automatic' | 'manual' | 'none'>) => {
      state.breakMode = action.payload
    },
  },
})

// Export actions to use in components
export const { 
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
