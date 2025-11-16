import { DashboardModule } from "@/lib/types/dashboard";
import TimerModuleComponent from "./timer/TimerModule";
import TimerConfigPanel from "./timer/app/components/Settings/TimerConfigPanel";
import QuoteModuleComponent from "./quote/QuoteModule";
import TodoModuleComponent from "./todo/TodoModule";

// Timer module - component lives in modules/timer/ folder
const TimerModule: DashboardModule = {
  type: "Timer",
  displayName: "Pomodoro Timer",
  description: "Pomodoro-style timer for focused work sessions",
  defaultGridSize: { w: 4, h: 3 },
  component: TimerModuleComponent,
  configPanel: TimerConfigPanel,
};

// Todo module - component lives in modules/todo/ folder
const TodoModule: DashboardModule = {
  type: "todo",
  displayName: "Todo List",
  description: "Manage your tasks and stay organized",
  defaultGridSize: { w: 4, h: 3 },
  component: TodoModuleComponent,
};

const QuoteModule: DashboardModule = {
  type: "quote",
  displayName: "Quotes",
  description: "Get inspired with daily motivational quotes",
  defaultGridSize: { w: 3, h: 2 },
  component: QuoteModuleComponent,
};

const DateTimeModule: DashboardModule = {
  type: "datetime",
  displayName: "Date & Time",
  description: "Display current date and time",
  defaultGridSize: { w: 2, h: 2 },
  component: () => <div className="p-4 bg-yellow-100 rounded">DateTime Module</div>,
};

const WeatherModule: DashboardModule = {
  type: "weather",
  displayName: "Weather",
  description: "Check the current weather conditions",
  defaultGridSize: { w: 3, h: 2 },
  component: () => <div className="p-4 bg-cyan-100 rounded">Weather Module</div>,
};

export const moduleRegistry: DashboardModule[] = [
  TimerModule,
  TodoModule,
  QuoteModule,
  DateTimeModule,
  WeatherModule,
];

export const getModuleByType = (type: string): DashboardModule | undefined => {
  return moduleRegistry.find((module) => module.type === type);
};

