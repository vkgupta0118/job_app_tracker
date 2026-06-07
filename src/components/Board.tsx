import { useMemo, useState } from "react";
import type {
  ApplicationRow,
  ApplicationStatus,
} from "../../supabase/types";
import { STATUS_META } from "../lib/status";
import { BoardColumn } from "./BoardColumn";

interface BoardProps {
  applications: ApplicationRow[];
  onMove: (id: string, status: ApplicationStatus) => void;
  onAdd: (status: ApplicationStatus) => void;
  onEdit: (application: ApplicationRow) => void;
  onDelete: (id: string) => void;
}

type Grouped = Record<ApplicationStatus, ApplicationRow[]>;

function groupByStatus(applications: ApplicationRow[]): Grouped {
  const grouped = Object.fromEntries(
    STATUS_META.map((m) => [m.value, [] as ApplicationRow[]]),
  ) as Grouped;
  for (const app of applications) grouped[app.status].push(app);
  return grouped;
}

export function Board({
  applications,
  onMove,
  onAdd,
  onEdit,
  onDelete,
}: BoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<ApplicationStatus | null>(null);

  const grouped = useMemo(() => groupByStatus(applications), [applications]);

  function handleDrop(status: ApplicationStatus) {
    const id = draggingId;
    setDraggingId(null);
    setOverStatus(null);
    if (!id) return;
    const current = applications.find((a) => a.id === id);
    // Only move when the column actually changed.
    if (current && current.status !== status) onMove(id, status);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setOverStatus(null);
  }

  return (
    <div className="board">
      {STATUS_META.map((meta) => (
        <BoardColumn
          key={meta.value}
          meta={meta}
          applications={grouped[meta.value]}
          draggingId={draggingId}
          isDropTarget={draggingId !== null && overStatus === meta.value}
          onAdd={onAdd}
          onDropCard={handleDrop}
          onDragEnterColumn={setOverStatus}
          onCardDragStart={setDraggingId}
          onCardDragEnd={handleDragEnd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
