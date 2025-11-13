import { DashboardModule } from "@/lib/types/dashboard";
import TimerModuleComponent from "./timer/TimerModule";

// Timer module - component lives in modules/timer/ folder
const TimerModule: DashboardModule = {
  type: "timer",
  displayName: "Timer",
  description: "Pomodoro-style timer for focused work sessions",
  defaultGridSize: { w: 3, h: 2 },
  component: TimerModuleComponent,
};

// Placeholder modules - create folders for these when implementing
const TodoModule: DashboardModule = {
  type: "todo",
  displayName: "Todo List",
  description: "Manage your tasks and stay organized",
  defaultGridSize: { w: 4, h: 3 },
  component: () => <div className="p-4 bg-green-100 rounded">Todo Module</div>,
};

const QuoteModule: DashboardModule = {
  type: "quote",
  displayName: "Motivational Quote",
  description: "Get inspired with daily motivational quotes",
  defaultGridSize: { w: 3, h: 2 },
  component: () => <div className="p-4 bg-purple-100 rounded">Quote Module</div>,
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

