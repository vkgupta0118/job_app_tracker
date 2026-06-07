import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ApplicationsProvider, useApplications } from "./ApplicationsContext";
import * as repo from "../lib/applications";
import type { ApplicationRow } from "../../supabase/types";

vi.mock("../lib/applications");

const mocked = vi.mocked(repo);

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

const wrapper = ({ children }: { children: ReactNode }) => (
  <ApplicationsProvider>{children}</ApplicationsProvider>
);

async function renderLoaded(initial: ApplicationRow[]) {
  mocked.listApplications.mockResolvedValue(initial);
  const view = renderHook(() => useApplications(), { wrapper });
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ApplicationsProvider", () => {
  it("loads applications on mount", async () => {
    const { result } = await renderLoaded([row()]);
    expect(result.current.applications).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a load error instead of failing silently", async () => {
    mocked.listApplications.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useApplications(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("offline");
  });

  it("prepends a created application", async () => {
    const { result } = await renderLoaded([]);
    mocked.createApplication.mockResolvedValue(row({ id: "2", company: "New" }));

    await act(async () => {
      await result.current.addApplication({ company: "New", role: "Eng" });
    });

    expect(result.current.applications[0].company).toBe("New");
  });

  it("stamps applied_at when moving an application to applied", async () => {
    const { result } = await renderLoaded([row({ id: "1", status: "saved" })]);
    mocked.updateApplication.mockImplementation(async (id, patch) =>
      row({ id, ...patch }),
    );

    await act(async () => {
      await result.current.changeStatus("1", "applied");
    });

    expect(mocked.updateApplication).toHaveBeenCalledTimes(1);
    const [, patch] = mocked.updateApplication.mock.calls[0];
    expect(patch.status).toBe("applied");
    expect(patch.applied_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("removes a deleted application from state", async () => {
    const { result } = await renderLoaded([row({ id: "1" })]);
    mocked.deleteApplication.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.removeApplication("1");
    });

    expect(result.current.applications).toHaveLength(0);
  });
});
