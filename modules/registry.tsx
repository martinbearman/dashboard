import { DashboardModule } from "@/lib/types/dashboard";
import TimerModuleComponent from "./timer/TimerModule";
import TimerConfigPanel from "./timer/app/components/Settings/TimerConfigPanel";
import QuoteModuleComponent from "./quote/QuoteModule";
import TodoModuleComponent from "./todo/TodoModule";
import CompletedModuleComponent from "./completed/CompletedModule";
import ArtModuleComponent from "./art/ArtModule";
import TodoConfigPanel from "./todo/components/TodoConfigPanel";
import DetailModuleComponent from "./detail/DetailModule";
import DetailConfigPanel from "./detail/components/DetailConfigPanel";
import AIOutputComponent from "./list/AI-output";
import ListConfigPanel from "./list/components/ListConfigPanel";
import CompletedConfigPanel from "./completed/components/CompletedConfigPanel";

// Timer module - component lives in modules/timer/ folder
const TimerModule: DashboardModule = {
  type: "Timer",
  displayName: "Pomodoro Timer",
  description: "Pomodoro-style timer for focused work sessions",
  defaultGridSize: { w: 2, h: 4 },
  minGridSize: { w: 2, h: 4 },
  maxGridSize: { w: 3, h: 6 },
  component: TimerModuleComponent,
  configPanel: TimerConfigPanel,
};

// Todo module - component lives in modules/todo/ folder
const TodoModule: DashboardModule = {
  type: "todo",
  displayName: "List",
  description: "Create and manage customisable lists",
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 2 },
  maxGridSize: { w: 8, h: 6 },
  component: TodoModuleComponent,
  configPanel: TodoConfigPanel,
};

const CompletedModule: DashboardModule = {
  type: "completed",
  displayName: "Completed Tasks",
  description: "View your finished work at a glance",
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 2 },
  maxGridSize: { w: 8, h: 6 },
  component: CompletedModuleComponent,
  configPanel: CompletedConfigPanel,
};

const QuoteModule: DashboardModule = {
  type: "quote",
  displayName: "Quotes",
  description: "Get inspired with daily motivational quotes",
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 1 },
  maxGridSize: { w: 6, h: 4 },
  component: QuoteModuleComponent,
};

const ArtModule: DashboardModule = {
  type: "art",
  displayName: "Artwork",
  description: "Discover beautiful works of art from around the world",
  defaultGridSize: { w: 3, h: 5 },
  minGridSize: { w: 2, h: 4 },
  maxGridSize: { w: 6, h: 8 },
  component: ArtModuleComponent,
};

const DetailModule: DashboardModule = {
  type: "details",
  displayName: "Details",
  description: "Display detailed information about a module",
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 2 },
  maxGridSize: { w: 8, h: 6 },
  component: DetailModuleComponent,
  configPanel: DetailConfigPanel,
};

const AIOutputModule: DashboardModule = {
  type: "ai-output",
  displayName: "AI output",
  description: "Display a list of items from config (AI-populatable)",
  defaultGridSize: { w: 3, h: 3 },
  minGridSize: { w: 2, h: 2 },
  maxGridSize: { w: 8, h: 6 },
  component: AIOutputComponent,
  configPanel: ListConfigPanel,
};

const DateTimeModule: DashboardModule = {
  type: "datetime",
  displayName: "Date & Time",
  description: "Display current date and time",
  defaultGridSize: { w: 2, h: 2 },
  minGridSize: { w: 2, h: 1 },
  maxGridSize: { w: 4, h: 3 },
  component: () => <div className="p-4 bg-yellow-100 rounded">DateTime Module</div>,
};

const WeatherModule: DashboardModule = {
  type: "weather",
  displayName: "Weather",
  description: "Check the current weather conditions",
  defaultGridSize: { w: 3, h: 2 },
  minGridSize: { w: 2, h: 1 },
  maxGridSize: { w: 5, h: 4 },
  component: () => <div className="p-4 bg-cyan-100 rounded">Weather Module</div>,
};

export const moduleRegistry: DashboardModule[] = [
  TimerModule,
  TodoModule,
  CompletedModule,
  QuoteModule,
  ArtModule,
  DetailModule,
  AIOutputModule,
  // DateTimeModule, // Not built yet
  // WeatherModule, // Not built yet
];

export const getModuleByType = (type: string): DashboardModule | undefined => {
  return moduleRegistry.find((module) => module.type === type);
};

