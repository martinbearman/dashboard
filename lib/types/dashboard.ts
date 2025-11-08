import { ReactNode } from "react";

/**
 * A module instance on a dashboard
 */
export interface ModuleInstance {
  id: string;
  type: string;
}

/**
 * A dashboard containing multiple modules
 */
export interface Dashboard {
  id: string;
  name: string;
  modules: ModuleInstance[];
}

/**
 * Module metadata and component definition
 */
export interface DashboardModule {
  type: string;
  displayName: string;
  description: string;
  icon?: ReactNode;
  defaultGridSize: { w: number; h: number };
  component: React.ComponentType<ModuleProps>;
  configPanel?: React.ComponentType<ModuleConfigProps>;
}

/**
 * Props passed to each module component
 */
export interface ModuleProps {
  moduleId: string;
  config?: Record<string, any>;
}

/**
 * Props passed to module config panels
 */
export interface ModuleConfigProps {
  moduleId: string;
  config: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
}

