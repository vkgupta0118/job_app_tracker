import type { DragEvent } from "react";
import type { ApplicationRow } from "../../supabase/types";

interface BoardCardProps {
  application: ApplicationRow;
  accentColor: string;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onEdit: (application: ApplicationRow) => void;
  onDelete: (id: string) => void;
}

export function BoardCard({
  application,
  accentColor,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: BoardCardProps) {
  const { id, company, role, url, location, applied_at } = application;

  function handleDragStart(e: DragEvent<HTMLElement>) {
    // dataTransfer makes it a valid drag; the id is also tracked in Board state.
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(id);
  }

  return (
    <article
      className={isDragging ? "board-card board-card--dragging" : "board-card"}
      style={{ borderLeftColor: accentColor }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      aria-label={`${role} at ${company}`}
    >
      <h3 className="board-card__role">{role}</h3>
      <p className="board-card__company">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {company}
          </a>
        ) : (
          company
        )}
      </p>
      {location && <p className="board-card__meta">{location}</p>}
      {applied_at && <p className="board-card__meta">Applied {applied_at}</p>}

      <div className="board-card__actions">
        <button type="button" onClick={() => onEdit(application)}>
          Edit
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={() => onDelete(id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
