import { describe, it, expect } from "vitest";
import { makeStore, type RootState } from "../../store";
import { setModuleConfig } from "../../slices/moduleConfigsSlice";
import { createInitialDashboardsState } from "../../slices/dashboardsSlice";
import {
  nextPosition,
  addModuleToDashboard,
  populateContentList,
  getContextForSelectedModules,
  buildQueryFromModuleContext,
} from "../dashboardThunks";

const BOARD_ID = "board-1";

describe("nextPosition", () => {
  it("returns default 4x3 at origin when existing is empty", () => {
    expect(nextPosition([])).toEqual({ x: 0, y: 0, w: 4, h: 3 });
  });

  it("places next module to the right of the only existing one", () => {
    const existing = [{ x: 0, y: 0, w: 2, h: 2 }];
    expect(nextPosition(existing)).toEqual({ x: 2, y: 0, w: 2, h: 2 });
  });

  it("wraps to next row when there is no room on current row (lg=12 cols)", () => {
    const existing = [{ x: 10, y: 0, w: 2, h: 2 }];
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

describe("getContextForSelectedModules", () => {
  it("returns only moduleId, type, and caption for image modules (no other image fields)", () => {
    const store = makeStore();
    const imageModuleId = store.dispatch(
      addModuleToDashboard({ dashboardId: BOARD_ID, type: "image" })
    );
    store.dispatch(
      setModuleConfig({
        moduleId: imageModuleId,
        config: {
          caption: "A sunny beach",
          alt: "Beach photo",
          photographerName: "Jane",
          unsplashPhotoUrl: "https://example.com/photo",
        },
      })
    );

    const state = store.getState();
    const context = getContextForSelectedModules(state, [imageModuleId]);

    expect(context).toHaveLength(1);
    expect(context[0]).toEqual({
      moduleId: imageModuleId,
      type: "image",
      caption: "A sunny beach",
    });
    expect(Object.keys(context[0]).sort()).toEqual(["caption", "moduleId", "type"]);
  });

  it("returns moduleId, type, title, and content for non-image modules from config", () => {
    const store = makeStore();
    store.dispatch(
      setModuleConfig({
        moduleId: "m-3",
        config: { title: "My Quote", content: "Quote body text" },
      })
    );

    const state = store.getState();
    const context = getContextForSelectedModules(state, ["m-3"]);

    expect(context).toHaveLength(1);
    expect(context[0]).toEqual({
      moduleId: "m-3",
      type: "quote",
      title: "My Quote",
      content: "Quote body text",
    });
  });

  it("uses body as content when content is missing (body fallback)", () => {
    const store = makeStore();
    store.dispatch(
      setModuleConfig({
        moduleId: "m-3",
        config: { title: "Note", body: "Body-only text" },
      })
    );

    const state = store.getState();
    const context = getContextForSelectedModules(state, ["m-3"]);

    expect(context[0].content).toBe("Body-only text");
    expect(context[0].title).toBe("Note");
  });

  it("returns empty title and content when config is missing", () => {
    const store = makeStore();
    // m-3 exists on dashboard but has no config set
    const state = store.getState();
    const context = getContextForSelectedModules(state, ["m-3"]);

    expect(context).toHaveLength(1);
    expect(context[0]).toEqual({
      moduleId: "m-3",
      type: "quote",
      title: "",
      content: "",
    });
  });

  it("returns empty title and content when config is non-object", () => {
    const store = makeStore();
    const state = store.getState();
    const badState = {
      ...state,
      moduleConfigs: {
        ...state.moduleConfigs,
        configs: { ...state.moduleConfigs.configs, "m-3": "not an object" },
      },
    } as unknown as RootState;

    const context = getContextForSelectedModules(badState, ["m-3"]);

    expect(context).toHaveLength(1);
    expect(context[0]).toEqual({
      moduleId: "m-3",
      type: "quote",
      title: "",
      content: "",
    });
  });

  it("returns empty array when selectedModuleIds is empty", () => {
    const store = makeStore();
    const state = store.getState();

    expect(getContextForSelectedModules(state, [])).toEqual([]);
  });

  it("returns empty array when there is no active dashboard", () => {
    const preloaded = {
      dashboards: { ...createInitialDashboardsState(), activeDashboardId: null as string | null },
    };
    const store = makeStore(preloaded);
    const state = store.getState();

    expect(getContextForSelectedModules(state, ["m-1"])).toEqual([]);
  });

  it("returns empty array when active dashboard does not exist in dashboards", () => {
    const preloaded = {
      dashboards: {
        activeDashboardId: "board-1",
        dashboards: {},
      },
    };
    const store = makeStore(preloaded);
    const state = store.getState();

    expect(getContextForSelectedModules(state, ["m-1"])).toEqual([]);
  });
});

describe("buildQueryFromModuleContext", () => {
  it("returns image caption/alt for image modules", () => {
    const context = [
      { moduleId: "img-1", type: "image", caption: "A sunny beach", alt: "Beach photo" },
    ];
    expect(buildQueryFromModuleContext(context)).toBe("A sunny beach");
    expect(buildQueryFromModuleContext(context, { types: ["image"] })).toBe("A sunny beach");
  });

  it("uses alt when caption is missing for images", () => {
    const context = [{ moduleId: "img-1", type: "image", alt: "Mountain view" }];
    expect(buildQueryFromModuleContext(context)).toBe("Mountain view");
  });

  it("returns title and content for non-image modules", () => {
    const context = [
      { moduleId: "m-1", type: "quote", title: "My Quote", content: "Quote body text" },
    ];
    expect(buildQueryFromModuleContext(context)).toBe("My Quote Quote body text");
  });

  it("combines multiple modules of mixed types", () => {
    const context = [
      { moduleId: "img-1", type: "image", caption: "Ocean" },
      { moduleId: "m-1", type: "note", title: "Note", content: "Some text" },
    ];
    expect(buildQueryFromModuleContext(context)).toBe("Ocean Note Some text");
  });

  it("filters by types when options.types is provided", () => {
    const context = [
      { moduleId: "img-1", type: "image", caption: "Ocean" },
      { moduleId: "m-1", type: "note", title: "Note", content: "Some text" },
    ];
    expect(buildQueryFromModuleContext(context, { types: ["image"] })).toBe("Ocean");
    expect(buildQueryFromModuleContext(context, { types: ["note"] })).toBe("Note Some text");
  });

  it("returns empty string for empty context", () => {
    expect(buildQueryFromModuleContext([])).toBe("");
    expect(buildQueryFromModuleContext([], { types: ["image"] })).toBe("");
  });
});
