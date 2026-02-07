import { describe, it, expect } from "vitest";
import { makeStore } from "../../store";
import { setModuleConfig } from "../../slices/moduleConfigsSlice";
import { populateContentList } from "../dashboardThunks";

describe("populateContentList", () => {
  it("should update module config with items", () => {
    const store = makeStore();
    const moduleId = "test-module-123";

    // Seed initial config (simulating an existing content-list module)
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
