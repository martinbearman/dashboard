import { describe, it, expect } from 'vitest'
import moduleLinksReducer, {
  addLink,
  updateLink,
  removeLink,
  removeLinksForModule,
  removeLinksForModules,
  createInitialModuleLinksState,
} from '../slices/moduleLinksSlice'
import type { ModuleLinksState } from '../slices/moduleLinksSlice'
import type { LinkPattern } from '@/lib/types/dashboard'

describe('moduleLinksSlice', () => {
  const initialState: ModuleLinksState = createInitialModuleLinksState()

  it('should return initial state', () => {
    const actual = moduleLinksReducer(undefined, { type: 'unknown' })
    expect(actual).toEqual(initialState)
    expect(actual.links).toEqual({})
  })

  describe('addLink', () => {
    it('should add a new link', () => {
      const actual = moduleLinksReducer(
        initialState,
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const linkIds = Object.keys(actual.links)
      expect(linkIds).toHaveLength(1)

      const link = actual.links[linkIds[0]]
      expect(link.sourceModuleId).toBe('module-1')
      expect(link.targetModuleId).toBe('module-2')
      expect(link.pattern).toBe('data-provider')
      expect(link.metadata.enabled).toBe(true)
      expect(link.createdAt).toBeGreaterThan(0)
    })

    it('should enable link by default', () => {
      const actual = moduleLinksReducer(
        initialState,
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'active-item-tracker',
        })
      )

      const link = Object.values(actual.links)[0]
      expect(link.metadata.enabled).toBe(true)
    })

    it('should allow custom metadata', () => {
      const actual = moduleLinksReducer(
        initialState,
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'active-item-tracker',
          metadata: {
            label: 'Test Link',
            activeItemId: 'item-1',
            enabled: false,
          },
        })
      )

      const link = Object.values(actual.links)[0]
      expect(link.metadata.label).toBe('Test Link')
      expect(link.metadata.activeItemId).toBe('item-1')
      expect(link.metadata.enabled).toBe(false)
    })

    it('should allow custom link ID', () => {
      const customId = 'custom-link-id'
      const actual = moduleLinksReducer(
        initialState,
        addLink({
          id: customId,
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      expect(actual.links[customId]).toBeDefined()
      expect(actual.links[customId].id).toBe(customId)
    })

    it('should generate UUID if no ID provided', () => {
      const actual = moduleLinksReducer(
        initialState,
        addLink({
          sourceModuleId: 'module-1',
          targetModuleId: 'module-2',
          pattern: 'data-provider',
        })
      )

      const linkIds = Object.keys(actual.links)
      expect(linkIds[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })
  })

  describe('updateLink', () => {
    it('should update link metadata', () => {
      const stateWithLink: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true, label: 'Old Label' },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(
        stateWithLink,
        updateLink({
          linkId: 'link-1',
          updates: {
            metadata: { label: 'New Label', enabled: false },
          },
        })
      )

      expect(actual.links['link-1'].metadata.label).toBe('New Label')
      expect(actual.links['link-1'].metadata.enabled).toBe(false)
    })

    it('should update link pattern', () => {
      const stateWithLink: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(
        stateWithLink,
        updateLink({
          linkId: 'link-1',
          updates: {
            pattern: 'active-item-tracker',
          },
        })
      )

      expect(actual.links['link-1'].pattern).toBe('active-item-tracker')
    })

    it('should preserve existing metadata when updating', () => {
      const stateWithLink: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true, label: 'Test', priority: 1 },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(
        stateWithLink,
        updateLink({
          linkId: 'link-1',
          updates: {
            metadata: { label: 'Updated' },
          },
        })
      )

      expect(actual.links['link-1'].metadata.label).toBe('Updated')
      expect(actual.links['link-1'].metadata.enabled).toBe(true)
      expect(actual.links['link-1'].metadata.priority).toBe(1)
    })

    it('should do nothing if link does not exist', () => {
      const actual = moduleLinksReducer(
        initialState,
        updateLink({
          linkId: 'non-existent',
          updates: { metadata: { label: 'Test' } },
        })
      )

      expect(actual.links).toEqual({})
    })
  })

  describe('removeLink', () => {
    it('should remove a specific link', () => {
      const stateWithLinks: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-2': {
            id: 'link-2',
            sourceModuleId: 'module-3',
            targetModuleId: 'module-4',
            pattern: 'active-item-tracker',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(stateWithLinks, removeLink('link-1'))

      expect(actual.links['link-1']).toBeUndefined()
      expect(actual.links['link-2']).toBeDefined()
    })
  })

  describe('removeLinksForModule', () => {
    it('should remove links where module is source', () => {
      const stateWithLinks: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-2': {
            id: 'link-2',
            sourceModuleId: 'module-3',
            targetModuleId: 'module-4',
            pattern: 'active-item-tracker',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(stateWithLinks, removeLinksForModule('module-1'))

      expect(actual.links['link-1']).toBeUndefined()
      expect(actual.links['link-2']).toBeDefined()
    })

    it('should remove links where module is target', () => {
      const stateWithLinks: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-2': {
            id: 'link-2',
            sourceModuleId: 'module-3',
            targetModuleId: 'module-4',
            pattern: 'active-item-tracker',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(stateWithLinks, removeLinksForModule('module-2'))

      expect(actual.links['link-1']).toBeUndefined()
      expect(actual.links['link-2']).toBeDefined()
    })

    it('should remove all links for a module (bidirectional)', () => {
      const stateWithLinks: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-2': {
            id: 'link-2',
            sourceModuleId: 'module-2',
            targetModuleId: 'module-3',
            pattern: 'active-item-tracker',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-3': {
            id: 'link-3',
            sourceModuleId: 'module-4',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(stateWithLinks, removeLinksForModule('module-2'))

      expect(actual.links['link-1']).toBeUndefined()
      expect(actual.links['link-2']).toBeUndefined()
      expect(actual.links['link-3']).toBeUndefined()
    })
  })

  describe('removeLinksForModules', () => {
    it('should remove links for multiple modules', () => {
      const stateWithLinks: ModuleLinksState = {
        links: {
          'link-1': {
            id: 'link-1',
            sourceModuleId: 'module-1',
            targetModuleId: 'module-2',
            pattern: 'data-provider',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
          'link-2': {
            id: 'link-2',
            sourceModuleId: 'module-3',
            targetModuleId: 'module-4',
            pattern: 'active-item-tracker',
            metadata: { enabled: true },
            createdAt: Date.now(),
          },
        },
      }

      const actual = moduleLinksReducer(
        stateWithLinks,
        removeLinksForModules(['module-1', 'module-4'])
      )

      expect(actual.links['link-1']).toBeUndefined()
      expect(actual.links['link-2']).toBeUndefined()
    })
  })
})