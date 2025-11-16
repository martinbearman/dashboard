'use client'

import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { formatTime, formatTimeStamp, isToday } from '../../../lib/utils'
import { setCurrentGoal } from '../../../store/slices/goalSlice'
import { setTimeRemaining } from '../../../store/slices/timerSlice'

export default function GoalHistory() {
  const goals = useAppSelector(state => state.goal.goals)
  const sessions = useAppSelector(state => state.goal.sessions)
  const currentGoalId = useAppSelector(state => state.goal.currentGoalId)
  const isRunning = useAppSelector(state => state.timer.isRunning)
  const studyDuration = useAppSelector(state => state.timer.studyDuration)
  const dispatch = useAppDispatch()

  const sortedGoals = [...goals].sort((a, b) => b.goalTimeStamp - a.goalTimeStamp)

  const handleGoalClick = (goalId: string) => {
    // Only allow switching if timer is NOT running
    if (!isRunning && goalId !== currentGoalId) {
      // Switch to this goal
      dispatch(setCurrentGoal(goalId))
      
      // Reset timer to full duration when switching goals
      dispatch(setTimeRemaining(studyDuration))
    }
  }

  // Count sessions per goal
  const getSessionCount = (goalId: string) => {
    return sessions.filter(s => s.goalId === goalId).length
  }

  return (
    <div>
      <h2 className='text-2xl mb-4'>Goal History</h2>
      {sortedGoals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">Set a goal to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGoals.map((goal, index) => (
            <div
              key={goal.id}
              onClick={() => handleGoalClick(goal.id)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                ${goal.id === currentGoalId
                  ? 'bg-red-100 border-red-300 shadow-md'  // Highlight current goal
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold text-lg ${goal.id === currentGoalId ? 'text-red-800' : 'text-gray-800'}`}>
                  {goal.goalDescription}
                </h3>
                {goal.id === currentGoalId && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Created</span>
                  <span className="text-gray-700" suppressHydrationWarning>
                    {formatTimeStamp(goal.goalTimeStamp)} {isToday(goal.goalTimeStamp) ? '(today)' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Time</span>
                  <span className="text-gray-700 font-medium">{formatTime(goal.totalTimeStudied)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sessions</span>
                  <span className="text-gray-700 font-medium">{getSessionCount(goal.id)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}