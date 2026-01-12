import { describe, it, expect } from 'vitest'
import timerReducer, { 
  createTimer,
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
  setBreakMode,
  DEFAULT_TIMER_ID,
  createInitialTimerState
} from '../store/slices/timerSlice'

/**
 * Redux Slice Tests
 * 
 * These tests demonstrate how to test Redux reducers.
 * We test that actions properly update the state.
 */

describe('timerSlice', () => {
  const timerId = DEFAULT_TIMER_ID
  
  const createStateWithTimer = () => {
    const state = createInitialTimerState()
    return timerReducer(state, createTimer({ id: timerId }))
  }

  const getTimer = (state: ReturnType<typeof timerReducer>) => {
    return state.timers[timerId]!
  }

  it('should return initial state', () => {
    expect(timerReducer(undefined, { type: 'unknown' })).toEqual(createInitialTimerState())
  })

  it('should handle start action', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, start(timerId))
    expect(getTimer(actual).isRunning).toBe(true)
  })

  it('should handle pause action', () => {
    const state = createStateWithTimer()
    const runningState = timerReducer(state, start(timerId))
    const actual = timerReducer(runningState, pause(timerId))
    expect(getTimer(actual).isRunning).toBe(false)
  })

  it('should handle reset action', () => {
    const state = createStateWithTimer()
    const modifiedState = timerReducer(state, setTimeRemaining({ timerId, seconds: 500 }))
    const runningState = timerReducer(modifiedState, start(timerId))
    const actual = timerReducer(runningState, reset(timerId))
    
    expect(getTimer(actual).isRunning).toBe(false)
    expect(getTimer(actual).timeRemaining).toBe(1500) // Reset to study duration
  })


  it('should handle toggleMode action', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, toggleMode(timerId))
    
    expect(getTimer(actual).isBreak).toBe(true)
    expect(getTimer(actual).timeRemaining).toBe(420) // Break duration
    expect(getTimer(actual).isRunning).toBe(false)
  })

  it('should handle setStudyDuration action', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, setStudyDuration({ timerId, minutes: 30 }))
    
    expect(getTimer(actual).studyDuration).toBe(1800) // 30 minutes in seconds
    expect(getTimer(actual).timeRemaining).toBe(1800) // Updated since in study mode
  })

  it('should handle setBreakDuration action', () => {
    const state = createStateWithTimer()
    const breakState = timerReducer(state, toggleMode(timerId))
    const actual = timerReducer(breakState, setBreakDuration({ timerId, minutes: 10 }))
    
    expect(getTimer(actual).breakDuration).toBe(600) // 10 minutes in seconds
    expect(getTimer(actual).timeRemaining).toBe(600) // Updated since in break mode
  })

  it('should not update timeRemaining when setting study duration during break or while running', () => {
    const state = createStateWithTimer()
    const runningState = timerReducer(state, start(timerId))
    const actual = timerReducer(runningState, setStudyDuration({ timerId, minutes: 30 }))
    
    expect(getTimer(actual).studyDuration).toBe(1800)
    expect(getTimer(actual).timeRemaining).toBe(1500) // Should not update when running
  })

  it('should not update timeRemaining when setting break duration during study or while running', () => {
    const state = createStateWithTimer()
    const runningState = timerReducer(state, start(timerId))
    const actual = timerReducer(runningState, setBreakDuration({ timerId, minutes: 10 }))
    
    expect(getTimer(actual).breakDuration).toBe(600)
    expect(getTimer(actual).timeRemaining).toBe(1500) // Should not update when running
  })

  it('should handle stop action', () => {
    const state = createStateWithTimer()
    const runningState = timerReducer(state, start(timerId))
    const actual = timerReducer(runningState, stop(timerId))
    
    expect(getTimer(actual).isRunning).toBe(false)
  })

  it('should handle setTimeRemaining action', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, setTimeRemaining({ timerId, seconds: 100 }))
    
    expect(getTimer(actual).timeRemaining).toBe(100)
  })

  it('should update study elapsed time when not in break mode', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, updateElapsedTime({ timerId, elapsed: 300 }))
    
    expect(getTimer(actual).studyElapsedTime).toBe(300)
    expect(getTimer(actual).breakElapsedTime).toBe(0)
  })

  it('should update break elapsed time when in break mode', () => {
    const state = createStateWithTimer()
    const breakState = timerReducer(state, toggleMode(timerId))
    const actual = timerReducer(breakState, updateElapsedTime({ timerId, elapsed: 300 }))
    
    expect(getTimer(actual).breakElapsedTime).toBe(300)
    expect(getTimer(actual).studyElapsedTime).toBe(0)
  })

  it('should reset elapsed times', () => {
    const state = createStateWithTimer()
    const modifiedState = timerReducer(state, updateElapsedTime({ timerId, elapsed: 1000 }))
    const breakState = timerReducer(modifiedState, toggleMode(timerId))
    const stateWithBreakElapsed = timerReducer(breakState, updateElapsedTime({ timerId, elapsed: 500 }))
    const actual = timerReducer(stateWithBreakElapsed, resetElapsedTimes(timerId))
    
    expect(getTimer(actual).studyElapsedTime).toBe(0)
    expect(getTimer(actual).breakElapsedTime).toBe(0)
  })

  it('should handle showBreakPrompt action', () => {
    const state = createStateWithTimer()
    const runningState = timerReducer(state, start(timerId))
    const actual = timerReducer(runningState, showBreakPrompt(timerId))
    
    expect(getTimer(actual).showBreakPrompt).toBe(true)
    expect(getTimer(actual).isRunning).toBe(false)
  })

  it('should handle hideBreakPrompt action', () => {
    const state = createStateWithTimer()
    const promptState = timerReducer(state, showBreakPrompt(timerId))
    const actual = timerReducer(promptState, hideBreakPrompt(timerId))
    
    expect(getTimer(actual).showBreakPrompt).toBe(false)
  })

  it('should handle startBreak action', () => {
    const state = createStateWithTimer()
    const promptState = timerReducer(state, showBreakPrompt(timerId))
    const actual = timerReducer(promptState, startBreak(timerId))
    
    expect(getTimer(actual).isBreak).toBe(true)
    expect(getTimer(actual).timeRemaining).toBe(420)
    expect(getTimer(actual).showBreakPrompt).toBe(false)
    expect(getTimer(actual).isRunning).toBe(true)
  })

  it('should handle skipBreak action', () => {
    const state = createStateWithTimer()
    const promptState = timerReducer(state, showBreakPrompt(timerId))
    const actual = timerReducer(promptState, skipBreak(timerId))
    
    expect(getTimer(actual).isBreak).toBe(false)
    expect(getTimer(actual).timeRemaining).toBe(1500)
    expect(getTimer(actual).showBreakPrompt).toBe(false)
    expect(getTimer(actual).isRunning).toBe(false)
  })

  it('should handle setBreakMode action', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, setBreakMode({ timerId, mode: 'automatic' }))
    
    expect(getTimer(actual).breakMode).toBe('automatic')
  })

  it('should handle setBreakMode action with "none"', () => {
    const state = createStateWithTimer()
    const actual = timerReducer(state, setBreakMode({ timerId, mode: 'none' }))
    
    expect(getTimer(actual).breakMode).toBe('none')
  })
})

