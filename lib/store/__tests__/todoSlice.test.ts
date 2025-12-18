import { describe, it, expect } from 'vitest'
import todoReducer, {
  createTodo,
  toggleTodo,
  setTodoLink,
  updateTodo,
  reorderTodosInList,
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

  describe('setTodoLink', () => {
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
            link: null,
          },
        ],
      },
    }

    it('should set a URL link on a todo', () => {
      const actual = todoReducer(
        stateWithTodo,
        setTodoLink({
          id: 'todo-1',
          link: {
            type: 'url',
            target: 'https://example.com',
            label: 'Example Site',
          },
        })
      )

      expect(actual.todosByList.default[0].link).toEqual({
        type: 'url',
        target: 'https://example.com',
        label: 'Example Site',
      })
    })

    it('should set a dashboard link on a todo', () => {
      const actual = todoReducer(
        stateWithTodo,
        setTodoLink({
          id: 'todo-1',
          link: {
            type: 'dashboard',
            target: 'board-1',
            label: 'My Dashboard',
          },
        })
      )

      expect(actual.todosByList.default[0].link).toEqual({
        type: 'dashboard',
        target: 'board-1',
        label: 'My Dashboard',
      })
    })

    it('should set a module link on a todo', () => {
      const actual = todoReducer(
        stateWithTodo,
        setTodoLink({
          id: 'todo-1',
          link: {
            type: 'module',
            target: 'module-1',
            label: 'Timer Module',
          },
        })
      )

      expect(actual.todosByList.default[0].link).toEqual({
        type: 'module',
        target: 'module-1',
        label: 'Timer Module',
      })
    })

    it('should remove a link when set to null', () => {
      const stateWithLink: TodoState = {
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
              link: {
                type: 'url',
                target: 'https://example.com',
                label: 'Example',
              },
            },
          ],
        },
      }

      const actual = todoReducer(
        stateWithLink,
        setTodoLink({
          id: 'todo-1',
          link: null,
        })
      )

      expect(actual.todosByList.default[0].link).toBeNull()
    })

    it('should handle link with no label', () => {
      const actual = todoReducer(
        stateWithTodo,
        setTodoLink({
          id: 'todo-1',
          link: {
            type: 'url',
            target: 'https://example.com',
          },
        })
      )

      expect(actual.todosByList.default[0].link).toEqual({
        type: 'url',
        target: 'https://example.com',
      })
      expect(actual.todosByList.default[0].link?.label).toBeUndefined()
    })

    it('should not modify todos that do not exist', () => {
      const actual = todoReducer(
        stateWithTodo,
        setTodoLink({
          id: 'non-existent-todo',
          link: {
            type: 'url',
            target: 'https://example.com',
          },
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithTodo)
    })
  })

  describe('updateTodo', () => {
    const stateWithTodo: TodoState = {
      todosByList: {
        default: [
          {
            id: 'todo-1',
            listId: 'default',
            description: 'Original description',
            completed: false,
            createdAt: Date.now(),
            priority: null,
            dueDate: null,
            totalTimeStudied: 0,
            sessions: [],
            isActiveGoal: false,
            link: null,
          },
        ],
      },
    }

    it('should update todo description', () => {
      const actual = todoReducer(
        stateWithTodo,
        updateTodo({
          id: 'todo-1',
          description: 'Updated description',
        })
      )

      expect(actual.todosByList.default[0].description).toBe('Updated description')
    })

    it('should not modify todos that do not exist', () => {
      const actual = todoReducer(
        stateWithTodo,
        updateTodo({
          id: 'non-existent-todo',
          description: 'New description',
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithTodo)
    })
  })

  describe('reorderTodosInList', () => {
    const stateWithMultipleTodos: TodoState = {
      todosByList: {
        default: [
          {
            id: 'todo-1',
            listId: 'default',
            description: 'First todo',
            completed: false,
            createdAt: Date.now(),
            priority: null,
            dueDate: null,
            totalTimeStudied: 0,
            sessions: [],
            isActiveGoal: false,
            link: null,
          },
          {
            id: 'todo-2',
            listId: 'default',
            description: 'Second todo',
            completed: false,
            createdAt: Date.now(),
            priority: null,
            dueDate: null,
            totalTimeStudied: 0,
            sessions: [],
            isActiveGoal: false,
            link: null,
          },
          {
            id: 'todo-3',
            listId: 'default',
            description: 'Third todo',
            completed: false,
            createdAt: Date.now(),
            priority: null,
            dueDate: null,
            totalTimeStudied: 0,
            sessions: [],
            isActiveGoal: false,
            link: null,
          },
        ],
      },
    }

    it('should reorder todos within a list', () => {
      // Move todo-1 to position after todo-3
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'default',
          activeId: 'todo-1',
          overId: 'todo-3',
        })
      )

      // todo-1 should now be after todo-3
      const todoIds = actual.todosByList.default.map((t) => t.id)
      expect(todoIds).toEqual(['todo-2', 'todo-3', 'todo-1'])
    })

    it('should handle reordering to the beginning', () => {
      // Move todo-3 to position before todo-1
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'default',
          activeId: 'todo-3',
          overId: 'todo-1',
        })
      )

      const todoIds = actual.todosByList.default.map((t) => t.id)
      expect(todoIds).toEqual(['todo-3', 'todo-1', 'todo-2'])
    })

    it('should not modify state if list does not exist', () => {
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'non-existent-list',
          activeId: 'todo-1',
          overId: 'todo-2',
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithMultipleTodos)
    })

    it('should not modify state if active todo does not exist', () => {
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'default',
          activeId: 'non-existent-todo',
          overId: 'todo-2',
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithMultipleTodos)
    })

    it('should not modify state if over todo does not exist', () => {
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'default',
          activeId: 'todo-1',
          overId: 'non-existent-todo',
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithMultipleTodos)
    })

    it('should not modify state if active and over are the same', () => {
      const actual = todoReducer(
        stateWithMultipleTodos,
        reorderTodosInList({
          listId: 'default',
          activeId: 'todo-1',
          overId: 'todo-1',
        })
      )

      // State should remain unchanged
      expect(actual).toEqual(stateWithMultipleTodos)
    })
  })
})