import { supabase } from "./supabase";
import type {
  ApplicationInsert,
  ApplicationRow,
  ApplicationUpdate,
} from "../../supabase/types";

const TABLE = "applications";

/**
 * The only place that talks to Supabase for applications. Every call checks
 * `error` and throws — no silent failures (see CLAUDE.md rules).
 */

export async function listApplications(): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load applications: ${error.message}`);
  return data ?? [];
}

export async function createApplication(
  input: ApplicationInsert,
): Promise<ApplicationRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`Failed to create application: ${error.message}`);
  return data;
}

export async function updateApplication(
  id: string,
  patch: ApplicationUpdate,
): Promise<ApplicationRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update application: ${error.message}`);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(`Failed to delete application: ${error.message}`);
}
