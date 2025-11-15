'use client'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useState } from 'react';
import { createGoal, clearCurrentGoal, completeSession } from '../../../store/slices/goalSlice';
import { start, pause, reset, skipBreak } from '../../../store/slices/timerSlice';

export default function GoalInput() {
  const dispatch = useAppDispatch();
  const [goalText, setGoalText] = useState('');
  const isRunning = useAppSelector(state => state.timer.isRunning);
  const timeRemaining = useAppSelector(state => state.timer.timeRemaining)
  const studyDuration = useAppSelector(state => state.timer.studyDuration);
  const isBreak = useAppSelector(state => state.timer.isBreak);
  
  // Get current goal using currentGoalId
  const currentGoalId = useAppSelector(state => state.goal.currentGoalId);
  const currentGoal = useAppSelector(state => 
    state.goal.goals.find(goal => goal.id === currentGoalId)
  );
  // Check if the button is disabled based on the current state
  const isButtonDisabled = !currentGoal && goalText.trim() === '';

  // Handle skip break
  const handleSkipBreak = () => {
    dispatch(skipBreak());
  };
  // Start a new session
  const handleStartSession = () => {
    dispatch(createGoal(goalText));  // Just pass the description
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
    //const state = store.getState();
    const elapsedTime = studyDuration - timeRemaining;
    
    dispatch(completeSession({
      duration: elapsedTime,
      completed: true
    }))
    
    dispatch(clearCurrentGoal())
    dispatch(reset())
    console.log("handleSaveForLater called");
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
          <p className="text-3xl text-red-600">{currentGoal.goalDescription}</p>
        )}
      </div>

      {/* Goal Input Section */}
      <div>
        {!currentGoal && (
          <input
            id="goal-input"
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your next goal..."
            aria-label="Enter your next goal"
            className="py-5 text-xl block w-full my-4"
          />
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={getButtonClickHandler()}
            disabled={isButtonDisabled}
            className={`disabled:text-gray-500 disabled:bg-red-100 flex-1 px-6 py-3 font-semibold rounded-lg text-white transition-colors ${
              currentGoal && !isRunning && timeRemaining !== 0 
                ? 'bg-green-600 hover:bg-green-400' 
                : 'bg-red-500 hover:bg-red-600'
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