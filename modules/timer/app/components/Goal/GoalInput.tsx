'use client'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useState } from 'react';
import { createTodo, clearActiveGoal, completeSession } from '@/lib/store/slices/todoSlice';
import { start, pause, reset, skipBreak } from '../../../store/slices/timerSlice';

const MAX_GOAL_DESCRIPTION_LENGTH = 40;
const DISPLAY_MAX_LENGTH = 20;

export default function GoalInput() {
  const dispatch = useAppDispatch();
  const [goalText, setGoalText] = useState('');
  const isRunning = useAppSelector(state => state.timer.isRunning);
  const timeRemaining = useAppSelector(state => state.timer.timeRemaining)
  const studyDuration = useAppSelector(state => state.timer.studyDuration);
  const isBreak = useAppSelector(state => state.timer.isBreak);
  
  // Get current active todo (goal)
  const currentGoal = useAppSelector(state => {
    const allTodos = Object.values(state.todo.todosByList).flat();
    return allTodos.find(todo => todo.isActiveGoal);
  });
  
  // Check if the button is disabled based on the current state
  const isButtonDisabled = !currentGoal && goalText.trim() === '';
  const remainingChars = MAX_GOAL_DESCRIPTION_LENGTH - goalText.length;

  // Truncate description for display
  const getDisplayText = (text: string) => {
    if (text.length <= DISPLAY_MAX_LENGTH) {
      return text;
    }
    return text.slice(0, DISPLAY_MAX_LENGTH) + '...';
  };

  // Handle skip break
  const handleSkipBreak = () => {
    dispatch(skipBreak());
  };
  // Start a new session
  const handleStartSession = () => {
    // Create a new todo and set it as active goal
    dispatch(createTodo({ 
      description: goalText,
      setAsActive: true  // Set this todo as the active goal
    }));
    dispatch(reset());
    dispatch(start());
    setGoalText('');
    // State is automatically persisted to localStorage via middleware
  }
  // Pause the current session
  const handlePauseSession = () => {
    dispatch(pause());
  }
  // Resume the current session
  const handleResumeSession = () => {
    dispatch(start());
  }
  // Start a new session
  const handleStartNewSession = () => {
    dispatch(reset())
    dispatch(start())
  }
  // Get the button text based on the current state
  const handleGetButtonText = () => {
    if (isBreak) {
      return 'Skip Break';
    }
    if (isRunning) {
      return 'Pause';
    }
    if (currentGoal) {
      return timeRemaining === 0 ? 'Start New Session' : 'Resume'
    }
    return 'Start Study Session';
  }
  // Save the current session and start a new one
  const handleSaveForLater = () => {
    if (!currentGoal) return;
    
    const elapsedTime = studyDuration - timeRemaining;
    
    dispatch(completeSession({
      todoId: currentGoal.id,
      duration: elapsedTime,
      completed: true
    }))
    
    dispatch(clearActiveGoal())
    dispatch(reset())
  }

  // Get the button click handler based on the current state
  const getButtonClickHandler = () => {
    if (isBreak) {
      return handleSkipBreak;
    }
    if (isRunning) {
      return handlePauseSession;
    }
    if (currentGoal) {
      return timeRemaining === 0 ? handleStartNewSession : handleResumeSession;
    }
    return handleStartSession;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && goalText.trim() !== '') {
      handleStartSession();
    }
  }

  return (
     <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Current Goal Display */}
      <div className="text-center mt-4">
        {currentGoal && (
          <p className="text-3xl text-red-600">{getDisplayText(currentGoal.description)}</p>
        )}
      </div>

      {/* Goal Input Section */}
      <div>
        {!currentGoal && (
          <div className="relative">
            <input
              id="goal-input"
              type="text"
              value={goalText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_GOAL_DESCRIPTION_LENGTH) {
                  setGoalText(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your next goal..."
              aria-label="Enter your next goal"
              maxLength={MAX_GOAL_DESCRIPTION_LENGTH}
              className="py-5 px-4 text-xl text-center block w-full my-4"
            />
            <div className="absolute bottom-0 right-0 text-xs text-gray-400 mb-1 mr-2">
              {remainingChars}
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={getButtonClickHandler()}
            disabled={isButtonDisabled}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
              isButtonDisabled
                ? 'bg-red-100 text-gray-400 cursor-not-allowed'
                : `text-white ${
                    currentGoal && !isRunning && timeRemaining !== 0 
                      ? 'bg-green-600 hover:bg-green-400' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`
            }`}
          >
            {handleGetButtonText()}
          </button>
          
          {!isRunning && currentGoal && timeRemaining !== 0 && (
            <button 
              onClick={handleSaveForLater}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-400 transition-colors"
            >
              Save for Later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}