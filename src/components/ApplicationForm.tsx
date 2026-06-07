import { useState, type FormEvent } from "react";
import type {
  ApplicationInsert,
  ApplicationRow,
  ApplicationStatus,
} from "../../supabase/types";
import { STATUS_META } from "../lib/status";

interface ApplicationFormProps {
  /** When provided, the form edits this row; otherwise it creates a new one. */
  initial?: ApplicationRow;
  /** Preselected status for a new application (e.g. the column it's added to). */
  defaultStatus?: ApplicationStatus;
  onSubmit: (input: ApplicationInsert) => Promise<void> | void;
  onCancel?: () => void;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function ApplicationForm({
  initial,
  defaultStatus,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(
    initial?.status ?? defaultStatus ?? "saved",
  );
  const [url, setUrl] = useState(initial?.url ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [salaryNote, setSalaryNote] = useState(initial?.salary_note ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = Boolean(initial);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (company.trim() === "" || role.trim() === "") {
      setFormError("Company and role are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        company: company.trim(),
        role: role.trim(),
        status,
        url: emptyToNull(url),
        location: emptyToNull(location),
        salary_note: emptyToNull(salaryNote),
        notes: emptyToNull(notes),
      });
      if (!isEdit) {
        // Reset for the next entry.
        setCompany("");
        setRole("");
        setStatus(defaultStatus ?? "saved");
        setUrl("");
        setLocation("");
        setSalaryNote("");
        setNotes("");
      }
    } catch {
      setFormError("Could not save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="app-form" onSubmit={handleSubmit} aria-label="Application">
      <div className="app-form__row">
        <label>
          Company *
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </label>
        <label>
          Role *
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="app-form__row">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {STATUS_META.map((meta) => (
              <option key={meta.value} value={meta.value}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
      </div>

      <div className="app-form__row">
        <label>
          Posting URL
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Salary note
          <input
            value={salaryNote}
            onChange={(e) => setSalaryNote(e.target.value)}
          />
        </label>
      </div>

      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </label>

      {formError && (
        <p className="app-form__error" role="alert">
          {formError}
        </p>
      )}

      <div className="app-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add application"}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
