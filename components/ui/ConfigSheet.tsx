"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { closeModuleConfigPanel } from "@/lib/store/slices/uiSlice";
import { updateModuleConfig } from "@/lib/store/slices/moduleConfigsSlice";
import { getModuleByType } from "@/modules/registry";

export default function ConfigSheet() {
  const dispatch = useAppDispatch();
  const moduleConfigPanel = useAppSelector((state) => state.ui.moduleConfigPanel);
  const moduleConfigs = useAppSelector((state) => state.moduleConfigs.configs);
  
  // Get active dashboard to find module type
  const { activeDashboardId, dashboards } = useAppSelector((state) => state.dashboards);
  const active = activeDashboardId ? dashboards[activeDashboardId] : null;
  
  const isOpen = moduleConfigPanel !== null;
  const moduleId = moduleConfigPanel?.moduleId;
  
  // Find the module instance to get its type
  const moduleInstance = active?.modules.find((m) => m.id === moduleId);
  const moduleMeta = moduleInstance ? getModuleByType(moduleInstance.type) : null;
  const ConfigPanel = moduleMeta?.configPanel;
  const moduleConfig = moduleId ? (moduleConfigs[moduleId] ?? {}) : {};

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeModuleConfigPanel());
    }
  };

  const handleConfigChange = (config: Record<string, any>) => {
    if (moduleId) {
      dispatch(updateModuleConfig({ moduleId, config }));
    }
  };

  const handleClose = () => {
    dispatch(closeModuleConfigPanel());
  };

  if (!ConfigPanel || !moduleId) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="config-sheet-overlay fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="config-sheet-content fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Configure Module
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  aria-label="Close configuration"
                >
                  ×
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <ConfigPanel
                moduleId={moduleId}
                config={moduleConfig}
                onConfigChange={handleConfigChange}
                onClose={handleClose}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

