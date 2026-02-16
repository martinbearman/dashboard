import { describe, it, expect } from "vitest";
import { makeStore } from "../../store/store";
import { addDashboard } from "../../store/slices/dashboardsSlice";
import { addModule } from "../../store/slices/dashboardsSlice";
import { setModuleConfig } from "../../store/slices/moduleConfigsSlice";
import { addLink } from "../../store/slices/moduleLinksSlice";
import DashboardService from "../dashboardService";

describe("DashboardService", () => {
  describe("removeDashboard", () => {
    it("should remove dashboard and all associated module configs", () => {
      const store = makeStore();
      const dashboardId = "board-2";

      // Create a dashboard with modules
      store.dispatch(
        addDashboard({
          id: dashboardId,
          name: "Test Board",
          modules: [],
        })
      );

      const moduleId1 = "module-1";
      const moduleId2 = "module-2";

      // Add modules to the dashboard
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId1, type: "quote" },
          initialPosition: { x: 0, y: 0, w: 3, h: 3 },
        })
      );
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId2, type: "todo" },
          initialPosition: { x: 3, y: 0, w: 3, h: 3 },
        })
      );

      // Add configs for the modules
      store.dispatch(setModuleConfig({ moduleId: moduleId1, config: { theme: "dark" } }));
      store.dispatch(setModuleConfig({ moduleId: moduleId2, config: { listName: "My List" } }));

      // Verify configs exist
      expect(store.getState().moduleConfigs.configs[moduleId1]).toBeDefined();
      expect(store.getState().moduleConfigs.configs[moduleId2]).toBeDefined();

      // Remove the dashboard
      DashboardService.removeDashboard(store.dispatch, store.getState, dashboardId);

      // Verify dashboard is removed
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeUndefined();

      // Verify module configs are removed
      expect(store.getState().moduleConfigs.configs[moduleId1]).toBeUndefined();
      expect(store.getState().moduleConfigs.configs[moduleId2]).toBeUndefined();
    });

    it("should remove dashboard and all associated module links", () => {
      const store = makeStore();
      const dashboardId = "board-3";

      // Create a dashboard with modules
      store.dispatch(
        addDashboard({
          id: dashboardId,
          name: "Test Board",
          modules: [],
        })
      );

      const moduleId1 = "module-3";
      const moduleId2 = "module-4";
      const moduleId3 = "module-5";

      // Add modules to the dashboard
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId1, type: "quote" },
          initialPosition: { x: 0, y: 0, w: 3, h: 3 },
        })
      );
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId2, type: "todo" },
          initialPosition: { x: 3, y: 0, w: 3, h: 3 },
        })
      );
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId3, type: "completed" },
          initialPosition: { x: 6, y: 0, w: 3, h: 3 },
        })
      );

      // Add links between modules
      store.dispatch(
        addLink({
          sourceModuleId: moduleId1,
          targetModuleId: moduleId2,
          pattern: "data-provider",
        })
      );
      store.dispatch(
        addLink({
          sourceModuleId: moduleId2,
          targetModuleId: moduleId3,
          pattern: "active-item-tracker",
        })
      );

      // Verify links exist
      const linksBefore = Object.values(store.getState().moduleLinks.links);
      expect(linksBefore.length).toBeGreaterThan(0);
      const linksInvolvingModules = linksBefore.filter(
        (link) =>
          link.sourceModuleId === moduleId1 ||
          link.sourceModuleId === moduleId2 ||
          link.sourceModuleId === moduleId3 ||
          link.targetModuleId === moduleId1 ||
          link.targetModuleId === moduleId2 ||
          link.targetModuleId === moduleId3
      );
      expect(linksInvolvingModules.length).toBe(2);

      // Remove the dashboard
      DashboardService.removeDashboard(store.dispatch, store.getState, dashboardId);

      // Verify dashboard is removed
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeUndefined();

      // Verify links involving these modules are removed
      const linksAfter = Object.values(store.getState().moduleLinks.links);
      const remainingLinksInvolvingModules = linksAfter.filter(
        (link) =>
          link.sourceModuleId === moduleId1 ||
          link.sourceModuleId === moduleId2 ||
          link.sourceModuleId === moduleId3 ||
          link.targetModuleId === moduleId1 ||
          link.targetModuleId === moduleId2 ||
          link.targetModuleId === moduleId3
      );
      expect(remainingLinksInvolvingModules.length).toBe(0);
    });

    it("should remove dashboard with both configs and links", () => {
      const store = makeStore();
      const dashboardId = "board-4";

      // Create a dashboard with modules
      store.dispatch(
        addDashboard({
          id: dashboardId,
          name: "Test Board",
          modules: [],
        })
      );

      const moduleId1 = "module-6";
      const moduleId2 = "module-7";

      // Add modules
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId1, type: "quote" },
          initialPosition: { x: 0, y: 0, w: 3, h: 3 },
        })
      );
      store.dispatch(
        addModule({
          dashboardId,
          module: { id: moduleId2, type: "todo" },
          initialPosition: { x: 3, y: 0, w: 3, h: 3 },
        })
      );

      // Add configs
      store.dispatch(setModuleConfig({ moduleId: moduleId1, config: { theme: "dark" } }));
      store.dispatch(setModuleConfig({ moduleId: moduleId2, config: { listName: "My List" } }));

      // Add link
      store.dispatch(
        addLink({
          sourceModuleId: moduleId1,
          targetModuleId: moduleId2,
          pattern: "data-provider",
        })
      );

      // Verify everything exists
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeDefined();
      expect(store.getState().moduleConfigs.configs[moduleId1]).toBeDefined();
      expect(store.getState().moduleConfigs.configs[moduleId2]).toBeDefined();
      const linksBefore = Object.values(store.getState().moduleLinks.links);
      expect(linksBefore.length).toBeGreaterThan(0);

      // Remove the dashboard
      DashboardService.removeDashboard(store.dispatch, store.getState, dashboardId);

      // Verify everything is cleaned up
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeUndefined();
      expect(store.getState().moduleConfigs.configs[moduleId1]).toBeUndefined();
      expect(store.getState().moduleConfigs.configs[moduleId2]).toBeUndefined();
      const linksAfter = Object.values(store.getState().moduleLinks.links);
      const linksInvolvingModules = linksAfter.filter(
        (link) =>
          link.sourceModuleId === moduleId1 ||
          link.sourceModuleId === moduleId2 ||
          link.targetModuleId === moduleId1 ||
          link.targetModuleId === moduleId2
      );
      expect(linksInvolvingModules.length).toBe(0);
    });

    it("should not remove board-1 (default dashboard)", () => {
      const store = makeStore();
      const defaultDashboardId = "board-1";

      // Verify default dashboard exists
      const dashboardBefore = store.getState().dashboards.dashboards[defaultDashboardId];
      expect(dashboardBefore).toBeDefined();

      // Try to remove it
      DashboardService.removeDashboard(store.dispatch, store.getState, defaultDashboardId);

      // Verify it still exists
      const dashboardAfter = store.getState().dashboards.dashboards[defaultDashboardId];
      expect(dashboardAfter).toBeDefined();
      expect(dashboardAfter).toEqual(dashboardBefore);
    });

    it("should handle non-existent dashboard gracefully", () => {
      const store = makeStore();
      const nonExistentId = "board-999";

      // Verify it doesn't exist
      expect(store.getState().dashboards.dashboards[nonExistentId]).toBeUndefined();

      // Try to remove it (should not throw)
      expect(() => {
        DashboardService.removeDashboard(store.dispatch, store.getState, nonExistentId);
      }).not.toThrow();

      // Verify state is unchanged
      expect(store.getState().dashboards.dashboards[nonExistentId]).toBeUndefined();
    });

    it("should handle dashboard with no modules", () => {
      const store = makeStore();
      const dashboardId = "board-5";

      // Create an empty dashboard
      store.dispatch(
        addDashboard({
          id: dashboardId,
          name: "Empty Board",
          modules: [],
        })
      );

      // Verify it exists
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeDefined();

      // Remove it
      DashboardService.removeDashboard(store.dispatch, store.getState, dashboardId);

      // Verify it's removed
      expect(store.getState().dashboards.dashboards[dashboardId]).toBeUndefined();
    });

    it("should not affect other dashboards when removing one", () => {
      const store = makeStore();
      const dashboardId1 = "board-6";
      const dashboardId2 = "board-7";

      // Create two dashboards
      store.dispatch(
        addDashboard({
          id: dashboardId1,
          name: "Board 1",
          modules: [],
        })
      );
      store.dispatch(
        addDashboard({
          id: dashboardId2,
          name: "Board 2",
          modules: [],
        })
      );

      const moduleId1 = "module-8";
      const moduleId2 = "module-9";

      // Add modules to both dashboards
      store.dispatch(
        addModule({
          dashboardId: dashboardId1,
          module: { id: moduleId1, type: "quote" },
          initialPosition: { x: 0, y: 0, w: 3, h: 3 },
        })
      );
      store.dispatch(
        addModule({
          dashboardId: dashboardId2,
          module: { id: moduleId2, type: "todo" },
          initialPosition: { x: 0, y: 0, w: 3, h: 3 },
        })
      );

      // Add configs
      store.dispatch(setModuleConfig({ moduleId: moduleId1, config: { theme: "dark" } }));
      store.dispatch(setModuleConfig({ moduleId: moduleId2, config: { listName: "List 2" } }));

      // Remove first dashboard
      DashboardService.removeDashboard(store.dispatch, store.getState, dashboardId1);

      // Verify first dashboard and its module config are removed
      expect(store.getState().dashboards.dashboards[dashboardId1]).toBeUndefined();
      expect(store.getState().moduleConfigs.configs[moduleId1]).toBeUndefined();

      // Verify second dashboard and its module config still exist
      expect(store.getState().dashboards.dashboards[dashboardId2]).toBeDefined();
      expect(store.getState().moduleConfigs.configs[moduleId2]).toBeDefined();
    });
  });
});
