import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { supabase } from "./supabase";
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "./applications";

vi.mock("./supabase", () => ({
  supabase: { from: vi.fn() },
}));

/**
 * A query builder where every method is chainable and the builder itself is
 * awaitable, resolving to the given `{ data, error }`. This mirrors Supabase's
 * fluent API regardless of which chain a call uses.
 */
function makeBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "order",
    "insert",
    "update",
    "delete",
    "eq",
    "single",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  (builder as { then: unknown }).then = (resolve: (v: unknown) => unknown) =>
    resolve(result);
  return builder;
}

const mockFrom = supabase.from as unknown as Mock;

beforeEach(() => {
  mockFrom.mockReset();
});

describe("listApplications", () => {
  it("returns rows on success", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    mockFrom.mockReturnValue(makeBuilder({ data: rows, error: null }));

    await expect(listApplications()).resolves.toEqual(rows);
    expect(mockFrom).toHaveBeenCalledWith("applications");
  });

  it("throws (no silent failure) when Supabase returns an error", async () => {
    mockFrom.mockReturnValue(
      makeBuilder({ data: null, error: { message: "boom" } }),
    );
    await expect(listApplications()).rejects.toThrow(/boom/);
  });
});

describe("createApplication", () => {
  it("returns the created row", async () => {
    const row = { id: "1", company: "Acme" };
    mockFrom.mockReturnValue(makeBuilder({ data: row, error: null }));

    await expect(
      createApplication({ company: "Acme", role: "Eng" }),
    ).resolves.toEqual(row);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue(
      makeBuilder({ data: null, error: { message: "nope" } }),
    );
    await expect(
      createApplication({ company: "Acme", role: "Eng" }),
    ).rejects.toThrow(/nope/);
  });
});

describe("updateApplication", () => {
  it("returns the updated row", async () => {
    const row = { id: "1", status: "offer" };
    mockFrom.mockReturnValue(makeBuilder({ data: row, error: null }));

    await expect(
      updateApplication("1", { status: "offer" }),
    ).resolves.toEqual(row);
  });
});

describe("deleteApplication", () => {
  it("resolves on success and throws on error", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }));
    await expect(deleteApplication("1")).resolves.toBeUndefined();

    mockFrom.mockReturnValue(
      makeBuilder({ data: null, error: { message: "fail" } }),
    );
    await expect(deleteApplication("1")).rejects.toThrow(/fail/);
  });
});
