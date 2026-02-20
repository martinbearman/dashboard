# Nested Grid Module Example

This example demonstrates how to create a module with draggable elements inside it using nested `react-grid-layout` grids.

## Key Implementation Details

### 1. Event Isolation

The nested grid must prevent drag events from bubbling to the parent grid:

```typescript
onDragStart={(layout, oldItem, newItem, placeholder, e, element) => {
  e.stopPropagation(); // Critical!
}}
```

### 2. CSS Scoping

Use a unique className for the nested grid to avoid CSS conflicts:

```typescript
<ResponsiveGridLayout className="nested-grid-layout" ...>
```

You may want to add scoped styles:

```css
.nested-grid-layout .react-grid-item {
  /* Nested grid specific styles */
}
```

### 3. Separate Drag Handle

Use a different drag handle class to avoid conflicts with the parent grid:

```typescript
draggableHandle=".nested-drag-handle" // Different from parent's ".module-drag-handle"
```

### 4. Independent Layout State

Manage nested grid layout separately from the parent grid:

```typescript
const [nestedLayout, setNestedLayout] = useState<Layout[]>([...]);
```

### 5. Smaller Grid Configuration

Use smaller dimensions for nested grids:

```typescript
cols={4}        // vs parent's 12
rowHeight={60}  // vs parent's 100
margin={[8, 8]} // vs parent's [12, 12]
```

## Adding to Module Registry

To use this module, add it to `modules/registry.tsx`:

```typescript
import NestedGridModuleComponent from "./nested-grid/NestedGridModule";

const NestedGridModule: DashboardModule = {
  type: "nested-grid",
  displayName: "Nested Grid",
  description: "Module with draggable elements inside",
  defaultGridSize: { w: 6, h: 4 },
  minGridSize: { w: 4, h: 3 },
  maxGridSize: { w: 8, h: 6 },
  component: NestedGridModuleComponent,
};
```

## Important Considerations

1. **Performance**: Nested grids can impact performance with many items
2. **Responsive**: Consider if nested grid needs responsive breakpoints
3. **Persistence**: Store nested layout in module config if needed
4. **Z-index**: Ensure nested grid items don't interfere with parent grid handles
5. **Touch Support**: Test on mobile devices for touch interactions

## Alternative Approaches

If you don't need full grid functionality, consider:
- **react-beautiful-dnd**: For simple drag-and-drop lists
- **react-sortable-hoc**: For sortable lists
- **dnd-kit**: Modern drag-and-drop library with better nested support
