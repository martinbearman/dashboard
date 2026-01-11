import { describe, it, expect } from 'vitest'
import moduleConfigsReducer, {
  setModuleConfig,
  updateModuleConfig,
  removeModuleConfig,
  createInitialModuleConfigsState,
} from '../slices/moduleConfigsSlice'
import type { ModuleConfigsState } from '../slices/moduleConfigsSlice'

describe('moduleConfigsSlice', () => {
  const initialState: ModuleConfigsState = createInitialModuleConfigsState()

  it('should return initial state', () => {
    const actual = moduleConfigsReducer(undefined, { type: 'unknown' })
    expect(actual).toEqual(initialState)
    expect(actual.configs).toEqual({})
  })

  describe('setModuleConfig', () => {
    it('should set a new module config', () => {
      const config = { theme: 'dark', size: 'large' }
      const actual = moduleConfigsReducer(
        initialState,
        setModuleConfig({ moduleId: 'module-1', config })
      )

      expect(actual.configs['module-1']).toEqual({
        ...config,
        locked: false,
      })
    })

    it('should ensure locked property defaults to false when not provided', () => {
      const config = { theme: 'light' }
      const actual = moduleConfigsReducer(
        initialState,
        setModuleConfig({ moduleId: 'module-1', config })
      )

      expect(actual.configs['module-1'].locked).toBe(false)
    })

    it('should preserve locked property when provided', () => {
      const config = { theme: 'dark', locked: true }
      const actual = moduleConfigsReducer(
        initialState,
        setModuleConfig({ moduleId: 'module-1', config })
      )

      expect(actual.configs['module-1'].locked).toBe(true)
    })

    it('should overwrite existing config', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'light',
            size: 'small',
            locked: false,
          },
        },
      }

      const newConfig = { theme: 'dark', locked: true }
      const actual = moduleConfigsReducer(
        stateWithConfig,
        setModuleConfig({ moduleId: 'module-1', config: newConfig })
      )

      expect(actual.configs['module-1']).toEqual({
        theme: 'dark',
        locked: true,
      })
      expect(actual.configs['module-1'].size).toBeUndefined()
    })

    it('should set multiple module configs independently', () => {
      let actual = moduleConfigsReducer(
        initialState,
        setModuleConfig({ moduleId: 'module-1', config: { theme: 'dark' } })
      )

      actual = moduleConfigsReducer(
        actual,
        setModuleConfig({ moduleId: 'module-2', config: { theme: 'light' } })
      )

      expect(actual.configs['module-1'].theme).toBe('dark')
      expect(actual.configs['module-2'].theme).toBe('light')
      expect(Object.keys(actual.configs)).toHaveLength(2)
    })
  })

  describe('updateModuleConfig', () => {
    it('should update existing module config with partial values', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'light',
            size: 'small',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { theme: 'dark' },
        })
      )

      expect(actual.configs['module-1']).toEqual({
        theme: 'dark',
        size: 'small',
        locked: false,
      })
    })

    it('should create config if it does not exist', () => {
      const actual = moduleConfigsReducer(
        initialState,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { theme: 'dark' },
        })
      )

      expect(actual.configs['module-1']).toEqual({
        theme: 'dark',
        locked: false,
      })
    })

    it('should ensure locked defaults to false when creating new config', () => {
      const actual = moduleConfigsReducer(
        initialState,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { theme: 'dark' },
        })
      )

      expect(actual.configs['module-1'].locked).toBe(false)
    })

    it('should preserve existing properties when updating', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'light',
            size: 'small',
            color: 'blue',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { theme: 'dark' },
        })
      )

      expect(actual.configs['module-1']).toEqual({
        theme: 'dark',
        size: 'small',
        color: 'blue',
        locked: false,
      })
    })

    it('should allow updating locked property', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'light',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { locked: true },
        })
      )

      expect(actual.configs['module-1'].locked).toBe(true)
      expect(actual.configs['module-1'].theme).toBe('light')
    })

    it('should merge nested objects correctly', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            settings: { a: 1, b: 2 },
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        updateModuleConfig({
          moduleId: 'module-1',
          config: { settings: { b: 3, c: 4 } },
        })
      )

      // Note: This is a shallow merge, so settings will be replaced entirely
      expect(actual.configs['module-1'].settings).toEqual({ b: 3, c: 4 })
    })
  })

  describe('removeModuleConfig', () => {
    it('should remove a module config', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'dark',
            locked: false,
          },
          'module-2': {
            theme: 'light',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        removeModuleConfig('module-1')
      )

      expect(actual.configs['module-1']).toBeUndefined()
      expect(actual.configs['module-2']).toBeDefined()
      expect(Object.keys(actual.configs)).toHaveLength(1)
    })

    it('should not modify state if module does not exist', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'dark',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        removeModuleConfig('non-existent-module')
      )

      expect(actual).toEqual(stateWithConfig)
    })

    it('should handle removing from empty state', () => {
      const actual = moduleConfigsReducer(
        initialState,
        removeModuleConfig('module-1')
      )

      expect(actual.configs).toEqual({})
    })

    it('should remove all configs when removing the last one', () => {
      const stateWithConfig: ModuleConfigsState = {
        configs: {
          'module-1': {
            theme: 'dark',
            locked: false,
          },
        },
      }

      const actual = moduleConfigsReducer(
        stateWithConfig,
        removeModuleConfig('module-1')
      )

      expect(actual.configs).toEqual({})
    })
  })
})
