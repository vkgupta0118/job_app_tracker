import { describe, expect, it } from "vitest";
import { deriveAppliedAt, statusLabel, statusMeta } from "./status";

describe("statusMeta", () => {
  it("returns metadata for a known status", () => {
    expect(statusMeta("interview").label).toBe("Interviewing");
    expect(statusLabel("offer")).toBe("Offer");
  });

  it("throws for an unknown status (enum/metadata drift)", () => {
    // @ts-expect-error intentionally invalid to test the guard
    expect(() => statusMeta("nope")).toThrow(/Unknown application status/);
  });
});

describe("deriveAppliedAt", () => {
  const today = "2026-06-06";

  it("sets today when moving into an applied status for the first time", () => {
    expect(deriveAppliedAt("applied", null, today)).toBe(today);
    expect(deriveAppliedAt("interview", null, today)).toBe(today);
  });

  it("leaves applied_at null for not-yet-applied statuses", () => {
    expect(deriveAppliedAt("saved", null, today)).toBeNull();
    expect(deriveAppliedAt("archived", null, today)).toBeNull();
  });

  it("never overwrites an existing applied_at", () => {
    expect(deriveAppliedAt("interview", "2026-01-01", today)).toBe("2026-01-01");
    expect(deriveAppliedAt("saved", "2026-01-01", today)).toBe("2026-01-01");
  });
});
