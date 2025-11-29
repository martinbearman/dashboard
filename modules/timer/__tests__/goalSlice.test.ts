import { describe, it, expect } from 'vitest'
import goalReducer, { 
  createGoal, 
  setCurrentGoal, 
  clearCurrentGoal, 
  completeSession 
} from '../store/slices/goalSlice'
import type { Goal, Session, GoalState } from '../store/slices/goalSlice'

/**
 * Goal Slice Tests
 * 
 * These tests demonstrate how to test Redux reducers for goal management.
 */

describe('goalSlice', () => {
  const initialState: GoalState = {
    goals: [],
    sessions: [],
    currentGoalId: null,
    totalStudyTime: 0,
    totalSessions: 0
  }

  it('should return initial state', () => {
    expect(goalReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle createGoal action', () => {
    const actual = goalReducer(initialState, createGoal('Study TypeScript'))
    
    expect(actual.goals).toHaveLength(1)
    expect(actual.goals[0].goalDescription).toBe('Study TypeScript')
    expect(actual.goals[0].totalTimeStudied).toBe(0)
    expect(actual.currentGoalId).toBe(actual.goals[0].id)
    expect(typeof actual.goals[0].id).toBe('string')
    expect(typeof actual.goals[0].goalTimeStamp).toBe('number')
  })

  it('should handle setCurrentGoal action', () => {
    const stateWithGoal: GoalState = {
      ...initialState,
      goals: [
        { id: 'goal-1', goalDescription: 'Goal 1', goalTimeStamp: Date.now(), totalTimeStudied: 0, completedAt: null, isActive: false }
      ]
    }
    const actual = goalReducer(stateWithGoal, setCurrentGoal('goal-1'))
    
    expect(actual.currentGoalId).toBe('goal-1')
  })

  it('should handle clearCurrentGoal action', () => {
    const stateWithCurrentGoal: GoalState = {
      ...initialState,
      currentGoalId: 'goal-1'
    }
    const actual = goalReducer(stateWithCurrentGoal, clearCurrentGoal())
    
    expect(actual.currentGoalId).toBeNull()
  })

  it('should handle completeSession action', () => {
    const stateWithCurrentGoal: GoalState = {
      ...initialState,
      goals: [
        { 
          id: 'goal-1', 
          goalDescription: 'Goal 1', 
          goalTimeStamp: Date.now(), 
          totalTimeStudied: 0,
          completedAt: null,
          isActive: false
        }
      ],
      currentGoalId: 'goal-1'
    }
    const actual = goalReducer(stateWithCurrentGoal, completeSession({ duration: 1500, completed: true }))
    
    expect(actual.sessions).toHaveLength(1)
    expect(actual.sessions[0].goalId).toBe('goal-1')
    expect(actual.sessions[0].duration).toBe(1500)
    expect(actual.sessions[0].completed).toBe(true)
    expect(actual.goals[0].totalTimeStudied).toBe(1500)
    expect(actual.totalStudyTime).toBe(1500)
    expect(actual.totalSessions).toBe(1)
  })

  it('should not create session when there is no currentGoalId', () => {
    const actual = goalReducer(initialState, completeSession({ duration: 1500, completed: true }))
    
    expect(actual.sessions).toHaveLength(0)
    expect(actual.totalStudyTime).toBe(0)
    expect(actual.totalSessions).toBe(0)
  })

  it('should accumulate multiple completed sessions', () => {
    const stateWithGoal: GoalState = {
      ...initialState,
      goals: [
        { 
          id: 'goal-1', 
          goalDescription: 'Goal 1', 
          goalTimeStamp: Date.now(), 
          totalTimeStudied: 0,
          completedAt: null,
          isActive: false
         }
      ],
      currentGoalId: 'goal-1'
    }
    
    let actual = goalReducer(stateWithGoal, completeSession({ duration: 1500, completed: true }))
    actual = goalReducer(actual, completeSession({ duration: 1200, completed: true }))
    
    expect(actual.sessions).toHaveLength(2)
    expect(actual.goals[0].totalTimeStudied).toBe(2700) // 1500 + 1200
    expect(actual.totalStudyTime).toBe(2700)
    expect(actual.totalSessions).toBe(2)
  })

  it('should handle incomplete sessions', () => {
    const stateWithGoal: GoalState = {
      ...initialState,
      goals: [
        { 
          id: 'goal-1', 
          goalDescription: 'Goal 1', 
          goalTimeStamp: Date.now(), 
          totalTimeStudied: 0,
          completedAt: null,
          isActive: false
        }
      ],
      currentGoalId: 'goal-1'
    }
    const actual = goalReducer(stateWithGoal, completeSession({ duration: 500, completed: false }))
    
    expect(actual.sessions).toHaveLength(1)
    expect(actual.sessions[0].completed).toBe(false)
    expect(actual.goals[0].totalTimeStudied).toBe(500) // Should still add time
    expect(actual.totalStudyTime).toBe(500)
    expect(actual.totalSessions).toBe(1)
  })

  it('should generate unique session IDs', () => {
    const stateWithGoal: GoalState = {
      ...initialState,
      goals: [
        { id: 'goal-1', 
          goalDescription: 'Goal 1', 
          goalTimeStamp: Date.now(), 
          totalTimeStudied: 0,
          completedAt: null,
          isActive: false
        }
      ],
      currentGoalId: 'goal-1'
    }
    
    const session1 = goalReducer(stateWithGoal, completeSession({ duration: 1500, completed: true }))
    const session2 = goalReducer(session1, completeSession({ duration: 1500, completed: true }))
    
    expect(session2.sessions[0].id).not.toBe(session2.sessions[1].id)
  })

  it('should create multiple goals independently', () => {
    let state: GoalState = initialState
    
    state = goalReducer(state, createGoal('Goal 1'))
    const goal1Id = state.currentGoalId
    
    state = goalReducer(state, createGoal('Goal 2'))
    const goal2Id = state.currentGoalId
    
    expect(state.goals).toHaveLength(2)
    expect(state.goals[0].goalDescription).toBe('Goal 1')
    expect(state.goals[1].goalDescription).toBe('Goal 2')
    expect(goal1Id).not.toBe(goal2Id)
    expect(state.currentGoalId).toBe(goal2Id)
  })

  it('should handle switch between goals and maintain separate time tracking', () => {
    let state: GoalState = initialState
    
    // Create goal 1
    state = goalReducer(state, createGoal('Goal 1'))
    const goal1Id = state.currentGoalId
    
    // Complete session for goal 1
    state = goalReducer(state, completeSession({ duration: 1500, completed: true }))
    
    // Create goal 2
    state = goalReducer(state, createGoal('Goal 2'))
    
    // Complete session for goal 2
    state = goalReducer(state, completeSession({ duration: 1200, completed: true }))
    
    // Switch back to goal 1
    state = goalReducer(state, setCurrentGoal(goal1Id!))
    
    expect(state.goals[0].totalTimeStudied).toBe(1500)
    expect(state.goals[1].totalTimeStudied).toBe(1200)
    expect(state.totalStudyTime).toBe(2700)
    expect(state.totalSessions).toBe(2)
  })
})

