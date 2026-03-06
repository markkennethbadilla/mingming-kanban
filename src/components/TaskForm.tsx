'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Undo2, Trash2 } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']),
  description: z.string().max(500).optional(),
});

type TaskData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskData) => void;
  onDelete?: () => void;
  initialData?: Partial<TaskData> & { dueDate?: string };
}

const inputClass = 'w-full px-3 py-2.5 text-sm font-semibold rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors';

// TODO: TaskForm body

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onDelete, initialData }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultValues: TaskData = {
    title: initialData?.title || '',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    priority: initialData?.priority || 'MEDIUM',
    status: initialData?.status || 'TO_DO',
    description: initialData?.description || '',
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskData>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-cozy p-5" data-form="task">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Title</label>
          <Controller name="title" control={control} render={({ field }) => (
            <input {...field} className={inputClass} placeholder="Task title" data-input="title" />
          )} />
          {errors.title && <p className="text-xs text-[var(--danger)] mt-1 font-semibold">{errors.title.message}</p>}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Due Date</label>
          <Controller name="dueDate" control={control} render={({ field }) => (
            <input {...field} type="date" className={inputClass} data-input="due-date" />
          )} />
          {errors.dueDate && <p className="text-xs text-[var(--danger)] mt-1 font-semibold">{errors.dueDate.message}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Priority</label>
          <Controller name="priority" control={control} render={({ field }) => (
            <select {...field} className={inputClass} data-input="priority">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          )} />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Status</label>
          <Controller name="status" control={control} render={({ field }) => (
            <select {...field} className={inputClass} data-input="status">
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          )} />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Description</label>
          <Controller name="description" control={control} render={({ field }) => (
            <textarea {...field} rows={3} className={inputClass + ' resize-none'} placeholder="Optional description..." data-input="description" />
          )} />
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" className="btn-yarn flex items-center justify-center gap-2 text-sm flex-1" data-action="save-task">
            <Save size={16} /> Save Task
          </button>
          <button type="button" onClick={() => reset(defaultValues)} className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl border-2 border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-alt)] font-bold transition-colors" data-action="reset-form">
            <Undo2 size={16} /> Undo
          </button>
          {onDelete && (
            <button type="button" onClick={() => setShowConfirm(true)} className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl text-[var(--danger)] hover:bg-red-50 font-bold transition-colors" data-action="delete-task">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" data-dialog="confirm-delete">
          <div className="card-cozy p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="font-extrabold text-lg text-[var(--text)] mb-2">Delete this task?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5 font-semibold">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--surface-alt)] rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => { setShowConfirm(false); onDelete?.(); }} className="btn-yarn px-4 py-2 text-sm" style={{ backgroundColor: 'var(--yarn-red)', borderColor: 'var(--yarn-red)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default TaskForm;