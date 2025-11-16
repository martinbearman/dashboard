import { createListenerMiddleware } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store/store'
import { setTimeRemaining, showBreakPrompt, startBreak, updateElapsedTime } from './slices/timerSlice'
import { completeSession } from '@/lib/store/slices/todoSlice'

// Create the middleware instance
export const timerListenerMiddleware = createListenerMiddleware()

// Add a listener for the setTimeRemaining action (fires every second when timer is running)
timerListenerMiddleware.startListening({
  actionCreator: setTimeRemaining,  // Listen for the setTimeRemaining action
  
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    
    // Check if timer reached 0 and we have an active goal
    const activeTodo = state.todo.todos.find(todo => todo.isActiveGoal);
    if (activeTodo && action.payload === 0 && state.timer.isRunning) {
      // Calculate actual elapsed time (duration - time remaining)
      const totalDuration = state.timer.isBreak ? state.timer.breakDuration : state.timer.studyDuration;
      const elapsedTime = totalDuration - action.payload; // action.payload is 0 when timer completes
      
      // Update the elapsed time in state
      listenerApi.dispatch(updateElapsedTime(elapsedTime));

      // Timer completed - record the session if it was a study session
      if (!state.timer.isBreak) {
        listenerApi.dispatch(completeSession({
          todoId: activeTodo.id,
          duration: elapsedTime,
          completed: true
        }))
        // State is automatically persisted to localStorage via middleware
      }

      // Handle break flow based on break mode
      if (!state.timer.isBreak) {
        // Study session just ended
        if (state.timer.breakMode === 'automatic') {
          // Automatically start break
          listenerApi.dispatch(startBreak())
        } else if (state.timer.breakMode === 'manual') {
          // Show break prompt
          listenerApi.dispatch(showBreakPrompt())
        }
        // If breakMode is 'none', do nothing - user manually starts next session
      } else {
        // Break just ended - return to study mode
        listenerApi.dispatch({
          type: 'timer/toggleMode'
        })
      }
    }
  },
})