import { describe, it, expect } from 'vitest'
import todoReducer, {
  createTodo,
  toggleTodo,
} from '../slices/todoSlice'
import type { TodoState } from '../slices/todoSlice'

describe('todoSlice', () => {
  const initialState: TodoState = {
    todosByList: {
      default: [],
    },
  }

  it('should return initial state', () => {
    // When reducer is called with undefined state, it should return the slice's initial state
    const actual = todoReducer(undefined, { type: 'unknown' })

    expect(actual).toEqual(initialState)
  })

  it('should handle createTodo with default fields', () => {
    const description = 'Study TypeScript'

    const actual = todoReducer(
      initialState,
      createTodo({ description })
    )

    expect(actual.todosByList.default).toHaveLength(1)
    const todo = actual.todosByList.default[0]

    expect(todo.description).toBe(description)
    expect(todo.completed).toBe(false)
    expect(todo.priority).toBeNull()
    expect(todo.dueDate).toBeNull()
    expect(todo.totalTimeStudied).toBe(0)
    expect(todo.sessions).toEqual([])
    expect(todo.isActiveGoal).toBe(false)

    // Generated fields
    expect(typeof todo.id).toBe('string')
    expect(typeof todo.createdAt).toBe('number')
  })

  it('should toggle todo completion status', () => {
    // Start with one incomplete todo
    const stateWithTodo: TodoState = {
      todosByList: {
        default: [
          {
            id: 'todo-1',
            listId: 'default',
            description: 'Test todo',
            completed: false,
            createdAt: Date.now(),
            priority: null,
            dueDate: null,
            totalTimeStudied: 0,
            sessions: [],
            isActiveGoal: false,
          },
        ],
      },
    }

    // Toggle the todo from incomplete (false) to complete (true)
    const toggledOnce = todoReducer(stateWithTodo, toggleTodo('todo-1'))
    // Verify the todo is now marked as completed
    expect(toggledOnce.todosByList.default[0].completed).toBe(true)

    // Toggle the todo again from complete (true) back to incomplete (false)
    const toggledTwice = todoReducer(toggledOnce, toggleTodo('todo-1'))
    // Verify the todo is now marked as incomplete again, demonstrating toggle reversibility
    expect(toggledTwice.todosByList.default[0].completed).toBe(false)
  })
})