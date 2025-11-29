# Quick Start: Understanding Your Dashboard Project

This guide helps you quickly understand the current state of your project and how to extend it reliably.

## 🎯 Understanding the Current State

### 1. Visualize State Structure

Run the state inspection script:

```bash
node scripts/inspect-state.js
```

This shows:
- All Redux slices and their actions
- All registered modules
- Store configuration
- Complete state structure

**Options:**
```bash
node scripts/inspect-state.js slices    # Just slices
node scripts/inspect-state.js modules   # Just modules
node scripts/inspect-state.js actions   # Just actions
node scripts/inspect-state.js store    # Just store config
```

### 2. Use Redux DevTools

**Install:**
- Chrome: [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- Firefox: [Redux DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

**Usage:**
1. Open browser DevTools
2. Go to "Redux" tab
3. See all actions, state changes, and time-travel debug

### 3. Inspect localStorage

**In Browser:**
```
DevTools → Application → Local Storage → http://localhost:3000
Key: "dashboard-state"
```

**In Console:**
```javascript
JSON.parse(localStorage.getItem('dashboard-state'))
```

## 📊 Current State Overview

### Redux Store Structure

```
RootState
├── dashboards      → Dashboard & module layout management
├── globalConfig    → Theme & global settings
├── moduleConfigs   → Per-module configuration
├── todo            → Todo list data
├── timer           → Timer module state
└── goal            → Goal tracking state
```

### Module Registry

Currently registered modules:
- **Timer** - Pomodoro timer
- **Todo** - Todo list management
- **Completed** - Completed tasks view
- **Quote** - Motivational quotes
- **Art** - Artwork display

### Key Integration Points

1. **Timer ↔ Todo Integration**
   - Timer can set active goal on todos
   - Timer completes sessions that update todo time tracking
   - Uses `timerListenerMiddleware` for event-driven updates

2. **Todo ↔ Completed Integration**
   - Completed module reads `selectCompletedTodos` selector
   - Shared `todoSlice` state

3. **Module System**
   - All modules registered in `modules/registry.tsx`
   - Modules receive `moduleId` and `config` as props
   - Modules read/write to Redux store directly

## 🚀 Extending the System

### Step-by-Step Process

1. **Plan** (5-10 min)
   - Read `ARCHITECTURE_GUIDE.md` relevant sections
   - Use `EXTENSION_CHECKLIST.md` to plan
   - Identify state requirements

2. **Test First** (15-30 min)
   - Write tests for new slice/feature
   - Run tests (they should fail initially)
   - This ensures you understand requirements

3. **Implement** (30-60 min)
   - Implement slice/component
   - Run tests frequently
   - Fix issues as they arise

4. **Integrate** (15-30 min)
   - Add to store (if new slice)
   - Register module (if new module)
   - Test integration

5. **Validate** (10-15 min)
   - Manual testing
   - State inspection
   - Type checking

### Quick Extension Examples

#### Example 1: Add a New Action to Todo Slice

```typescript
// 1. Add reducer to todoSlice.ts
reducers: {
  // ... existing
  archiveTodo: (state, action: PayloadAction<string>) => {
    const todo = state.todos.find(t => t.id === action.payload)
    if (todo) todo.archived = true
  }
}

// 2. Export action
export const { /* ... */ archiveTodo } = todoSlice.actions

// 3. Write test
it('should archive a todo', () => {
  const state = todoReducer(initialState, archiveTodo('todo-1'))
  expect(state.todos.find(t => t.id === 'todo-1')?.archived).toBe(true)
})

// 4. Use in component
dispatch(archiveTodo(todoId))
```

#### Example 2: Add a New Module

```typescript
// 1. Create module component
// modules/notes/NotesModule.tsx
export default function NotesModule({ moduleId, config }: ModuleProps) {
  const notes = useAppSelector((state) => state.notes.items)
  // ... component logic
}

// 2. Create slice (if needed)
// lib/store/slices/notesSlice.ts
// ... slice implementation

// 3. Register module
// modules/registry.tsx
const NotesModule: DashboardModule = {
  type: 'notes',
  displayName: 'Notes',
  description: 'Take quick notes',
  defaultGridSize: { w: 3, h: 4 },
  component: NotesModuleComponent,
}

// 4. Add to registry array
export const moduleRegistry: DashboardModule[] = [
  // ... existing
  NotesModule,
]
```

## 🧪 Testing Workflow

### Run Tests

```bash
# All tests
pnpm test

# Watch mode (recommended during development)
pnpm test --watch

# Specific test file
pnpm test todoSlice.test.ts

# With UI (great for debugging)
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### Test Structure

```
__tests__/
├── slices/           → Redux slice tests
├── components/       → Component tests
└── integration/      → Cross-module tests
```

### Writing Tests

**Slice Test Example:**
```typescript
import { todoReducer, createTodo } from '../todoSlice'

describe('todoSlice', () => {
  it('should create a todo', () => {
    const state = todoReducer(
      { todos: [] },
      createTodo({ description: 'Test' })
    )
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0].description).toBe('Test')
  })
})
```

**Component Test Example:**
```typescript
import { render, screen } from '@/lib/test-utils'
import { makeStore } from '@/lib/store/store'
import TodoModule from '../TodoModule'

it('should render todos', () => {
  const store = makeStore({
    todo: { todos: [{ id: '1', description: 'Test', ... }] }
  })
  render(<TodoModule moduleId="m-1" />, { store })
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

## 📚 Documentation Reference

- **`ARCHITECTURE_GUIDE.md`** - Complete architecture documentation
  - State structure details
  - Component interaction maps
  - Extension patterns
  - Best practices

- **`EXTENSION_CHECKLIST.md`** - Step-by-step extension guide
  - Pre-development checklist
  - Development phases
  - Testing requirements
  - Code review checklist

- **`DATA_FLOW_DIAGRAM.md`** - Visual data flow diagrams
  - Mermaid diagrams
  - Sequence diagrams
  - State flow visualization

## 🔍 Debugging Tips

### State Not Updating?

1. Check Redux DevTools - see if action was dispatched
2. Verify reducer is handling the action
3. Check component is using `useAppSelector` correctly
4. Verify middleware isn't blocking the action

### Module Not Rendering?

1. Check module is in `moduleRegistry`
2. Verify `module.type` matches registry entry
3. Check component export is correct
4. Verify module was added to dashboard

### Type Errors?

1. Run `pnpm build` to see all TypeScript errors
2. Check `RootState` type includes your slice
3. Verify action payload types match
4. Check import paths are correct

### Tests Failing?

1. Check test setup in `vitest.setup.ts`
2. Verify store is created correctly in test
3. Check test-utils are imported correctly
4. Run with `--ui` flag to debug interactively

## 🎓 Learning Path

### For Understanding Current State

1. **Start here:** Run `node scripts/inspect-state.js`
2. **Visualize:** Open Redux DevTools in browser
3. **Read:** `ARCHITECTURE_GUIDE.md` - "Complete State Structure"
4. **Explore:** Look at existing slice implementations

### For Making Extensions

1. **Plan:** Use `EXTENSION_CHECKLIST.md`
2. **Study:** Look at similar existing features
3. **Test First:** Write tests before implementation
4. **Implement:** Follow the checklist step-by-step
5. **Validate:** Test thoroughly before moving on

### For Complex Extensions

1. **Read:** `ARCHITECTURE_GUIDE.md` - "Extension Methodology"
2. **Map:** Draw out state flow for your feature
3. **Break Down:** Split into smaller, testable pieces
4. **Test Each Piece:** Don't move on until tests pass
5. **Integrate:** Combine pieces with integration tests

## 🛠️ Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build and type-check
pnpm lint                   # Run linter

# Testing
pnpm test                   # Run tests
pnpm test:ui                # Test UI
pnpm test:coverage          # Coverage report

# State Inspection
node scripts/inspect-state.js        # Full state overview
node scripts/inspect-state.js slices   # Just slices
node scripts/inspect-state.js modules  # Just modules

# Version Management
pnpm sync-version           # Sync version across files
pnpm version:patch          # Bump patch version
```

## 💡 Pro Tips

1. **Always test first** - Write tests before implementation (TDD)
2. **Use Redux DevTools** - Essential for understanding state flow
3. **Check localStorage** - Verify persistence is working
4. **Run tests frequently** - Catch issues early
5. **Follow the checklist** - Don't skip steps
6. **Read existing code** - Learn from similar features
7. **Keep it simple** - Start small, iterate
8. **Document as you go** - Update docs with changes

## 🆘 Getting Help

### When Stuck

1. **Inspect state** - Use `node scripts/inspect-state.js`
2. **Check DevTools** - See what's actually happening
3. **Read docs** - Check `ARCHITECTURE_GUIDE.md`
4. **Look at examples** - Find similar code in codebase
5. **Run tests** - Tests often reveal the issue

### Common Questions

**Q: Where should I put new state?**
A: Check `ARCHITECTURE_GUIDE.md` - "State Design" section. Generally:
- Module-specific → module's slice
- Shared across modules → shared slice
- Per-instance config → `moduleConfigs` slice

**Q: How do modules communicate?**
A: Via shared Redux slices or middleware/listeners. See `ARCHITECTURE_GUIDE.md` - "Cross-Module Communication"

**Q: How do I test cross-module interactions?**
A: Create integration tests. See `ARCHITECTURE_GUIDE.md` - "Testing Strategy"

**Q: My state isn't persisting?**
A: Check `localStorageMiddleware` is in middleware chain. Verify localStorage is available (not SSR).

---

**Next Steps:**
1. Run `node scripts/inspect-state.js` to see current state
2. Install Redux DevTools browser extension
3. Read `ARCHITECTURE_GUIDE.md` for detailed information
4. Use `EXTENSION_CHECKLIST.md` for your next extension

