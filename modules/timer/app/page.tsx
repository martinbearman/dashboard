'use client'

/**
 * Timer Module Main Component
 * 
 * This is the main component for the timer module.
 * State is automatically loaded from localStorage on store initialization.
 */

import TimerDisplay from './components/Timer/TimerDisplay';
import GoalInput from './components/Goal/GoalInput';
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { createTimer, DEFAULT_TIMER_ID } from '../store/slices/timerSlice'

export default function TimerModulePage() {

  const dispatch = useAppDispatch()
  const timers = useAppSelector(state => state.timer.timers)

  useEffect(() => {
    if (!timers[DEFAULT_TIMER_ID]) {
      dispatch(createTimer({ id: DEFAULT_TIMER_ID }))
    }
  }, [dispatch, timers])

  return (
    <div className="flex flex-col h-full">
      {/* Single column layout: Timer centered */}
      <div className="flex flex-col h-full">
        
        {/* Timer Section */}
        <div className="card text-center flex flex-col min-h-0 flex-1">
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <TimerDisplay />
          </div>
          <div className="mt-4">
            <GoalInput />
          </div>
        </div>

      </div>
    </div>
  )
}

