import type { DragEvent } from "react";
import type { ApplicationRow } from "../../supabase/types";
import type { StatusMeta } from "../lib/status";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  meta: StatusMeta;
  applications: ApplicationRow[];
  draggingId: string | null;
  isDropTarget: boolean;
  onAdd: (status: StatusMeta["value"]) => void;
  onDropCard: (status: StatusMeta["value"]) => void;
  onDragEnterColumn: (status: StatusMeta["value"]) => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onEdit: (application: ApplicationRow) => void;
  onDelete: (id: string) => void;
}

export function BoardColumn({
  meta,
  applications,
  draggingId,
  isDropTarget,
  onAdd,
  onDropCard,
  onDragEnterColumn,
  onCardDragStart,
  onCardDragEnd,
  onEdit,
  onDelete,
}: BoardColumnProps) {
  function handleDragOver(e: DragEvent<HTMLElement>) {
    // Required so the column becomes a valid drop target.
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <section
      className="column"
      aria-label={meta.label}
      onDragOver={handleDragOver}
      onDragEnter={() => onDragEnterColumn(meta.value)}
      onDrop={(e) => {
        e.preventDefault();
        onDropCard(meta.value);
      }}
    >
      <header className="column__header" style={{ borderTopColor: meta.color }}>
        <span className="column__title">{meta.label}</span>
        <span className="column__count">{applications.length}</span>
      </header>

      <button
        type="button"
        className="column__add"
        onClick={() => onAdd(meta.value)}
      >
        + Add
      </button>

      <div
        className={
          isDropTarget ? "column__body column__body--over" : "column__body"
        }
      >
        {applications.length === 0 ? (
          <p className="column__empty">No applications</p>
        ) : (
          applications.map((application) => (
            <BoardCard
              key={application.id}
              application={application}
              accentColor={meta.color}
              isDragging={draggingId === application.id}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
