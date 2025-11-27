import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Goal Interface - represents a study goal
 */
export interface Goal {
  id: string
  goalDescription: string
  goalTimeStamp: number
  totalTimeStudied: number
  completedAt: number | null
  isActive: boolean
}

/**
 * Session Interface - represents an individual Pomodoro session
 */
export interface Session {
  id: string
  goalId: string
  sessionDate: number
  duration: number
  completed: boolean
}

/**
 * Goal State Interface
 */
export interface GoalState {
  goals: Goal[]
  sessions: Session[]
  currentGoalId: string | null   // Which goal is active right now
  totalStudyTime: number
  totalSessions: number
}

/**
 * Initial State
 */
const initialState: GoalState = {
  goals: [],
  sessions: [],
  currentGoalId: null,
  totalStudyTime: 0,
  totalSessions: 0
}

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    // Create a new goal and set it as current
    createGoal: (state, action: PayloadAction<string>) => {
      const newGoal = {
        id: crypto.randomUUID(),
        goalDescription: action.payload,
        goalTimeStamp: Date.now(),
        totalTimeStudied: 0,
        isActive: true,
        completedAt: null
      }
      state.goals.push(newGoal)
      state.currentGoalId = newGoal.id
    },
    // Set the current goal to the goal with the given id
    setCurrentGoal: (state, action: PayloadAction<string>) => {
      const goalExists = state.goals.some(g => g.id === action.payload)
      if (goalExists) {
        state.currentGoalId = action.payload
      }
    },
    // Clear the current goal
    clearCurrentGoal: (state) => {
      state.currentGoalId = null
    },
    // Mark a goal as complete
    markGoalComplete: (state, action: PayloadAction<string>) => {
      const goal = state.goals.find(goal => goal.id === action.payload)
      if (goal) {
        goal.isActive = false
        goal.completedAt = Date.now()
        if(state.currentGoalId === action.payload) {
          state.currentGoalId = null
        }
      }
    },
    // Complete a session
    completeSession: (state, action: PayloadAction<{ duration: number, completed: boolean }>) => {
      if (!state.currentGoalId) return
      
      // Create session record
      const newSession: Session = {
        id: crypto.randomUUID(),
        goalId: state.currentGoalId,
        sessionDate: Date.now(),
        duration: action.payload.duration,
        completed: action.payload.completed
      }
      state.sessions.push(newSession)
      
      // Update goal's total time
      const goal = state.goals.find(g => g.id === state.currentGoalId)
      if (goal) {
        goal.totalTimeStudied += action.payload.duration
      }
      
      // Update global stats
      state.totalStudyTime += action.payload.duration
      state.totalSessions += 1
    },
    
    // Load goals from database
    loadGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload
    },
    
    // Load sessions from database
    loadSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload
      
      // Calculate total time from all sessions
      state.totalStudyTime = action.payload.reduce((total, session) => total + session.duration, 0)
      state.totalSessions = action.payload.length
    }
  }
})

export const { createGoal, setCurrentGoal, clearCurrentGoal, completeSession, loadGoals, loadSessions, markGoalComplete } = goalSlice.actions
export default goalSlice.reducer

