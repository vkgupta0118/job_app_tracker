import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ApplicationInsert,
  ApplicationRow,
  ApplicationStatus,
  ApplicationUpdate,
} from "../../supabase/types";
import * as repo from "../lib/applications";
import { deriveAppliedAt } from "../lib/status";

interface ApplicationsContextValue {
  applications: ApplicationRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addApplication: (input: ApplicationInsert) => Promise<void>;
  editApplication: (id: string, patch: ApplicationUpdate) => Promise<void>;
  changeStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function messageFrom(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await repo.listApplications());
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addApplication = useCallback(async (input: ApplicationInsert) => {
    setError(null);
    try {
      const created = await repo.createApplication(input);
      setApplications((prev) => [created, ...prev]);
    } catch (err) {
      setError(messageFrom(err));
      throw err;
    }
  }, []);

  const editApplication = useCallback(
    async (id: string, patch: ApplicationUpdate) => {
      setError(null);
      try {
        const updated = await repo.updateApplication(id, patch);
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? updated : a)),
        );
      } catch (err) {
        setError(messageFrom(err));
        throw err;
      }
    },
    [],
  );

  const changeStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      const current = applications.find((a) => a.id === id);
      const applied_at = deriveAppliedAt(
        status,
        current?.applied_at ?? null,
        today(),
      );
      await editApplication(id, { status, applied_at });
    },
    [applications, editApplication],
  );

  const removeApplication = useCallback(async (id: string) => {
    setError(null);
    try {
      await repo.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(messageFrom(err));
      throw err;
    }
  }, []);

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      applications,
      loading,
      error,
      refresh,
      addApplication,
      editApplication,
      changeStatus,
      removeApplication,
    }),
    [
      applications,
      loading,
      error,
      refresh,
      addApplication,
      editApplication,
      changeStatus,
      removeApplication,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error(
      "useApplications must be used within an ApplicationsProvider",
    );
  }
  return ctx;
}
