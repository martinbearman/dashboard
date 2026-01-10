'use client'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setBreakMode, setBreakDuration, DEFAULT_TIMER_ID, DEFAULT_TIMER_VALUES } from '../../../store/slices/timerSlice'
import type { ModuleConfigProps } from '@/lib/types/dashboard'

export default function TimerConfigPanel({ moduleId, config, onConfigChange }: ModuleConfigProps) {
  // Note: Break settings are stored in Redux timer slice, not module config
  // We accept config and onConfigChange for interface compliance but use Redux directly
  const dispatch = useAppDispatch()
  const { breakMode, breakDuration } = useAppSelector(state => state.timer.timers[DEFAULT_TIMER_ID] ?? DEFAULT_TIMER_VALUES)

  const handleBreakModeChange = (mode: 'automatic' | 'manual' | 'none') => {
    dispatch(setBreakMode({ timerId: DEFAULT_TIMER_ID, mode }))

  }

  const handleBreakDurationChange = (minutes: number) => {
    dispatch(setBreakDuration({ timerId: DEFAULT_TIMER_ID, minutes }))
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">Timer Settings</h3>
      
      {/* Break Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Break Mode
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="breakMode"
              value="automatic"
              checked={breakMode === 'automatic'}
              onChange={() => handleBreakModeChange('automatic')}
              className="mr-2"
            />
            <span className="text-sm">Automatic - Start break immediately</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="breakMode"
              value="manual"
              checked={breakMode === 'manual'}
              onChange={() => handleBreakModeChange('manual')}
              className="mr-2"
            />
            <span className="text-sm">Manual - Ask before starting break</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="breakMode"
              value="none"
              checked={breakMode === 'none'}
              onChange={() => handleBreakModeChange('none')}
              className="mr-2"
            />
            <span className="text-sm">None - No automatic breaks</span>
          </label>
        </div>
      </div>

      {/* Break Duration */}
      {breakMode !== 'none' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Break Duration (minutes)
          </label>
          <select
            value={Math.floor(breakDuration / 60)}
            onChange={(e) => handleBreakDurationChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={3}>3 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={7}>7 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
          </select>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {breakMode === 'automatic' && 'Breaks will start automatically after each study session.'}
        {breakMode === 'manual' && 'You\'ll be asked if you want to take a break after each study session.'}
        {breakMode === 'none' && 'No breaks will be suggested. You control when to start the next session.'}
      </div>
    </div>
  )
}

