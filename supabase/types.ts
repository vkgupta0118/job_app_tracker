// Database types — single source of truth for the `applications` table.
// Keep in sync with supabase/migrations/. See .claude/rules/database.md.

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screen"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

/**
 * A row as stored in / returned from the database.
 * Declared as a `type` (not `interface`) so it satisfies Supabase's
 * `Record<string, unknown>` table constraint — interfaces lack the implicit
 * index signature and would resolve the client to `never`.
 */
export type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  url: string | null;
  location: string | null;
  salary_note: string | null;
  notes: string | null;
  applied_at: string | null; // ISO date (YYYY-MM-DD)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

/** Fields accepted when inserting. Server fills the rest. */
export type ApplicationInsert = {
  company: string;
  role: string;
  status?: ApplicationStatus;
  url?: string | null;
  location?: string | null;
  salary_note?: string | null;
  notes?: string | null;
  applied_at?: string | null;
};

/** Fields accepted when updating. */
export type ApplicationUpdate = Partial<ApplicationInsert>;

// Minimal shape Supabase's generated `Database` type expects, so the client
// is typed without pulling in the full generator.
export type Database = {
  public: {
    Tables: {
      applications: {
        Row: ApplicationRow;
        Insert: ApplicationInsert;
        Update: ApplicationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
