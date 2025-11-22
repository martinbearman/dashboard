import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import timerReducer from '../../store/slices/timerSlice'
import goalReducer from '../../store/slices/goalSlice'
import GoalHistory from '../../app/components/Goal/GoalHistory'
import type { RootState } from '@/lib/store/store'

/**
 * React Testing Library Examples
 * 
 * This test demonstrates how to test React components with:
 * - render() - renders components into a virtual DOM
 * - screen - queries elements by role, text, label, etc.
 * - fireEvent - simulates user interactions (clicks, typing, etc.)
 * - Provider - wraps components that need Redux store
 */

// Helper function to create a test store with pre-filled state
function createTestStore(initialState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      timer: timerReducer,
      goal: goalReducer,
    },
    preloadedState: initialState as any,
  })
}

describe('GoalHistory Component', () => {
  it('should render "Set a goal to get started!" when no goals exist', () => {
    const store = createTestStore()
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Query by text content (most user-friendly)
    expect(screen.getByText('Set a goal to get started!')).toBeInTheDocument()
  })

  it('should render the Goal History heading', () => {
    const store = createTestStore()
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Query by role (semantic HTML element)
    expect(screen.getByRole('heading', { name: /goal history/i })).toBeInTheDocument()
  })

  it('should display goals when they exist', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Learn TypeScript',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 1500,
          },
          {
            id: 'goal-2',
            goalDescription: 'Study React',
            goalTimeStamp: Date.now() - 1000,
            totalTimeStudied: 2700,
          },
        ],
        sessions: [],
        currentGoalId: null,
        totalStudyTime: 4200,
        totalSessions: 0,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Check that goal descriptions are displayed
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Study React')).toBeInTheDocument()
  })

  it('should highlight the current goal with red styling', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Current Goal',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 0,
          },
        ],
        sessions: [],
        currentGoalId: 'goal-1',
        totalStudyTime: 0,
        totalSessions: 0,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Find the goal card
    const goalCard = screen.getByText('Current Goal').closest('div[class*="bg-red-100"]')
    expect(goalCard).toBeInTheDocument()
    
    // Check for "Current" badge
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('should display session count for each goal', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Goal with Sessions',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 3000,
          },
        ],
        sessions: [
          { id: 'session-1', goalId: 'goal-1', duration: 1500, completed: true },
          { id: 'session-2', goalId: 'goal-1', duration: 1500, completed: true },
        ],
        currentGoalId: null,
        totalStudyTime: 3000,
        totalSessions: 2,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Check that sessions count is displayed
    // We look for the "Sessions" label and the count nearby
    const sessionsHeading = screen.getByText('Sessions')
    const sessionsContainer = sessionsHeading.closest('div')
    expect(sessionsContainer).toHaveTextContent('2')
  })

  it('should allow clicking on a goal when timer is not running', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Clickable Goal',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 0,
          },
        ],
        sessions: [],
        currentGoalId: null,
        totalStudyTime: 0,
        totalSessions: 0,
      },
      timer: {
        timeRemaining: 1500,
        isRunning: false,
        isBreak: false,
        studyDuration: 1500,
        breakDuration: 420,
        studyElapsedTime: 0,
        breakElapsedTime: 0,
        showBreakPrompt: false,
        breakMode: 'manual' as const,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Find and click the goal
    const goalCard = screen.getByText('Clickable Goal')
    fireEvent.click(goalCard)
    
    // After clicking, the goal should become the current one
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('should NOT allow clicking on a goal when timer is running', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Active Goal',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 0,
          },
          {
            id: 'goal-2',
            goalDescription: 'Other Goal',
            goalTimeStamp: Date.now() - 1000,
            totalTimeStudied: 0,
          },
        ],
        sessions: [],
        currentGoalId: 'goal-1',
        totalStudyTime: 0,
        totalSessions: 0,
      },
      timer: {
        timeRemaining: 1500,
        isRunning: true,
        isBreak: false,
        studyDuration: 1500,
        breakDuration: 420,
        studyElapsedTime: 0,
        breakElapsedTime: 0,
        showBreakPrompt: false,
        breakMode: 'manual' as const,
      },
    })
    
    const { rerender } = render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Try to click the other goal
    const otherGoal = screen.getByText('Other Goal')
    fireEvent.click(otherGoal)
    
    // Re-render to reflect any state changes
    rerender(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // The current goal should still be "Active Goal"
    const currentBadges = screen.getAllByText('Current')
    expect(currentBadges).toHaveLength(1)
    
    // Check that the clicked goal did NOT become current
    const clickedGoal = screen.getByText('Other Goal')
    const clickedGoalContainer = clickedGoal.closest('div')
    expect(clickedGoalContainer).not.toHaveClass('bg-red-100')
  })

  it('should sort goals by creation time (newest first)', () => {
    const olderGoal = {
      id: 'goal-old',
      goalDescription: 'Older Goal',
      goalTimeStamp: Date.now() - 100000,
      totalTimeStudied: 0,
    }
    
    const newerGoal = {
      id: 'goal-new',
      goalDescription: 'Newer Goal',
      goalTimeStamp: Date.now(),
      totalTimeStudied: 0,
    }
    
    const store = createTestStore({
      goal: {
        goals: [olderGoal, newerGoal],
        sessions: [],
        currentGoalId: null,
        totalStudyTime: 0,
        totalSessions: 0,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Get all goal descriptions
    const goals = screen.getAllByText(/goal$/i)
    
    // Newer goal should appear first
    expect(goals[0]).toHaveTextContent('Newer Goal')
    expect(goals[1]).toHaveTextContent('Older Goal')
  })

  it('should display formatted time for total time studied', () => {
    const store = createTestStore({
      goal: {
        goals: [
          {
            id: 'goal-1',
            goalDescription: 'Timed Goal',
            goalTimeStamp: Date.now(),
            totalTimeStudied: 3723, // 1 hour, 2 minutes, 3 seconds
          },
        ],
        sessions: [],
        currentGoalId: null,
        totalStudyTime: 3723,
        totalSessions: 0,
      },
    })
    
    render(
      <Provider store={store}>
        <GoalHistory />
      </Provider>
    )
    
    // Check that formatted time is displayed
    const timeHeading = screen.getByText('Total Time')
    const timeContainer = timeHeading.closest('div')
    expect(timeContainer).toHaveTextContent('1:02:03') // hours:minutes:seconds format
  })
})





