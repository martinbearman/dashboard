import { describe, it, expect } from "vitest";
import { makeStore } from "../../store";
import { setModuleConfig } from "../../slices/moduleConfigsSlice";
import {
  nextPosition,
  addModuleToDashboard,
  populateContentList,
} from "../dashboardThunks";

const BOARD_ID = "board-1";

describe("nextPosition", () => {
  it("returns default 3x3 at origin when existing is empty", () => {
    expect(nextPosition([])).toEqual({ x: 0, y: 0, w: 3, h: 3 });
  });

  it("places next module to the right of the only existing one", () => {
    const existing = [{ x: 0, y: 0, w: 2, h: 2 }];
    expect(nextPosition(existing)).toEqual({ x: 2, y: 0, w: 2, h: 2 });
  });

  it("wraps to next row when there is no room on current row (lg=8 cols)", () => {
    const existing = [{ x: 6, y: 0, w: 2, h: 2 }];
    expect(nextPosition(existing)).toEqual({ x: 0, y: 2, w: 2, h: 2 });
  });

  it("uses bottom-right by position, not array order", () => {
    const existing = [
      { x: 4, y: 2, w: 2, h: 1 },
      { x: 0, y: 0, w: 2, h: 2 },
    ];
    expect(nextPosition(existing)).toEqual({ x: 6, y: 2, w: 2, h: 1 });
  });

  it("places after rightmost on same row with multiple items", () => {
    const existing = [
      { x: 0, y: 0, w: 2, h: 2 },
      { x: 2, y: 0, w: 2, h: 2 },
      { x: 4, y: 0, w: 2, h: 2 },
    ];
    expect(nextPosition(existing)).toEqual({ x: 6, y: 0, w: 2, h: 2 });
  });
});

describe("addModuleToDashboard", () => {
  it("adds a module and returns its id when no position is given", () => {
    const store = makeStore();
    const moduleId = store.dispatch(
      addModuleToDashboard({ dashboardId: BOARD_ID, type: "quote" })
    );
    expect(typeof moduleId).toBe("string");
    expect(moduleId.length).toBeGreaterThan(0);

    const dashboard = store.getState().dashboards.dashboards[BOARD_ID];
    expect(dashboard.modules).toHaveLength(5);
    const added = dashboard.modules.find((m) => m.id === moduleId);
    expect(added).toBeDefined();
    expect(added?.type).toBe("quote");

    const lgLayout = dashboard.layouts?.lg ?? [];
    const layoutItem = lgLayout.find((item) => item.i === moduleId);
    expect(layoutItem).toBeDefined();
    expect(layoutItem).toMatchObject({ w: 3, h: 3 });
  });

  it("uses explicit position when provided", () => {
    const store = makeStore();
    const moduleId = store.dispatch(
      addModuleToDashboard({
        dashboardId: BOARD_ID,
        type: "quote",
        position: { x: 1, y: 2, w: 2, h: 2 },
      })
    );
    const dashboard = store.getState().dashboards.dashboards[BOARD_ID];
    const lgLayout = dashboard.layouts?.lg ?? [];
    const layoutItem = lgLayout.find((item) => item.i === moduleId);
    expect(layoutItem).toMatchObject({ x: 1, y: 2, w: 2, h: 2 });
  });

  it("defaults ai-output config to empty items", () => {
    const store = makeStore();
    const moduleId = store.dispatch(
      addModuleToDashboard({ dashboardId: BOARD_ID, type: "ai-output" })
    );
    const config = store.getState().moduleConfigs.configs[moduleId];
    expect(config).toBeDefined();
    expect(config.items).toEqual([]);
  });

  it("throws when dashboard does not exist", () => {
    const store = makeStore();
    expect(() =>
      store.dispatch(
        addModuleToDashboard({ dashboardId: "no-such-board", type: "quote" })
      )
    ).toThrow("Dashboard not found: no-such-board");
  });
});

describe("populateContentList", () => {
  it("should update module config with items", () => {
    const store = makeStore();
    const moduleId = "test-module-123";

    // Seed initial config (simulating an existing ai-output module)
    store.dispatch(setModuleConfig({ moduleId, config: { title: "Item List", items: [] } }));

    const items = [
      { text: "First item" },
      { text: "Second item", url: "https://example.com" },
      { text: "Done item", done: true },
    ];

    store.dispatch(populateContentList(moduleId, items, "My List"));

    const state = store.getState();
    const config = state.moduleConfigs.configs[moduleId];

    expect(config).toBeDefined();
    expect(config.title).toBe("My List");
    expect(config.items).toHaveLength(3);
    expect(config.items[0]).toEqual({ text: "First item" });
    expect(config.items[1]).toEqual({ text: "Second item", url: "https://example.com" });
    expect(config.items[2]).toEqual({ text: "Done item", done: true });
  });

  it("should update items without changing title when title is omitted", () => {
    const store = makeStore();
    const moduleId = "test-module-456";

    store.dispatch(
      setModuleConfig({ moduleId, config: { title: "Original Title", items: [] } })
    );

    store.dispatch(populateContentList(moduleId, [{ text: "New item" }]));

    const config = store.getState().moduleConfigs.configs[moduleId];
    expect(config.title).toBe("Original Title");
    expect(config.items).toEqual([{ text: "New item" }]);
  });
});
