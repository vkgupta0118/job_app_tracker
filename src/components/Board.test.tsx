import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Board } from "./Board";
import type { ApplicationRow } from "../../supabase/types";

function row(overrides: Partial<ApplicationRow> = {}): ApplicationRow {
  return {
    id: "1",
    company: "Acme",
    role: "Engineer",
    status: "saved",
    url: null,
    location: null,
    salary_note: null,
    notes: null,
    applied_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function noop() {}

function fakeDataTransfer() {
  return { setData: vi.fn(), getData: vi.fn(), effectAllowed: "", dropEffect: "" };
}

describe("Board", () => {
  it("renders a column per status with the relabeled headers", () => {
    render(
      <Board
        applications={[]}
        onMove={noop}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByRole("region", { name: "Wishlist" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Phone Screen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Interviewing" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state in a column with no applications", () => {
    render(
      <Board
        applications={[]}
        onMove={noop}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getAllByText("No applications").length).toBeGreaterThan(0);
  });

  it("places a card in the column matching its status", () => {
    render(
      <Board
        applications={[row({ id: "1", status: "interview", role: "Dev" })]}
        onMove={noop}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    const column = screen.getByRole("region", { name: "Interviewing" });
    expect(within(column).getByText("Dev")).toBeInTheDocument();
  });

  it("calls onAdd with the column's status when + Add is clicked", () => {
    const onAdd = vi.fn();
    render(
      <Board
        applications={[]}
        onMove={noop}
        onAdd={onAdd}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    const column = screen.getByRole("region", { name: "Applied" });
    fireEvent.click(within(column).getByRole("button", { name: "+ Add" }));
    expect(onAdd).toHaveBeenCalledWith("applied");
  });

  it("calls onMove when a card is dragged to a different column", () => {
    const onMove = vi.fn();
    render(
      <Board
        applications={[row({ id: "1", status: "saved", role: "Dev" })]}
        onMove={onMove}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );

    const card = screen.getByRole("article", { name: /Dev at Acme/ });
    const target = screen.getByRole("region", { name: "Applied" });
    const dataTransfer = fakeDataTransfer();

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragEnter(target, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    expect(onMove).toHaveBeenCalledWith("1", "applied");
  });

  it("does not call onMove when dropped on the same column", () => {
    const onMove = vi.fn();
    render(
      <Board
        applications={[row({ id: "1", status: "saved", role: "Dev" })]}
        onMove={onMove}
        onAdd={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );

    const card = screen.getByRole("article", { name: /Dev at Acme/ });
    const sameColumn = screen.getByRole("region", { name: "Wishlist" });
    const dataTransfer = fakeDataTransfer();

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(sameColumn, { dataTransfer });

    expect(onMove).not.toHaveBeenCalled();
  });
});
