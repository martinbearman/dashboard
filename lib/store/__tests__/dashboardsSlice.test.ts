import { describe, expect, it } from "vitest";
import dashboardsReducer, {
  createInitialDashboardsState,
  updateDashboardMeta,
  toggleDashboardPinned,
} from "../slices/dashboardsSlice";

describe("dashboardsSlice", () => {
  it("seeds board-1 with expected metadata defaults", () => {
    const state = createInitialDashboardsState();
    const board = state.dashboards["board-1"];

    expect(board).toBeDefined();
    expect(board.shortName).toBe("B1");
    expect(board.group).toBe("General");
    expect(board.pinned).toBe(true);
  });

  it("updates only dashboard metadata fields via updateDashboardMeta", () => {
    const initialState = createInitialDashboardsState();
    const nextState = dashboardsReducer(
      initialState,
      updateDashboardMeta({
        dashboardId: "board-1",
        changes: {
          shortName: "MAIN",
          group: "Work",
          pinned: false,
        },
      })
    );

    expect(nextState.dashboards["board-1"]).toMatchObject({
      id: "board-1",
      name: "Board 1",
      shortName: "MAIN",
      group: "Work",
      pinned: false,
    });
  });

  it("toggles pinned state and no-ops when dashboard is missing", () => {
    const initialState = createInitialDashboardsState();
    const toggled = dashboardsReducer(initialState, toggleDashboardPinned("board-1"));
    expect(toggled.dashboards["board-1"].pinned).toBe(false);

    const unchanged = dashboardsReducer(toggled, toggleDashboardPinned("does-not-exist"));
    expect(unchanged).toEqual(toggled);
  });
});
