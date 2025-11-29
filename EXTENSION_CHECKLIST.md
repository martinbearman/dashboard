# Extension Checklist

Use this checklist when adding new features or extending existing functionality. This ensures you follow a systematic, test-driven approach.

## Pre-Development Phase

### Planning
- [ ] **Define the feature clearly**
  - What problem does it solve?
  - What are the requirements?
  - What are the edge cases?

- [ ] **Identify state requirements**
  - What data needs to be stored?
  - Does it need a new slice or extend existing?
  - What actions are needed?
  - What selectors would be useful?

- [ ] **Map integration points**
  - Which modules need to interact?
  - Are there cross-module dependencies?
  - Do we need middleware/listeners?

- [ ] **Design the API**
  - Action payloads
  - Selector signatures
  - Component props

## Development Phase

### Step 1: State Layer (Test First)

- [ ] **Create/update slice file**
  - [ ] Define TypeScript interfaces
  - [ ] Set up initial state
  - [ ] Implement reducers
  - [ ] Export actions
  - [ ] Export selectors (if needed)

- [ ] **Write slice tests**
  - [ ] Test initial state
  - [ ] Test each action
  - [ ] Test edge cases
  - [ ] Test error handling

- [ ] **Run tests**
  ```bash
  pnpm test sliceName.test.ts
  ```
  - [ ] All tests pass

- [ ] **Add to store** (if new slice)
  - [ ] Import reducer
  - [ ] Add to `combineReducers`
  - [ ] Verify TypeScript types update

### Step 2: Component Layer

- [ ] **Create/update components**
  - [ ] Use `useAppSelector` for reading state
  - [ ] Use `useAppDispatch` for actions
  - [ ] Handle loading/error states
  - [ ] Add proper TypeScript types

- [ ] **Write component tests**
  - [ ] Test rendering
  - [ ] Test user interactions
  - [ ] Test state updates
  - [ ] Test edge cases

- [ ] **Run component tests**
  ```bash
  pnpm test ComponentName.test.tsx
  ```
  - [ ] All tests pass

### Step 3: Integration

- [ ] **Test module integration** (if applicable)
  - [ ] Test cross-module communication
  - [ ] Test shared state access
  - [ ] Test event-driven flows

- [ ] **Test end-to-end flow**
  - [ ] User can perform the action
  - [ ] State updates correctly
  - [ ] UI reflects changes
  - [ ] Persistence works (localStorage)

- [ ] **Run all tests**
  ```bash
  pnpm test
  ```
  - [ ] All tests pass

### Step 4: Module Registration (if new module)

- [ ] **Create module directory structure**
  ```
  modules/new-module/
  ├── NewModule.tsx
  ├── components/
  └── lib/
  ```

- [ ] **Create module component**
  - [ ] Implements `ModuleProps`
  - [ ] Reads/writes to Redux
  - [ ] Handles config

- [ ] **Register in module registry**
  - [ ] Add to `modules/registry.tsx`
  - [ ] Define module metadata
  - [ ] Set grid size constraints

- [ ] **Test module rendering**
  - [ ] Module appears in AddModuleButton
  - [ ] Module can be added to dashboard
  - [ ] Module renders correctly
  - [ ] Module config works (if applicable)

## Post-Development Phase

### Testing & Validation

- [ ] **Manual testing**
  - [ ] Test happy path
  - [ ] Test error cases
  - [ ] Test edge cases
  - [ ] Test on different screen sizes (if UI)

- [ ] **State inspection**
  - [ ] Use Redux DevTools to verify state
  - [ ] Check localStorage persistence
  - [ ] Verify no state corruption

- [ ] **Type checking**
  ```bash
  pnpm build
  ```
  - [ ] No TypeScript errors
  - [ ] All types are correct

- [ ] **Linting**
  ```bash
  pnpm lint
  ```
  - [ ] No linting errors

### Documentation

- [ ] **Update architecture guide** (if needed)
  - [ ] Document new state structure
  - [ ] Document new actions
  - [ ] Document integration points

- [ ] **Add code comments**
  - [ ] Complex logic explained
  - [ ] Type definitions documented
  - [ ] Integration points noted

- [ ] **Update README** (if user-facing feature)
  - [ ] Document new feature
  - [ ] Add usage examples

### Code Review Checklist

- [ ] **Code quality**
  - [ ] Follows project patterns
  - [ ] No code duplication
  - [ ] Proper error handling
  - [ ] Clean, readable code

- [ ] **Testing**
  - [ ] Adequate test coverage
  - [ ] Tests are meaningful
  - [ ] Tests are maintainable

- [ ] **Performance**
  - [ ] No unnecessary re-renders
  - [ ] Efficient selectors
  - [ ] No memory leaks

- [ ] **Backward compatibility**
  - [ ] Doesn't break existing features
  - [ ] Handles migration (if state changed)
  - [ ] Graceful degradation

## Extension Templates

### Template: Adding a New Slice

```typescript
// lib/store/slices/newSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NewState {
  // Define state shape
}

const initialState: NewState = {
  // Initial values
}

const newSlice = createSlice({
  name: 'newFeature',
  initialState,
  reducers: {
    // Add reducers
  },
})

export const { /* actions */ } = newSlice.actions
export default newSlice.reducer

// Add selectors if needed
export const selectNewFeature = (state: RootState) => state.newFeature
```

**Test Template:**
```typescript
// lib/store/slices/__tests__/newSlice.test.ts
import { newSlice, initialState } from '../newSlice'

describe('newSlice', () => {
  it('should return initial state', () => {
    expect(newSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })
  
  // Add action tests
})
```

### Template: Adding a New Module

```typescript
// modules/new-module/NewModule.tsx
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import type { ModuleProps } from '@/lib/types/dashboard'

export default function NewModule({ moduleId, config }: ModuleProps) {
  const data = useAppSelector((state) => state.newFeature.data)
  const dispatch = useAppDispatch()
  
  return (
    <div>
      {/* Module UI */}
    </div>
  )
}
```

**Registry Entry:**
```typescript
// modules/registry.tsx
const NewModule: DashboardModule = {
  type: 'new-module',
  displayName: 'New Module',
  description: 'Description here',
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 2 },
  maxGridSize: { w: 6, h: 6 },
  component: NewModuleComponent,
}
```

### Template: Cross-Module Communication

```typescript
// Option 1: Shared Slice
// Both modules read/write to same slice

// Option 2: Middleware/Listener
// modules/feature/store/listenerMiddleware.ts
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { someAction } from '../slices/someSlice'

export const featureListenerMiddleware = createListenerMiddleware()

featureListenerMiddleware.startListening({
  actionCreator: someAction,
  effect: async (action, listenerApi) => {
    // React to action
    const state = listenerApi.getState()
    // Dispatch other actions if needed
  },
})
```

## Common Pitfalls to Avoid

- ❌ **Mutating state directly** - Always use Redux Toolkit's Immer
- ❌ **Skipping tests** - Write tests first (TDD)
- ❌ **Breaking existing functionality** - Test thoroughly
- ❌ **Creating circular dependencies** - Plan integration points
- ❌ **Storing computed values** - Use selectors instead
- ❌ **Forgetting to persist state** - Check localStorageMiddleware
- ❌ **Not handling edge cases** - Test error scenarios
- ❌ **Ignoring TypeScript errors** - Fix all type issues

## Quick Reference

### Commands
```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm build

# Lint
pnpm lint

# Inspect state structure
node scripts/inspect-state.js
```

### Key Files
- `lib/store/store.ts` - Store configuration
- `modules/registry.tsx` - Module registry
- `lib/store/slices/` - Redux slices
- `lib/test-utils.tsx` - Test utilities
- `ARCHITECTURE_GUIDE.md` - Architecture documentation

### Useful Tools
- Redux DevTools browser extension
- TypeScript language server
- Vitest UI for test debugging
- Browser DevTools for localStorage inspection

