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
 * Module capability - describes what a module can do
 * Used for linking modules and LLM understanding
 */
export interface ModuleCapability {
  /** Unique identifier for the capability (e.g., 'can-track-active-item') */
  id: string;
  /** Human-readable name */
  displayName: string;
  /** Description of what this capability enables */
  description: string;
  /** Semantic tags for search/discovery */
  semanticTags?: string[];
  /** Example use cases */
  useCases?: string[];
}

/**
 * Link pattern types - describe the nature of relationships between modules
 */
export type LinkPattern =
  | 'active-item-tracker'    // Source tracks active/selected item in target
  | 'event-source'           // Source emits events that target listens to
  | 'data-provider'          // Source provides data to target
  | 'content-display'        // Target displays content from source
  | 'scheduler'              // Source schedules/times events for target
  | 'selection-follower'     // Target follows selection changes in source
  | 'command-executor'       // Source executes commands on target
  | 'custom';                // Custom pattern with metadata

/**
 * Link pattern definition with metadata
 */
export interface LinkPatternDefinition {
  /** Pattern identifier */
  id: LinkPattern;
  /** Human-readable name */
  displayName: string;
  /** Description of the relationship pattern */
  description: string;
  /** Example use cases for LLM/human understanding */
  examples?: string[];
  /** Semantic tags */
  semanticTags?: string[];
  /** Required capabilities for source and target modules */
  requiredCapabilities?: {
    source?: string[];  // Capability IDs
    target?: string[];  // Capability IDs
  };
}

/**
 * Metadata stored with a module link
 */
export interface LinkMetadata {
  // Pattern-specific metadata
  activeItemId?: string | null;  // For 'active-item-tracker': which item is active
  listId?: string;               // For list-based patterns: which list
  timerId?: string;              // For timer patterns: which timer instance
  scheduleId?: string;           // For scheduler patterns: which schedule
  
  // Generic metadata
  label?: string;                // Human-readable label for the link
  enabled?: boolean;             // Can disable links without deleting
  priority?: number;             // For multiple links of same pattern
  
  // Extensible
  [key: string]: any;
}

/**
 * A link between two modules
 */
export interface ModuleLink {
  /** Unique identifier for this link */
  id: string;
  /** Source module ID (the module that initiates the link) */
  sourceModuleId: string;
  /** Target module ID (the module that receives the link) */
  targetModuleId: string;
  /** The pattern type of this link */
  pattern: LinkPattern;
  /** Pattern-specific metadata */
  metadata: LinkMetadata;
  /** When this link was created */
  createdAt: number;
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
  
  /**
   * Capabilities this module supports (for linking and LLM understanding)
   * Optional - modules can be added without capabilities initially
   */
  capabilities?: {
    /** Capabilities when this module is the source of a link */
    asSource?: ModuleCapability[];
    /** Capabilities when this module is the target of a link */
    asTarget?: ModuleCapability[];
  };
  
  /**
   * Link patterns this module supports (optional)
   * Used for documentation and LLM context
   */
  supportedLinkPatterns?: LinkPatternDefinition[];
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
 * Single item in the ai-output module
 */
export interface ListItem {
  text: string;
  url?: string;
  done?: boolean;
}

/**
 * Config for the ai-output (Item List) module
 */
export interface ListModuleConfig {
  title?: string;
  items: ListItem[];
}

/**
 * Config for a long-form article/body module.
 * Intended for LLM-populated markdown content laid out like a magazine article.
 */
export interface ArticleBodyModuleConfig {
  /** Optional heading for the article block. */
  title?: string;
  /** Markdown content for the article body. */
  body: string;
  /** Visual emphasis level for styling (primary = main story). */
  style?: "primary" | "secondary";
}

/**
 * Config for an image module – a single image with optional caption.
 * The LLM can use either a direct URL or a logical imageRef that the app resolves.
 */
export interface ImageModuleConfig {
  /** Direct URL for the image, if known. */
  imageUrl?: string;
  /** Logical reference, e.g. image://upload-1, that the host app can resolve. */
  imageRef?: string;
  /** Accessible alt text describing the image. */
  alt?: string;
  /** Optional visible caption shown under the image. */
  caption?: string;
  /** Photographer name (for Unsplash images). */
  photographerName?: string;
  /** Photographer profile URL (for Unsplash images). */
  photographerUrl?: string;
  /** Link to the Unsplash photo page (for Unsplash images). */
  unsplashPhotoUrl?: string;
}

/**
 * Config for a pull-quote module – highlighted short quote with attribution.
 */
export interface PullQuoteModuleConfig {
  /** The quoted text to display. */
  quote: string;
  /** Who or what the quote is attributed to. */
  attribution?: string;
  /** Visual emphasis level for styling. */
  emphasis?: "low" | "medium" | "high";
}

/**
 * Single stat/metric inside a stat-block module.
 */
export interface StatBlockItem {
  label: string;
  value: string;
}

/**
 * Config for a stat-block module – compact list of key numbers/specs.
 */
export interface StatBlockModuleConfig {
  title?: string;
  items: StatBlockItem[];
}

/**
 * UI state
 */
export interface UiState {
  activeDashboardId: string | null;
  moduleConfigPanel: { moduleId: string } | null;
}
