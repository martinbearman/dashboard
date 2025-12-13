#!/usr/bin/env node

/**
 * State Inspection Utility
 * 
 * This script helps you visualize the current state structure
 * and understand how different parts of the application interact.
 * 
 * Usage:
 *   node scripts/inspect-state.js [command]
 * 
 * Commands:
 *   all        - Show complete state structure
 *   slices     - List all Redux slices
 *   modules    - List all registered modules
 *   actions    - List all available actions
 *   store      - Show store configuration
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(PROJECT_ROOT, filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function extractExports(fileContent, type = 'actions') {
  if (!fileContent) return [];
  
  if (type === 'actions') {
    // Extract action exports: export const { action1, action2 } = slice.actions
    const actionMatch = fileContent.match(/export\s+const\s+\{\s*([^}]+)\s*\}\s*=\s*\w+Slice\.actions/);
    if (actionMatch) {
      return actionMatch[1]
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);
    }
  }
  
  if (type === 'selectors') {
    // Extract selector exports: export const selectX = ...
    const selectorRegex = /export\s+const\s+(select\w+)\s*=/g;
    const selectors = [];
    let match;
    while ((match = selectorRegex.exec(fileContent)) !== null) {
      selectors.push(match[1]);
    }
    return selectors;
  }
  
  return [];
}

function inspectStore() {
  logSection('STORE CONFIGURATION');
  
  const storeContent = readFile('lib/store/store.ts');
  if (!storeContent) {
    log('❌ Could not read store.ts', 'red');
    return;
  }
  
  // Extract reducers
  const reducerMatches = storeContent.matchAll(/import\s+(\w+)Reducer\s+from\s+['"]([^'"]+)['"]/g);
  const reducers = Array.from(reducerMatches);
  
  log('Redux Slices:', 'cyan');
  reducers.forEach((match, index) => {
    const [, name, importPath] = match;
    log(`  ${index + 1}. ${name}`, 'green');
    log(`     Path: ${importPath}`, 'dim');
  });
  
  // Extract middleware
  const middlewareMatches = storeContent.matchAll(/import\s+.*Middleware\s+from\s+['"]([^'"]+)['"]/g);
  const middlewares = Array.from(middlewareMatches);
  
  if (middlewares.length > 0) {
    log('\nMiddleware:', 'cyan');
    middlewares.forEach((match, index) => {
      const [, importPath] = match;
      log(`  ${index + 1}. ${importPath}`, 'green');
    });
  }
}

function inspectSlices() {
  logSection('REDUX SLICES');
  
  const slices = [
    { name: 'dashboards', path: 'lib/store/slices/dashboardsSlice.ts' },
    { name: 'globalConfig', path: 'lib/store/slices/globalConfigSlice.ts' },
    { name: 'moduleConfigs', path: 'lib/store/slices/moduleConfigsSlice.ts' },
    { name: 'todo', path: 'lib/store/slices/todoSlice.ts' },
    { name: 'timer', path: 'modules/timer/store/slices/timerSlice.ts' },
  ];
  
  slices.forEach(slice => {
    const content = readFile(slice.path);
    if (!content) {
      log(`❌ ${slice.name}: File not found`, 'red');
      return;
    }
    
    log(`${slice.name}`, 'cyan');
    log(`  Path: ${slice.path}`, 'dim');
    
    // Extract state interface
    const stateInterfaceMatch = content.match(/(?:interface|type)\s+(\w+State)\s*[={]/);
    if (stateInterfaceMatch) {
      log(`  State Type: ${stateInterfaceMatch[1]}`, 'dim');
    }
    
    // Extract actions
    const actions = extractExports(content, 'actions');
    if (actions.length > 0) {
      log(`  Actions (${actions.length}):`, 'yellow');
      actions.forEach(action => {
        log(`    - ${action}`, 'dim');
      });
    }
    
    // Extract selectors
    const selectors = extractExports(content, 'selectors');
    if (selectors.length > 0) {
      log(`  Selectors (${selectors.length}):`, 'yellow');
      selectors.forEach(selector => {
        log(`    - ${selector}`, 'dim');
      });
    }
    
    console.log();
  });
}

function inspectModules() {
  logSection('MODULE REGISTRY');
  
  const registryContent = readFile('modules/registry.tsx');
  if (!registryContent) {
    log('❌ Could not read registry.tsx', 'red');
    return;
  }
  
  // Extract module definitions
  const moduleRegex = /const\s+(\w+Module):\s*DashboardModule\s*=\s*\{[\s\S]*?type:\s*['"]([^'"]+)['"][\s\S]*?displayName:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
  let match;
  let moduleCount = 0;
  
  while ((match = moduleRegex.exec(registryContent)) !== null) {
    moduleCount++;
    const [, varName, type, displayName] = match;
    log(`${moduleCount}. ${displayName}`, 'cyan');
    log(`   Type: ${type}`, 'dim');
    log(`   Variable: ${varName}`, 'dim');
    
    // Check if module has config panel
    const hasConfigPanel = match[0].includes('configPanel:');
    if (hasConfigPanel) {
      log(`   ✓ Has config panel`, 'green');
    }
    
    console.log();
  }
  
  log(`Total modules: ${moduleCount}`, 'bright');
}

function inspectActions() {
  logSection('AVAILABLE ACTIONS');
  
  const slices = [
    { name: 'dashboards', path: 'lib/store/slices/dashboardsSlice.ts' },
    { name: 'globalConfig', path: 'lib/store/slices/globalConfigSlice.ts' },
    { name: 'moduleConfigs', path: 'lib/store/slices/moduleConfigsSlice.ts' },
    { name: 'todo', path: 'lib/store/slices/todoSlice.ts' },
    { name: 'timer', path: 'modules/timer/store/slices/timerSlice.ts' },
  ];
  
  const allActions = [];
  
  slices.forEach(slice => {
    const content = readFile(slice.path);
    if (content) {
      const actions = extractExports(content, 'actions');
      actions.forEach(action => {
        allActions.push({ slice: slice.name, action });
      });
    }
  });
  
  // Group by slice
  const grouped = allActions.reduce((acc, item) => {
    if (!acc[item.slice]) acc[item.slice] = [];
    acc[item.slice].push(item.action);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([slice, actions]) => {
    log(`${slice}`, 'cyan');
    actions.forEach(action => {
      log(`  - ${action}`, 'dim');
    });
    console.log();
  });
  
  log(`Total actions: ${allActions.length}`, 'bright');
}

function inspectAll() {
  logSection('COMPLETE STATE STRUCTURE');
  
  log('This is a comprehensive overview of your application state.\n', 'dim');
  
  inspectStore();
  inspectSlices();
  inspectModules();
  inspectActions();
  
  logSection('STATE FLOW SUMMARY');
  
  log('1. State Initialization:', 'cyan');
  log('   StoreProvider → loadState() → makeStore() → Components', 'dim');
  
  log('\n2. State Updates:', 'cyan');
  log('   Component → dispatch(action) → Reducer → Middleware → localStorage', 'dim');
  
  log('\n3. State Reading:', 'cyan');
  log('   Component → useAppSelector() → Redux Store', 'dim');
  
  log('\n4. Module Communication:', 'cyan');
  log('   Modules communicate via shared Redux slices', 'dim');
  log('   Event-driven communication via middleware/listeners', 'dim');
}

// Main
const command = process.argv[2] || 'all';

switch (command) {
  case 'slices':
    inspectSlices();
    break;
  case 'modules':
    inspectModules();
    break;
  case 'actions':
    inspectActions();
    break;
  case 'store':
    inspectStore();
    break;
  case 'all':
  default:
    inspectAll();
    break;
}

console.log('\n');

