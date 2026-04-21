import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/lib/test-utils";
import type { ComponentProps } from "react";
import type { Dashboard } from "@/lib/types/dashboard";
import MainMenuPanel from "../menu-panels/MainMenuPanel";

const dashboards: Dashboard[] = [
  { id: "board-1", name: "Board 1", pinned: true, modules: [], layouts: {} },
  { id: "board-2", name: "Board 2", pinned: false, modules: [], layouts: {} },
];

function renderPanel(overrides: Partial<ComponentProps<typeof MainMenuPanel>> = {}) {
  const onClose = vi.fn();
  const onLogout = vi.fn();
  const onOpenSettings = vi.fn();
  const onSelectDashboard = vi.fn();
  const onTogglePinned = vi.fn();
  const onRemoveDashboard = vi.fn();

  render(
    <MainMenuPanel
      username="Martin Bearman"
      isAuthenticated
      onClose={onClose}
      onLogout={onLogout}
      sortedDashboards={dashboards}
      activeDashboardId="board-1"
      getInitials={(name) => name.slice(0, 2).toUpperCase()}
      onOpenSettings={onOpenSettings}
      onSelectDashboard={onSelectDashboard}
      onTogglePinned={onTogglePinned}
      onRemoveDashboard={onRemoveDashboard}
      {...overrides}
    />
  );

  return { onClose, onLogout, onOpenSettings, onSelectDashboard, onTogglePinned, onRemoveDashboard };
}

describe("MainMenuPanel", () => {
  it("invokes handlers for close/settings/select/pin", async () => {
    const user = userEvent.setup();
    const { onClose, onOpenSettings, onSelectDashboard, onTogglePinned } = renderPanel();

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    await user.click(screen.getByRole("button", { name: "Open settings menu" }));
    await user.click(screen.getByRole("button", { name: "Board 2" }));
    await user.click(screen.getAllByRole("button", { name: /PIN/i })[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    expect(onSelectDashboard).toHaveBeenCalledWith("board-2");
    expect(onTogglePinned).toHaveBeenCalledWith("board-2");
  });

  it("only shows remove control for non-default dashboard when multiple dashboards exist", async () => {
    const user = userEvent.setup();
    const { onRemoveDashboard } = renderPanel();

    expect(screen.queryByRole("button", { name: "Remove Board 1" })).not.toBeInTheDocument();
    const removeBoard2 = screen.getByRole("button", { name: "Remove Board 2" });
    await user.click(removeBoard2);

    expect(onRemoveDashboard).toHaveBeenCalledWith("board-2");
  });

  it("hides all remove controls when only one dashboard exists", () => {
    renderPanel({
      sortedDashboards: [{ id: "board-1", name: "Board 1", pinned: true, modules: [], layouts: {} }],
    });

    expect(screen.queryByRole("button", { name: /Remove /i })).not.toBeInTheDocument();
  });
});
