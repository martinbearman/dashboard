import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, fireEvent } from "@/lib/test-utils";
import { makeStore } from "@/lib/store/store";
import LeftSidebarMenu from "../LeftSidebarMenu";

describe("LeftSidebarMenu", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when closed", () => {
    render(
      <LeftSidebarMenu
        isOpen={false}
        username="Martin"
        isAuthenticated
        onClose={vi.fn()}
        onLogout={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog", { name: "Dashboard menu" })).not.toBeInTheDocument();
  });

  it("selecting a dashboard updates active dashboard and closes menu", async () => {
    const onClose = vi.fn();
    const store = makeStore({
      dashboards: {
        activeDashboardId: "board-1",
        dashboards: {
          "board-1": { id: "board-1", name: "Board 1", pinned: true, modules: [], layouts: {} },
          "board-2": { id: "board-2", name: "Board 2", pinned: false, modules: [], layouts: {} },
        },
      },
    });

    render(
      <LeftSidebarMenu
        isOpen
        username="Martin"
        isAuthenticated
        onClose={onClose}
        onLogout={vi.fn()}
      />,
      { store }
    );

    fireEvent.click(screen.getByRole("button", { name: "Board 2" }));
    act(() => {
      vi.advanceTimersByTime(260);
    });

    expect(store.getState().dashboards.activeDashboardId).toBe("board-2");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape key press", () => {
    const onClose = vi.fn();
    render(
      <LeftSidebarMenu
        isOpen
        username="Martin"
        isAuthenticated
        onClose={onClose}
        onLogout={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    act(() => {
      vi.advanceTimersByTime(260);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
