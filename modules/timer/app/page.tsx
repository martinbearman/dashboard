'use client'

/**
 * Timer Module Main Component
 * 
 * This is the main component for the timer module.
 * State is automatically loaded from localStorage on store initialization.
 */

import TimerDisplay from './components/Timer/TimerDisplay';
import GoalInput from './components/Goal/GoalInput';
import GoalHistory from './components/Goal/GoalHistory';
import BreakSettings from './components/Settings/BreakSettings';

export default function TimerModulePage() {

  return (
    <div className="flex flex-col h-full">
      {/* Settings Header */}
      <div className="flex justify-end mb-3">
        <BreakSettings />
      </div>
      
      {/* Two-column layout: Timer on left, Goals on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        
        {/* Left Column - Timer */}
        <div className="card text-center flex flex-col min-h-0">
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <TimerDisplay />
          </div>
          <div className="mt-4">
            <GoalInput />
          </div>
        </div>

        {/* Right Column - Goals */}
        <div className="flex flex-col min-h-0">
          <div className="card bg-gray-50 flex-1 overflow-auto">
            <GoalHistory />
          </div>
        </div>

      </div>
    </div>
  )
}

