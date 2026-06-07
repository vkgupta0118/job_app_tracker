import type { ApplicationStatus } from "../../supabase/types";

export interface StatusMeta {
  value: ApplicationStatus;
  label: string;
  /** CSS color used for the badge / board accent. */
  color: string;
  /** Whether reaching this status implies the application has been submitted. */
  isApplied: boolean;
}

// Ordered as they appear on the board, left to right.
export const STATUS_META: StatusMeta[] = [
  { value: "saved", label: "Wishlist", color: "#64748b", isApplied: false },
  { value: "applied", label: "Applied", color: "#2563eb", isApplied: true },
  { value: "screen", label: "Phone Screen", color: "#7c3aed", isApplied: true },
  { value: "interview", label: "Interviewing", color: "#d97706", isApplied: true },
  { value: "offer", label: "Offer", color: "#16a34a", isApplied: true },
  { value: "rejected", label: "Rejected", color: "#dc2626", isApplied: true },
  { value: "archived", label: "Archived", color: "#94a3b8", isApplied: false },
];

export const STATUS_ORDER: ApplicationStatus[] = STATUS_META.map((s) => s.value);

const META_BY_VALUE = new Map(STATUS_META.map((s) => [s.value, s]));

export function statusMeta(status: ApplicationStatus): StatusMeta {
  const meta = META_BY_VALUE.get(status);
  if (!meta) {
    // Defensive: an unknown status means the enum and metadata drifted.
    throw new Error(`Unknown application status: ${status}`);
  }
  return meta;
}

export function statusLabel(status: ApplicationStatus): string {
  return statusMeta(status).label;
}

/**
 * Returns today's date (YYYY-MM-DD) when moving an application into an
 * "applied" status for the first time, otherwise the existing value.
 */
export function deriveAppliedAt(
  nextStatus: ApplicationStatus,
  currentAppliedAt: string | null,
  today: string,
): string | null {
  if (currentAppliedAt) return currentAppliedAt;
  return statusMeta(nextStatus).isApplied ? today : currentAppliedAt;
}
