# Architecture Guide: Understanding and Extending the Dashboard

## Table of Contents
1. [Complete State Structure](#complete-state-structure)
2. [Component Interaction Map](#component-interaction-map)
3. [Module System Architecture](#module-system-architecture)
4. [State Flow Visualization](#state-flow-visualization)
5. [Extension Methodology](#extension-methodology)
6. [Testing Strategy](#testing-strategy)
7. [Tools for State Inspection](#tools-for-state-inspection)

---

## Complete State Structure

### Root State (`RootState`)

The complete application state is defined in `lib/store/store.ts`:

```typescript
type RootState = {
  dashboards: DashboardsState      // Dashboard and module layout management
  globalConfig: GlobalConfigState   // Theme and global settings
  moduleConfigs: ModuleConfigsState // Per-module configuration
  todo: TodoState                  // Todo list data
  timer: TimerState                // Timer module state
  goal: GoalState                  // Goal tracking state
}
```

### 1. Dashboards State (`dashboardsSlice`)

**Location:** `lib/store/slices/dashboardsSlice.ts`

**Structure:**
```typescript
{
  activeDashboardId: string | null
  dashboards: Record<string, Dashboard>
}

// Dashboard structure:
{
  id: string
  name: string
  modules: ModuleInstance[]
  layouts?: Partial<Record<Breakpoint, Layout[]>>
}

// ModuleInstance structure:
{
  id: string
  type: string  // Maps to moduleRegistry
  gridPosition: { x: number, y: number, w: number, h: number }
}
```

**Key Actions:**
- `addDashboard` - Create a new dashboard
- `setActiveDashboard` - Switch active dashboard
- `addModule` - Add module to dashboard
- `removeModule` - Remove module from dashboard
- `updateModulePosition` - Update module grid position
- `updateDashboardLayouts` - Update responsive layouts
- `removeDashboard` - Delete a dashboard

**Dependencies:**
- Uses `moduleRegistry` to validate module types
- Manages responsive layouts for 5 breakpoints: `lg`, `md`, `sm`, `xs`, `xxs`

---

### 2. Global Config State (`globalConfigSlice`)

**Location:** `lib/store/slices/globalConfigSlice.ts`

**Structure:**
```typescript
{
  theme: "light" | "dark"
  // ... other global settings
}
```

**Key Actions:**
- `setTheme` - Change application theme

---

### 3. Module Configs State (`moduleConfigsSlice`)

**Location:** `lib/store/slices/moduleConfigsSlice.ts`

**Structure:**
```typescript
{
  configs: Record<string, ModuleConfig>  // moduleId -> config
}

// ModuleConfig structure:
{
  locked: boolean  // Always present
  // ... module-specific config fields
}
```

**Key Actions:**
- `setModuleConfig` - Set complete config for a module
- `updateModuleConfig` - Partially update module config
- `removeModuleConfig` - Remove config when module is deleted

**Usage:**
- Modules read their config via `useAppSelector((state) => state.moduleConfigs.configs[moduleId])`
- Config is passed to modules via `ModuleProps.config`

---

### 4. Todo State (`todoSlice`)

**Location:** `lib/store/slices/todoSlice.ts`

**Structure:**
```typescript
{
  todos: Todo[]
}

// Todo structure:
{
  id: string
  description: string
  completed: boolean
  createdAt: number
  priority: 'low' | 'medium' | 'high' | null
  dueDate: number | null
  totalTimeStudied: number  // Seconds
  sessions: TodoSession[]    // Pomodoro sessions
  isActiveGoal: boolean      // Currently being timed
}
```

**Key Actions:**
- `createTodo` - Create new todo
- `toggleTodo` - Toggle completion
- `updateTodo` - Update description
- `updateTodoPriority` - Change priority
- `updateTodoDueDate` - Set due date
- `setActiveGoal` - Mark todo as active for timer
- `completeSession` - Record Pomodoro session
- `deleteTodo` - Remove todo

**Selectors:**
- `selectTodos` - All todos
- `selectIncompleteTodos` - Filter incomplete
- `selectCompletedTodos` - Filter completed

**Cross-Module Integration:**
- Timer module can set `isActiveGoal` on todos
- Completed module reads `selectCompletedTodos`

---

### 5. Timer State (`timerSlice`)

**Location:** `modules/timer/store/slices/timerSlice.ts`

**Structure:**
```typescript
{
  timeRemaining: number      // Seconds
  isRunning: boolean
  isBreak: boolean
  studyDuration: number      // Seconds
  breakDuration: number      // Seconds
  studyElapsedTime: number   // Seconds
  breakElapsedTime: number   // Seconds
  showBreakPrompt: boolean
  breakMode: 'automatic' | 'manual' | 'none'
}
```

**Key Actions:**
- `start`, `pause`, `reset`, `stop` - Timer control
- `toggleMode` - Switch study/break
- `setStudyDuration`, `setBreakDuration` - Configure durations
- `updateElapsedTime` - Track elapsed time
- `startBreak`, `skipBreak` - Break management

**Cross-Module Integration:**
- Listens to goal changes via `timerListenerMiddleware`
- Can complete sessions on active todo goals

---

### 6. Goal State (`goalSlice`)

**Location:** `modules/timer/store/slices/goalSlice.ts`

**Structure:**
```typescript
{
  activeGoalId: string | null
  goals: Goal[]
  // ... goal tracking data
}
```

**Key Actions:**
- Goal management actions
- Integrates with timer and todo modules

---

## Component Interaction Map

### Component Hierarchy

```
app/layout.tsx
└── StoreProvider (lib/store/StoreProvider.tsx)
    └── app/page.tsx (Home)
        ├── DashboardTabs (components/layout/DashboardTabs.tsx)
        ├── ResponsiveGridLayout (react-grid-layout)
        │   └── ModuleWrapper (components/modules/ModuleWrapper.tsx)
        │       ├── ModuleActionsMenu
        │       └── Module Component (from registry)
        │           ├── TimerModule
        │           ├── TodoModule
        │           ├── CompletedModule
        │           ├── QuoteModule
        │           └── ArtModule
        ├── AddModuleButton (components/layout/AddModuleButton.tsx)
        └── AppVersion (components/layout/AppVersion.tsx)
```

### Data Flow Patterns

#### 1. Reading State
```typescript
// Components read state using typed hooks
const data = useAppSelector((state) => state.dashboards)
const todos = useAppSelector(selectIncompleteTodos)
```

#### 2. Writing State
```typescript
// Components dispatch actions
const dispatch = useAppDispatch()
dispatch(addModule({ dashboardId, module }))
dispatch(createTodo({ description: "..." }))
```

#### 3. Module Communication
- **Direct State Sharing:** Modules read/write to shared slices (e.g., `todo`, `timer`)
- **Event-Driven:** Middleware/listeners react to actions (e.g., `timerListenerMiddleware`)
- **No Direct Props:** Modules don't pass props to each other; they communicate via Redux

---

## Module System Architecture

### Module Registry Pattern

**Location:** `modules/registry.tsx`

All modules are registered in a central registry:

```typescript
const moduleRegistry: DashboardModule[] = [
  TimerModule,
  TodoModule,
  CompletedModule,
  QuoteModule,
  ArtModule,
]
```

### Module Definition

```typescript
interface DashboardModule {
  type: string                    // Unique identifier
  displayName: string             // User-facing name
  description: string
  defaultGridSize: { w: number, h: number }
  minGridSize?: { w: number, h: number }
  maxGridSize?: { w: number, h: number }
  component: React.ComponentType<ModuleProps>
  configPanel?: React.ComponentType<ModuleConfigProps>
}
```

### Module Props

```typescript
interface ModuleProps {
  moduleId: string                // Unique instance ID
  config?: Record<string, any>    // Module-specific config
}
```

### Module Lifecycle

1. **Registration:** Module added to `moduleRegistry`
2. **Instantiation:** User adds module via `AddModuleButton`
3. **Rendering:** `ModuleWrapper` renders module component
4. **Configuration:** Module reads/writes to Redux store
5. **Persistence:** State auto-saved to localStorage

---

## State Flow Visualization

### Initialization Flow

```
1. Browser loads app
   ↓
2. StoreProvider mounts (client-side only)
   ↓
3. loadState() from localStorage
   ↓
4. makeStore(preloadedState) initializes Redux
   ↓
5. Components mount and subscribe to store
   ↓
6. useAppSelector() reads initial state
```

### State Update Flow

```
1. User interaction (click, input, etc.)
   ↓
2. Component dispatches action
   ↓
3. Redux reducer updates state
   ↓
4. localStorageMiddleware saves to localStorage
   ↓
5. React-Redux notifies subscribers
   ↓
6. Components re-render with new state
```

### Cross-Module Communication Flow

```
Example: Timer completes session for active todo

1. Timer module dispatches timer action
   ↓
2. timerListenerMiddleware intercepts
   ↓
3. Middleware reads activeGoalId from goal slice
   ↓
4. Middleware dispatches completeSession(todoId, duration)
   ↓
5. todoSlice updates todo.totalTimeStudied
   ↓
6. Todo module re-renders with updated time
```

---

## Extension Methodology

### Phase 1: Planning & Design

#### Step 1: Define Requirements
- [ ] What data needs to be stored?
- [ ] What actions are needed?
- [ ] Which modules need to interact?
- [ ] What UI components are required?

#### Step 2: State Design
- [ ] Create TypeScript interfaces for new state
- [ ] Identify which slice to extend or if new slice needed
- [ ] Map out action creators needed
- [ ] Consider selectors for derived data

#### Step 3: Integration Points
- [ ] Identify existing modules that need to interact
- [ ] Plan middleware/listeners if needed
- [ ] Map out component hierarchy

### Phase 2: Implementation (Test-Driven)

#### Step 1: Write Tests First
```typescript
// Example: Adding a new feature
describe('newFeatureSlice', () => {
  it('should handle initial state', () => {
    // Test initial state
  })
  
  it('should handle action X', () => {
    // Test action
  })
})
```

#### Step 2: Implement Slice
- Create or extend slice
- Implement reducers
- Export actions and selectors
- Add to store if new slice

#### Step 3: Test Slice
```bash
pnpm test newFeatureSlice.test.ts
```

#### Step 4: Implement Components
- Create component files
- Use `useAppSelector` and `useAppDispatch`
- Test components in isolation

#### Step 5: Integration Testing
- Test component + store integration
- Test cross-module interactions
- Test edge cases

### Phase 3: Module Extension Pattern

#### Adding a New Module

1. **Create Module Directory**
   ```
   modules/new-module/
   ├── NewModule.tsx
   ├── components/
   │   └── NewModuleDisplay.tsx
   └── lib/
       └── utils.ts
   ```

2. **Create Module Component**
   ```typescript
   export default function NewModule({ moduleId, config }: ModuleProps) {
     const data = useAppSelector((state) => state.newModule.data)
     const dispatch = useAppDispatch()
     // ... component logic
   }
   ```

3. **Register Module**
   ```typescript
   // modules/registry.tsx
   const NewModule: DashboardModule = {
     type: "new-module",
     displayName: "New Module",
     description: "...",
     defaultGridSize: { w: 3, h: 3 },
     component: NewModuleComponent,
   }
   ```

4. **Add to Store (if needed)**
   ```typescript
   // lib/store/store.ts
   import newModuleReducer from "./slices/newModuleSlice"
   
   const rootReducer = combineReducers({
     // ... existing
     newModule: newModuleReducer,
   })
   ```

5. **Write Tests**
   - Test module component
   - Test slice actions
   - Test integration

### Phase 4: Extending Existing Modules

#### Pattern: Adding Features to Todo Module

1. **Extend State Interface**
   ```typescript
   // lib/store/slices/todoSlice.ts
   export interface Todo {
     // ... existing fields
     newField: string  // Add new field
   }
   ```

2. **Add Action**
   ```typescript
   reducers: {
     // ... existing
     updateNewField: (state, action: PayloadAction<{ id: string; newField: string }>) => {
       const todo = state.todos.find(t => t.id === action.payload.id)
       if (todo) todo.newField = action.payload.newField
     }
   }
   ```

3. **Update Component**
   ```typescript
   // modules/todo/TodoModule.tsx
   dispatch(updateNewField({ id, newField: value }))
   ```

4. **Test Changes**
   - Test new action
   - Test component update
   - Test backward compatibility

---

## Testing Strategy

### Test Structure

```
__tests__/
├── slices/
│   ├── dashboardsSlice.test.ts
│   ├── todoSlice.test.ts
│   └── ...
├── components/
│   ├── ModuleWrapper.test.tsx
│   └── ...
└── integration/
    └── module-interactions.test.ts
```

### Testing Levels

#### 1. Unit Tests (Slices)
```typescript
describe('todoSlice', () => {
  it('should create a todo', () => {
    const state = todoReducer(initialState, createTodo({ description: 'Test' }))
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0].description).toBe('Test')
  })
})
```

#### 2. Component Tests
```typescript
describe('TodoModule', () => {
  it('should render todos', () => {
    const store = makeStore({
      todo: { todos: [{ id: '1', description: 'Test', ... }] }
    })
    render(<TodoModule moduleId="m-1" />, { store })
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

#### 3. Integration Tests
```typescript
describe('Timer-Todo Integration', () => {
  it('should complete session on active todo', () => {
    const store = makeStore()
    // Setup: create todo, set as active goal, start timer
    // Action: complete timer session
    // Assert: todo.totalTimeStudied updated
  })
})
```

### Test Utilities

**Location:** `lib/test-utils.tsx`

```typescript
import { render } from '@/lib/test-utils'

// Renders component with Redux store
render(<Component />, { store: customStore })
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test todoSlice.test.ts
```

---

## Tools for State Inspection

### 1. Redux DevTools (Recommended)

Install browser extension:
- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

**Usage:**
- Inspect state tree
- Time-travel debugging
- Action replay
- State diff visualization

### 2. localStorage Inspector

**Browser DevTools:**
```
Application → Local Storage → http://localhost:3000
Key: "dashboard-state"
```

**Manual Inspection:**
```typescript
// In browser console
JSON.parse(localStorage.getItem('dashboard-state'))
```

### 3. State Logger Middleware (Development)

Add to `lib/store/store.ts`:

```typescript
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

// Add to middleware chain (dev only)
if (process.env.NODE_ENV === 'development') {
  middleware = middleware.concat(loggerMiddleware)
}
```

### 4. Component State Inspector

Create a debug component:

```typescript
// components/debug/StateInspector.tsx
export function StateInspector() {
  const state = useAppSelector((s) => s)
  return (
    <details>
      <summary>State Inspector</summary>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </details>
  )
}
```

### 5. TypeScript Type Inspection

Use IDE features:
- Hover over `RootState` to see full type
- Use "Go to Definition" on state properties
- Use TypeScript errors to catch state mismatches

---

## Common Extension Patterns

### Pattern 1: Adding a New Slice

```typescript
// 1. Create slice file
// lib/store/slices/newSlice.ts
const newSlice = createSlice({
  name: 'newFeature',
  initialState: { data: [] },
  reducers: { /* ... */ }
})

// 2. Add to store
// lib/store/store.ts
import newReducer from './slices/newSlice'
const rootReducer = combineReducers({
  // ... existing
  newFeature: newReducer,
})

// 3. Export types
export type RootState = ReturnType<typeof rootReducer>
```

### Pattern 2: Cross-Module Communication

```typescript
// Option A: Shared Slice (for closely related data)
// Both modules read/write to same slice

// Option B: Middleware/Listener (for event-driven)
// modules/timer/store/listenerMiddleware.ts
const listenerMiddleware = createListenerMiddleware()
listenerMiddleware.startListening({
  actionCreator: someAction,
  effect: async (action, listenerApi) => {
    // React to action, dispatch other actions
  }
})
```

### Pattern 3: Module-Specific State

```typescript
// Option A: Module config (for per-instance settings)
dispatch(updateModuleConfig({ 
  moduleId, 
  config: { customSetting: value } 
}))

// Option B: Dedicated slice (for complex module state)
// Create slice in module directory
// Add to root reducer
```

---

## Best Practices

### State Management
- ✅ Keep state normalized (avoid nested duplicates)
- ✅ Use selectors for derived data
- ✅ Keep reducers pure (no side effects)
- ✅ Use TypeScript for type safety
- ❌ Don't mutate state directly
- ❌ Don't store computed values in state

### Module Development
- ✅ Keep modules independent when possible
- ✅ Use shared slices for cross-module data
- ✅ Follow the module registry pattern
- ✅ Test modules in isolation
- ❌ Don't create circular dependencies
- ❌ Don't access other modules' internal state directly

### Testing
- ✅ Write tests before implementation (TDD)
- ✅ Test slices independently
- ✅ Test component integration
- ✅ Test edge cases and error states
- ❌ Don't skip integration tests
- ❌ Don't test implementation details

### Extension Planning
- ✅ Start with state design
- ✅ Plan integration points early
- ✅ Write tests first
- ✅ Implement in small, testable increments
- ✅ Document new patterns
- ❌ Don't add features without tests
- ❌ Don't break existing functionality

---

## Troubleshooting Guide

### Issue: State not persisting
- Check `localStorageMiddleware` is in middleware chain
- Verify `localStorage` is available (not SSR)
- Check browser console for errors

### Issue: Module not rendering
- Verify module is in `moduleRegistry`
- Check module type matches `ModuleInstance.type`
- Verify module component is exported correctly

### Issue: State updates not reflecting
- Check component is using `useAppSelector`
- Verify action is dispatched correctly
- Check reducer is handling action

### Issue: Type errors
- Run `pnpm build` to see all TypeScript errors
- Check `RootState` type includes new slices
- Verify action payload types match

---

## Next Steps

1. **Set up Redux DevTools** for state inspection
2. **Review existing tests** to understand patterns
3. **Create a test for your extension** before implementing
4. **Start with a small change** to build confidence
5. **Document your changes** as you go

---

## Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

