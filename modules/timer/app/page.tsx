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
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        
        {/* Settings Header */}
        <div className="flex justify-end mb-4">
          <BreakSettings />
        </div>
        
        {/* Two-column layout: Timer on left, Goals on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Timer */}
          <div className="card text-center">
            <div className="p-0">
              <TimerDisplay />
            </div>
            <div>
              <GoalInput />
            </div>
          </div>

          {/* Right Column - Goals */}
          <div className="space-y-6">
            <div className="card bg-gray-50">
              <GoalHistory />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

