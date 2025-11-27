# Dashboard

A modular dashboard application built with Next.js, Redux, and Tailwind CSS. Create custom dashboards with drag-and-drop modules that can communicate with each other.

## Features

- 📊 Multi-dashboard system
- 🧩 Modular widget system
- 🔄 Redux state management for cross-module communication
- 🎨 Tailwind CSS for styling
- 💾 LocalStorage persistence
- ⌨️ TypeScript for type safety

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Redux Toolkit**
- **Tailwind CSS**
- **react-grid-layout** (for drag-and-drop)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
pnpm build
pnpm start
```

### Testing

This project uses **Vitest** with **React Testing Library** for component testing.

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

#### Test Structure

- Tests are located alongside components in `__tests__` directories
- Test utilities are in `/lib/test-utils.tsx` (includes Redux store setup)
- Vitest configuration is in `vitest.config.ts`
- Global test setup is in `vitest.setup.ts`

#### Example Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Project Structure

```
/app                    # Next.js app router
/components
  /layout              # Dashboard layout components
  /modules             # Module components
/lib
  /store               # Redux store setup
  /types               # TypeScript types
/modules               # Module definitions/registry
```

## Documentation

### For Understanding the Project

- **[QUICK_START.md](./QUICK_START.md)** - Start here! Quick overview and getting started guide
- **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** - Complete architecture documentation
  - State structure and interactions
  - Component hierarchy
  - Module system architecture
  - Extension patterns and best practices

### For Extending the Project

- **[EXTENSION_CHECKLIST.md](./EXTENSION_CHECKLIST.md)** - Step-by-step extension guide
  - Pre-development planning
  - Test-driven development workflow
  - Code review checklist
  - Extension templates

### For Visualizing State

- **[DATA_FLOW_DIAGRAM.md](./DATA_FLOW_DIAGRAM.md)** - Visual data flow diagrams
- **State Inspection Script:**
  ```bash
  node scripts/inspect-state.js        # Full overview
  node scripts/inspect-state.js slices # Just slices
  node scripts/inspect-state.js modules # Just modules
  ```

## Development Roadmap

- [x] Project setup and configuration
- [x] TypeScript types and interfaces
- [x] Redux store structure
- [x] Module registry system
- [x] Base layout components
- [x] Dashboard tabs (macOS-style)
- [x] Add module dropdown
- [x] Drag-and-drop functionality
- [x] LocalStorage persistence
- [x] Welcome dashboard with test module
- [x] Timer module integration
- [x] Todo module
- [x] Quote module
- [ ] DateTime module
- [ ] Weather module

## License

ISC

