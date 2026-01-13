import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { makeStore } from '@/lib/store/store'
import { Provider } from 'react-redux'
import {
  useModuleLinks,
  useEnabledModuleLinks,
  useSourceLinks,
  useTargetLinks,
  useLinksBetweenModules,
  useLink,
  useAreModulesLinked,
  useAllLinks,
  useAllEnabledLinks,
  useModuleLinksWithActions,
  useLinkWithActions,
  useLinksByPattern,
  useEnabledLinksByPattern,
} from '../useModuleLinks'
import { addLink, updateLink, removeLink } from '@/lib/store/slices/moduleLinksSlice'
import type { AppStore } from '@/lib/store/store'

// Helper to create a wrapper with a store
function createWrapper(store: AppStore) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useModuleLinks hooks', () => {
  let store: AppStore

  beforeEach(() => {
    store = makeStore()
  })

  describe('useModuleLinks', () => {
    it('should return empty array when module has no links', () => {
      const { result } = renderHook(() => useModuleLinks('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toEqual([])
    })

    it('should return all links for a module (source and target)', () => {
      // Add links where module-1 is source
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      // Add link where module-1 is target
      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-1',
          pattern: 'active-item-tracker',
        })
      )

      // Add unrelated link
      store.dispatch(
        addLink({
          sourceModuleId: 'module-4',
          targetModuleId: 'module-5',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useModuleLinks('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(2)
      expect(result.current.some((link) => link.targetModuleId === 'module-2')).toBe(true)
      expect(result.current.some((link) => link.sourceModuleId === 'module-3')).toBe(true)
    })
  })

  describe('useEnabledModuleLinks', () => {
    it('should return only enabled links', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { enabled: true },
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-3',
          pattern: 'data-provider',
          metadata: { enabled: false },
        })
      )

      const { result } = renderHook(() => useEnabledModuleLinks('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].targetModuleId).toBe('module-2')
    })

    it('should include links with undefined enabled status', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          // enabled defaults to true
        })
      )

      const { result } = renderHook(() => useEnabledModuleLinks('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(1)
    })
  })

  describe('useSourceLinks', () => {
    it('should return only links where module is source', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-1',
          pattern: 'active-item-tracker',
        })
      )

      const { result } = renderHook(() => useSourceLinks('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].sourceModuleId).toBe('module-1')
      expect(result.current[0].targetModuleId).toBe('module-2')
    })
  })

  describe('useTargetLinks', () => {
    it('should return only links where module is target', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-2',
          pattern: 'active-item-tracker',
        })
      )

      const { result } = renderHook(() => useTargetLinks('module-2'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(2)
      expect(result.current.every((link) => link.targetModuleId === 'module-2')).toBe(true)
    })
  })

  describe('useLinksBetweenModules', () => {
    it('should return links between two modules (bidirectional)', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-2',
          targetModuleId: 'module-1',
          pattern: 'active-item-tracker',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-3',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(
        () => useLinksBetweenModules('module-1', 'module-2'),
        {
          wrapper: createWrapper(store),
        }
      )

      expect(result.current).toHaveLength(2)
    })

    it('should return empty array when modules are not linked', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(
        () => useLinksBetweenModules('module-3', 'module-4'),
        {
          wrapper: createWrapper(store),
        }
      )

      expect(result.current).toEqual([])
    })
  })

  describe('useLink', () => {
    it('should return link by ID', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useLink('link-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toBeDefined()
      expect(result.current?.id).toBe('link-1')
      expect(result.current?.sourceModuleId).toBe('module-1')
    })

    it('should return null for non-existent link', () => {
      const { result } = renderHook(() => useLink('non-existent'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toBeNull()
    })

    it('should return null when linkId is null', () => {
      const { result } = renderHook(() => useLink(null), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toBeNull()
    })
  })

  describe('useAreModulesLinked', () => {
    it('should return true when modules are linked', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useAreModulesLinked('module-1', 'module-2'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toBe(true)
    })

    it('should return false when modules are not linked', () => {
      const { result } = renderHook(() => useAreModulesLinked('module-1', 'module-2'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toBe(false)
    })
  })

  describe('useAllLinks', () => {
    it('should return all links in the store', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-4',
          pattern: 'active-item-tracker',
        })
      )

      const { result } = renderHook(() => useAllLinks(), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(2)
    })
  })

  describe('useAllEnabledLinks', () => {
    it('should return only enabled links', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { enabled: true },
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-4',
          pattern: 'data-provider',
          metadata: { enabled: false },
        })
      )

      const { result } = renderHook(() => useAllEnabledLinks(), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].sourceModuleId).toBe('module-1')
    })
  })

  describe('useModuleLinksWithActions', () => {
    it('should return links and action functions', () => {
      const { result } = renderHook(() => useModuleLinksWithActions('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current.links).toBeDefined()
      expect(result.current.sourceLinks).toBeDefined()
      expect(result.current.targetLinks).toBeDefined()
      expect(typeof result.current.addLink).toBe('function')
      expect(typeof result.current.updateLink).toBe('function')
      expect(typeof result.current.removeLink).toBe('function')
    })

    it('should add link when addLink is called', () => {
      const { result } = renderHook(() => useModuleLinksWithActions('module-1'), {
        wrapper: createWrapper(store),
      })

      act(() => {
        result.current.addLink('module-2', 'data-provider', { label: 'Test Link' })
      })

      expect(result.current.links).toHaveLength(1)
      expect(result.current.links[0].targetModuleId).toBe('module-2')
      expect(result.current.links[0].metadata.label).toBe('Test Link')
    })

    it('should update link when updateLink is called', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { label: 'Old Label' },
        })
      )

      const { result } = renderHook(() => useModuleLinksWithActions('module-1'), {
        wrapper: createWrapper(store),
      })

      act(() => {
        result.current.updateLink('link-1', {
          metadata: { label: 'New Label' },
        })
      })

      const updatedLink = result.current.links.find((link) => link.id === 'link-1')
      expect(updatedLink?.metadata.label).toBe('New Label')
    })

    it('should remove link when removeLink is called', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useModuleLinksWithActions('module-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current.links).toHaveLength(1)

      act(() => {
        result.current.removeLink('link-1')
      })

      expect(result.current.links).toHaveLength(0)
    })
  })

  describe('useLinkWithActions', () => {
    it('should return link and action functions', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useLinkWithActions('link-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current.link).toBeDefined()
      expect(typeof result.current.updateLink).toBe('function')
      expect(typeof result.current.removeLink).toBe('function')
      expect(typeof result.current.toggleEnabled).toBe('function')
    })

    it('should return null link when linkId is null', () => {
      const { result } = renderHook(() => useLinkWithActions(null), {
        wrapper: createWrapper(store),
      })

      expect(result.current.link).toBeNull()
    })

    it('should update link when updateLink is called', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { label: 'Old' },
        })
      )

      const { result } = renderHook(() => useLinkWithActions('link-1'), {
        wrapper: createWrapper(store),
      })

      act(() => {
        result.current.updateLink({ metadata: { label: 'New' } })
      })

      expect(result.current.link?.metadata.label).toBe('New')
    })

    it('should remove link when removeLink is called', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useLinkWithActions('link-1'), {
        wrapper: createWrapper(store),
      })

      act(() => {
        result.current.removeLink()
      })

      expect(result.current.link).toBeNull()
    })

    it('should toggle enabled status', () => {
      store.dispatch(
        addLink({
          id: 'link-1',
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { enabled: true },
        })
      )

      const { result } = renderHook(() => useLinkWithActions('link-1'), {
        wrapper: createWrapper(store),
      })

      expect(result.current.link?.metadata.enabled).toBe(true)

      act(() => {
        result.current.toggleEnabled()
      })

      expect(result.current.link?.metadata.enabled).toBe(false)

      act(() => {
        result.current.toggleEnabled()
      })

      expect(result.current.link?.metadata.enabled).toBe(true)
    })

    it('should not update when linkId is null', () => {
      const { result } = renderHook(() => useLinkWithActions(null), {
        wrapper: createWrapper(store),
      })

      act(() => {
        result.current.updateLink({ metadata: { label: 'Test' } })
        result.current.removeLink()
        result.current.toggleEnabled()
      })

      // Should not throw, but also should not do anything
      expect(result.current.link).toBeNull()
    })
  })

  describe('useLinksByPattern', () => {
    it('should return links filtered by pattern', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-4',
          pattern: 'active-item-tracker',
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-5',
          targetModuleId: 'module-6',
          pattern: 'data-provider',
        })
      )

      const { result } = renderHook(() => useLinksByPattern('data-provider'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(2)
      expect(result.current.every((link) => link.pattern === 'data-provider')).toBe(true)
    })
  })

  describe('useEnabledLinksByPattern', () => {
    it('should return only enabled links filtered by pattern', () => {
      store.dispatch(
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
          metadata: { enabled: true },
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-3',
          targetModuleId: 'module-4',
          pattern: 'data-provider',
          metadata: { enabled: false },
        })
      )

      store.dispatch(
        addLink({
          sourceModuleId: 'module-5',
          targetModuleId: 'module-6',
          pattern: 'active-item-tracker',
          metadata: { enabled: true },
        })
      )

      const { result } = renderHook(() => useEnabledLinksByPattern('data-provider'), {
        wrapper: createWrapper(store),
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].pattern).toBe('data-provider')
      expect(result.current[0].metadata.enabled).toBe(true)
    })
  })
})