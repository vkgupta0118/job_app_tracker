import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationForm } from "./ApplicationForm";

describe("ApplicationForm", () => {
  it("warns and does not submit when fields are whitespace-only", async () => {
    const onSubmit = vi.fn();
    render(<ApplicationForm onSubmit={onSubmit} />);

    // Whitespace satisfies the native `required` attribute but must fail our
    // own trim-based validation.
    await userEvent.type(screen.getByLabelText(/company/i), "   ");
    await userEvent.type(screen.getByLabelText(/^role/i), "   ");
    await userEvent.click(
      screen.getByRole("button", { name: /add application/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/required/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values and empty optionals as null", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ApplicationForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/company/i), "  Acme  ");
    await userEvent.type(screen.getByLabelText(/^role/i), "Engineer");
    await userEvent.click(
      screen.getByRole("button", { name: /add application/i }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      company: "Acme",
      role: "Engineer",
      status: "saved",
      url: null,
      location: null,
      salary_note: null,
      notes: null,
    });
  });

  it("shows 'Save changes' and prefills when editing", () => {
    const onSubmit = vi.fn();
    render(
      <ApplicationForm
        onSubmit={onSubmit}
        initial={{
          id: "1",
          company: "Globex",
          role: "PM",
          status: "interview",
          url: null,
          location: null,
          salary_note: null,
          notes: null,
          applied_at: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }}
      />,
    );

    expect(screen.getByLabelText(/company/i)).toHaveValue("Globex");
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });
});
