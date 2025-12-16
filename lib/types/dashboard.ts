import { ReactNode } from "react";
import type { Layout } from "react-grid-layout";

export type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

/**
 * A module instance on a dashboard
 * Note: gridPosition is no longer stored here - it's derived from Dashboard.layouts using selectors
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
  layouts?: Partial<Record<Breakpoint, Layout[]>>;
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
  minGridSize?: { w: number; h: number };
  maxGridSize?: { w: number; h: number };
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
  onClose?: () => void;
}

/**
 * Link type for Detail module
 */
export type DetailLinkType = 'internal' | 'external';

/**
 * Link definition for Detail module
 */
export interface DetailLink {
  type: DetailLinkType;
  url: string;
  label?: string;
}

/**
 * Config for the Detail module
 */
export interface DetailModuleConfig {
  title: string;
  content: string;
  imageUrls?: string[];
  links?: DetailLink[];
  color?: string;
}

/**
 * UI state
 */
export interface UiState {
  activeDashboardId: string | null;
  moduleConfigPanel: { moduleId: string } | null;
}

