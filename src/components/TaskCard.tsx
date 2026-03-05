import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useDrag } from 'react-dnd';
import { Trash2, Pencil } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  dueDate: string | Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  onStatusChange?: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const priorityConfig = {
  LOW: { color: 'bg-[var(--fish-blue)]', text: 'text-[var(--fish-blue)]', label: 'Low', border: 'var(--fish-blue)' },
  MEDIUM: { color: 'bg-[var(--accent)]', text: 'text-[var(--accent-dark)]', label: 'Medium', border: 'var(--accent)' },
  HIGH: { color: 'bg-[var(--yarn-red)]', text: 'text-[var(--yarn-red)]', label: 'High', border: 'var(--yarn-red)' },
};

const statusLabels: Record<string, string> = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const TaskCard: React.FC<TaskCardProps> = ({
  id, title, description, dueDate, priority, status, onStatusChange, onDelete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id, status },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  const taskDate = new Date(dueDate);
  const isMissed = status === 'TO_DO' && isPast(taskDate);
  const pConfig = priorityConfig[priority];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    onDelete(id);
    showToast({ severity: 'success', summary: 'Deleted', detail: `"${title}" removed.`, life: 3000 });
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange && status !== newStatus) {
      onStatusChange(id, newStatus);
      showToast({ severity: 'info', summary: 'Updated', detail: `"${title}" moved to ${statusLabels[newStatus]}.`, life: 3000 });
    }
  };

  drag(cardRef);

  return (
    <>
      <div
        ref={cardRef}
        data-row-id={`task-${id}`}
        onClick={() => setExpanded(!expanded)}
        className={`group relative card-cozy transition-all cursor-pointer ${
          isDragging ? 'opacity-40' : ''
        }`}
        style={{ borderLeftWidth: '4px', borderLeftColor: pConfig.border }}
      >
        {/* Collapsed view */}
        <div className="flex items-center justify-between p-3 gap-2">
          <h3 className="text-sm font-bold text-[var(--text)] truncate flex-1">{title}</h3>
          <span className={`text-xs ${isMissed ? 'text-red-500 font-medium' : 'text-[var(--text-muted)]'}`}>
            {format(taskDate, 'MMM d')}
          </span>
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="px-3 pb-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Priority badge */}
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${pConfig.color} text-white mb-2`}>
              {pConfig.label}
            </span>

            {description && (
              <p className="text-sm text-[var(--text-muted)] mb-2 leading-relaxed">{description}</p>
            )}
            <p className="text-xs text-[var(--text-muted)] italic mb-3">
              Due {format(taskDate, 'EEEE, MMMM d, yyyy')}
            </p>

            {/* Status toggle */}
            <div className="flex items-center gap-1 mb-3">
              {(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={status === s}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors ${
                    status === s
                      ? 'bg-[var(--primary)] text-white cursor-default'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t-2 border-[var(--border)] pt-2">
              <Link
                href={`/tasks/${id}/edit`}
                className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                data-action="edit-task"
              >
                <Pencil size={13} /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs font-bold text-[var(--danger)] hover:opacity-80 transition-colors ml-auto"
                data-action="delete-task"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" data-dialog="confirm-delete">
          <div className="card-cozy p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="font-extrabold text-lg text-[var(--text)] mb-2">Delete task?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5 font-semibold">
              &quot;{title}&quot; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface-alt)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-yarn text-sm" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;

