import React, { useState, useRef } from 'react';
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
  LOW: { color: 'bg-slate-400', text: 'text-slate-600', label: 'Low' },
  MEDIUM: { color: 'bg-amber-400', text: 'text-amber-600', label: 'Medium' },
  HIGH: { color: 'bg-red-400', text: 'text-red-600', label: 'High' },
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
        className={`group relative bg-white rounded-xl border border-[var(--border)] shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
          isDragging ? 'opacity-40' : ''
        }`}
        style={{ borderLeft: `3px solid ${pConfig.color === 'bg-slate-400' ? '#94a3b8' : pConfig.color === 'bg-amber-400' ? '#fbbf24' : '#f87171'}` }}
      >
        {/* Collapsed view */}
        <div className="flex items-center justify-between p-3 gap-2">
          <h3 className="text-sm font-medium text-[var(--text)] truncate flex-1">{title}</h3>
          <span className={`text-xs ${isMissed ? 'text-red-500 font-medium' : 'text-[var(--text-muted)]'}`}>
            {format(taskDate, 'MMM d')}
          </span>
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="px-3 pb-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Priority badge */}
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${pConfig.color} text-white mb-2`}>
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
                  className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                    status === s
                      ? 'bg-primary/10 text-primary cursor-default'
                      : 'text-[var(--text-muted)] hover:bg-gray-100 hover:text-[var(--text)]'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-[var(--border)] pt-2">
              <a
                href={`/tasks/${id}/edit`}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
                data-action="edit-task"
              >
                <Pencil size={13} /> Edit
              </a>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors ml-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" data-dialog="confirm-delete">
          <div className="bg-white rounded-xl shadow-elevated p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="font-semibold text-lg text-[var(--text)] mb-2">Delete task?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              &quot;{title}&quot; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
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

