import { useState } from "react";
import type {
  ApplicationRow,
  ApplicationStatus,
} from "../supabase/types";
import { useApplications } from "./context/ApplicationsContext";
import { Board } from "./components/Board";
import { ApplicationForm } from "./components/ApplicationForm";
import { Modal } from "./components/Modal";

const APP_VERSION = "v0.1.0";

/** Tracks whether the modal is adding (with a preset status) or editing. */
type ModalState =
  | { mode: "add"; status: ApplicationStatus }
  | { mode: "edit"; application: ApplicationRow }
  | null;

export function App() {
  const {
    applications,
    loading,
    error,
    addApplication,
    editApplication,
    changeStatus,
    removeApplication,
  } = useApplications();

  const [modal, setModal] = useState<ModalState>(null);

  function handleDelete(id: string) {
    if (window.confirm("Delete this application? This cannot be undone.")) {
      void removeApplication(id);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="topbar__title">
          <span aria-hidden="true">📋</span> Job Applications
        </h1>
        <span className="topbar__version">{APP_VERSION}</span>
      </header>

      {error && (
        <p className="banner banner--error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="board-loading">Loading…</p>
      ) : (
        <Board
          applications={applications}
          onMove={changeStatus}
          onAdd={(status) => setModal({ mode: "add", status })}
          onEdit={(application) => setModal({ mode: "edit", application })}
          onDelete={handleDelete}
        />
      )}

      {modal && (
        <Modal
          title={modal.mode === "add" ? "Add application" : "Edit application"}
          onClose={() => setModal(null)}
        >
          <ApplicationForm
            initial={modal.mode === "edit" ? modal.application : undefined}
            defaultStatus={modal.mode === "add" ? modal.status : undefined}
            onSubmit={async (input) => {
              if (modal.mode === "edit") {
                await editApplication(modal.application.id, input);
              } else {
                await addApplication(input);
              }
              setModal(null);
            }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
