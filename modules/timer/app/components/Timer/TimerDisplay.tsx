'use client'

import { formatTime } from '../../../lib/utils'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { setTimeRemaining, pause, startBreak, skipBreak, hideBreakPrompt, updateElapsedTime } from '../../../store/slices/timerSlice'
import { useEffect, useRef, useCallback } from 'react'
import useSound from 'use-sound'
import Image from 'next/image'

export default function TimerDisplay() {
  const [playComplete, { stop }] = useSound('/sounds/timer-ring.mp3')
  const { timeRemaining, isRunning, studyDuration, breakDuration, isBreak, showBreakPrompt, breakMode } = useAppSelector(state => state.timer)
  const dispatch = useAppDispatch()
  const formattedTime = formatTime(timeRemaining)
  const startTimeRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(Date.now())

  const initializeStartTime = useCallback(() => {
    if (!startTimeRef.current) {
      const totalDuration = isBreak ? breakDuration : studyDuration
      startTimeRef.current = Date.now() - (totalDuration - timeRemaining) * 1000
    }
  }, [isBreak, breakDuration, studyDuration, timeRemaining])

  // Calculate elapsed time and update timer
  const updateTimer = useCallback(() => {
    if (!isRunning || !startTimeRef.current) return

    const now = Date.now()
    const elapsed = Math.floor((now - startTimeRef.current) / 1000)
    const totalDuration = isBreak ? breakDuration : studyDuration
    const newTimeRemaining = Math.max(0, totalDuration - elapsed)
    
    if (newTimeRemaining !== timeRemaining) {
      dispatch(setTimeRemaining(newTimeRemaining))
      // Update elapsed time in state
      dispatch(updateElapsedTime(elapsed))
    }

    // Stop timer if it reaches 0
    if (newTimeRemaining === 0 && isRunning) {
      dispatch(pause()) // Stop the timer
    }
  }, [isRunning, isBreak, breakDuration, studyDuration, timeRemaining, dispatch])

  // Update timer every second
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning) {
      // Set start time when timer starts
      initializeStartTime()

      intervalId = setInterval(updateTimer, 1000)
    } else {
      // Reset start time when timer stops
      startTimeRef.current = null
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning, initializeStartTime, updateTimer])

  // Handle visibility change to update timer when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning) {
        // Tab became visible, update timer immediately
        updateTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning, updateTimer])

  // Play sound when timer reaches 15 seconds
  // Specifically for timer-ring.mp3
  useEffect(() => {
    console.log('isRunning', isRunning);
    if(timeRemaining === 15 && isRunning) {
      playComplete()
    }
  }, [timeRemaining, playComplete, isRunning])

  // Stop sound when timer is paused
  useEffect(() => {
    if (!isRunning) {
      stop()
    }
  }, [isRunning, timeRemaining, stop])

  // Handle break prompt actions
  const handleStartBreak = () => {
    dispatch(startBreak())
  }

  const handleSkipBreak = () => {
    dispatch(skipBreak())
  }

  return (
    <div className="text-center">
      {/* Break Prompt Modal */}
      {showBreakPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Study Session Complete! 🎉</h3>
            <p className="text-gray-600 mb-6">Great work! Would you like to take a break?</p>
            <div className="space-y-3">
              <button
                onClick={handleStartBreak}
                className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Start {Math.floor(breakDuration / 60)}-min Break
              </button>
              <button
                onClick={handleSkipBreak}
                className="w-full px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Skip Break & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full flex flex-col items-center">
        <div className="relative" style={{ width: '120px', height: '120px' }}>
          <Image 
            src="/icons/tomato-too.svg" 
            alt="Timer" 
            width={120}
            height={120}
            style={{ objectFit: 'contain' }}
          />
          <p className="absolute text-2xl font-bold font-mono text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] pointer-events-none whitespace-nowrap z-10" style={{ top: '50%', left: 'calc(50% + 10px)', transform: 'translate(-50%, -50%)' }}>
            {formattedTime}
          </p>
        </div>
        <hr className="w-full border-t-[15px] mt-0" />
        
        {/* Break Mode Indicator */}
        {isBreak && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Break Time
          </div>
        )}
        
      </div>
      {/* Break Setting Display */}
      <div className="mt-4 text-sm text-gray-600 flex flex-col items-center gap-1">
        <p className="font-medium">Break: {Math.floor(breakDuration / 60)} min ({breakMode})</p>
      </div>
    </div>
  )
}