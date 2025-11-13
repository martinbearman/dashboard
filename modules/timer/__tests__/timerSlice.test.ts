import { describe, it, expect } from 'vitest'
import timerReducer, { 
  start, 
  pause, 
  reset, 
  toggleMode,
  setStudyDuration,
  setBreakDuration,
  stop,
  setTimeRemaining,
  updateElapsedTime,
  resetElapsedTimes,
  showBreakPrompt,
  hideBreakPrompt,
  startBreak,
  skipBreak,
  setBreakMode
} from '../store/slices/timerSlice'

/**
 * Redux Slice Tests
 * 
 * These tests demonstrate how to test Redux reducers.
 * We test that actions properly update the state.
 */

describe('timerSlice', () => {
  const initialState = {
    timeRemaining: 1500,
    isRunning: false,
    isBreak: false,
    studyDuration: 1500,
    breakDuration: 420,
    studyElapsedTime: 0,
    breakElapsedTime: 0,
    showBreakPrompt: false,
    breakMode: 'manual' as const,
  }

  it('should return initial state', () => {
    expect(timerReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle start action', () => {
    const actual = timerReducer(initialState, start())
    expect(actual.isRunning).toBe(true)
  })

  it('should handle pause action', () => {
    const runningState = { ...initialState, isRunning: true }
    const actual = timerReducer(runningState, pause())
    expect(actual.isRunning).toBe(false)
  })

  it('should handle reset action', () => {
    const modifiedState = { 
      ...initialState, 
      timeRemaining: 500,
      isRunning: true 
    }
    const actual = timerReducer(modifiedState, reset())
    
    expect(actual.isRunning).toBe(false)
    expect(actual.timeRemaining).toBe(1500) // Reset to study duration
  })


  it('should handle toggleMode action', () => {
    const actual = timerReducer(initialState, toggleMode())
    
    expect(actual.isBreak).toBe(true)
    expect(actual.timeRemaining).toBe(420) // Break duration
    expect(actual.isRunning).toBe(false)
  })

  it('should handle setStudyDuration action', () => {
    const actual = timerReducer(initialState, setStudyDuration(30))
    
    expect(actual.studyDuration).toBe(1800) // 30 minutes in seconds
    expect(actual.timeRemaining).toBe(1800) // Updated since in study mode
  })

  it('should handle setBreakDuration action', () => {
    const breakState = { ...initialState, isBreak: true }
    const actual = timerReducer(breakState, setBreakDuration(10))
    
    expect(actual.breakDuration).toBe(600) // 10 minutes in seconds
    expect(actual.timeRemaining).toBe(600) // Updated since in break mode
  })

  it('should not update timeRemaining when setting study duration during break or while running', () => {
    const runningState = { ...initialState, isRunning: true }
    const actual = timerReducer(runningState, setStudyDuration(30))
    
    expect(actual.studyDuration).toBe(1800)
    expect(actual.timeRemaining).toBe(1500) // Should not update when running
  })

  it('should not update timeRemaining when setting break duration during study or while running', () => {
    const runningState = { ...initialState, isRunning: true }
    const actual = timerReducer(runningState, setBreakDuration(10))
    
    expect(actual.breakDuration).toBe(600)
    expect(actual.timeRemaining).toBe(1500) // Should not update when running
  })

  it('should handle stop action', () => {
    const runningState = { ...initialState, isRunning: true }
    const actual = timerReducer(runningState, stop())
    
    expect(actual.isRunning).toBe(false)
  })

  it('should handle setTimeRemaining action', () => {
    const actual = timerReducer(initialState, setTimeRemaining(100))
    
    expect(actual.timeRemaining).toBe(100)
  })

  it('should update study elapsed time when not in break mode', () => {
    const actual = timerReducer(initialState, updateElapsedTime(300))
    
    expect(actual.studyElapsedTime).toBe(300)
    expect(actual.breakElapsedTime).toBe(0)
  })

  it('should update break elapsed time when in break mode', () => {
    const breakState = { ...initialState, isBreak: true }
    const actual = timerReducer(breakState, updateElapsedTime(300))
    
    expect(actual.breakElapsedTime).toBe(300)
    expect(actual.studyElapsedTime).toBe(0)
  })

  it('should reset elapsed times', () => {
    const modifiedState = {
      ...initialState,
      studyElapsedTime: 1000,
      breakElapsedTime: 500
    }
    const actual = timerReducer(modifiedState, resetElapsedTimes())
    
    expect(actual.studyElapsedTime).toBe(0)
    expect(actual.breakElapsedTime).toBe(0)
  })

  it('should handle showBreakPrompt action', () => {
    const runningState = { ...initialState, isRunning: true }
    const actual = timerReducer(runningState, showBreakPrompt())
    
    expect(actual.showBreakPrompt).toBe(true)
    expect(actual.isRunning).toBe(false)
  })

  it('should handle hideBreakPrompt action', () => {
    const stateWithPrompt = { ...initialState, showBreakPrompt: true }
    const actual = timerReducer(stateWithPrompt, hideBreakPrompt())
    
    expect(actual.showBreakPrompt).toBe(false)
  })

  it('should handle startBreak action', () => {
    const promptState = { ...initialState, showBreakPrompt: true }
    const actual = timerReducer(promptState, startBreak())
    
    expect(actual.isBreak).toBe(true)
    expect(actual.timeRemaining).toBe(420)
    expect(actual.showBreakPrompt).toBe(false)
    expect(actual.isRunning).toBe(true)
  })

  it('should handle skipBreak action', () => {
    const promptState = { ...initialState, showBreakPrompt: true }
    const actual = timerReducer(promptState, skipBreak())
    
    expect(actual.isBreak).toBe(false)
    expect(actual.timeRemaining).toBe(1500)
    expect(actual.showBreakPrompt).toBe(false)
    expect(actual.isRunning).toBe(false)
  })

  it('should handle setBreakMode action', () => {
    const actual = timerReducer(initialState, setBreakMode('automatic'))
    
    expect(actual.breakMode).toBe('automatic')
  })

  it('should handle setBreakMode action with "none"', () => {
    const actual = timerReducer(initialState, setBreakMode('none'))
    
    expect(actual.breakMode).toBe('none')
  })
})

