import { createListenerMiddleware } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store/store'
import { setTimeRemaining, showBreakPrompt, startBreak, updateElapsedTime, toggleMode, DEFAULT_TIMER_ID } from './slices/timerSlice'
import { completeSession } from '@/lib/store/slices/todoSlice'

// Create the middleware instance
export const timerListenerMiddleware = createListenerMiddleware()

// Helper to get all todos (same as in todoSlice)
const getAllTodos = (todoState: { todosByList: Record<string, any[]> }) => {
  return Object.values(todoState.todosByList).flat();
};

// Add a listener for the setTimeRemaining action (fires every second when timer is running)
timerListenerMiddleware.startListening({
  actionCreator: setTimeRemaining,  // Listen for the setTimeRemaining action
  
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    
    // Extract timerId and seconds from action payload
    const { timerId, seconds } = action.payload
    
    // Get the specific timer instance
    const timer = state.timer.timers[timerId]
    if (!timer) return // Timer doesn't exist, ignore
    
    // Check if timer reached 0 and we have an active goal
    const activeTodo = getAllTodos(state.todo).find(todo => todo.isActiveGoal);
    if (activeTodo && seconds === 0 && timer.isRunning) {
      // Calculate actual elapsed time (duration - time remaining)
      const totalDuration = timer.isBreak ? timer.breakDuration : timer.studyDuration;
      const elapsedTime = totalDuration - seconds; // seconds is 0 when timer completes
      
      // Update the elapsed time in state
      listenerApi.dispatch(updateElapsedTime({ timerId, elapsed: elapsedTime }));

      // Timer completed - record the session if it was a study session
      if (!timer.isBreak) {
        listenerApi.dispatch(completeSession({
          todoId: activeTodo.id,
          duration: elapsedTime,
          completed: true
        }))
        // State is automatically persisted to localStorage via middleware
      }

      // Handle break flow based on break mode
      if (!timer.isBreak) {
        // Study session just ended
        if (timer.breakMode === 'automatic') {
          // Automatically start break
          listenerApi.dispatch(startBreak(timerId))
        } else if (timer.breakMode === 'manual') {
          // Show break prompt
          listenerApi.dispatch(showBreakPrompt(timerId))
        }
        // If breakMode is 'none', do nothing - user manually starts next session
      } else {
        // Break just ended - return to study mode
        listenerApi.dispatch(toggleMode(timerId))
      }
    }
  },
})