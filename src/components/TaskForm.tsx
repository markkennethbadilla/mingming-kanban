import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Undo2, Trash2 } from 'lucide-react';

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onDelete?: () => void;
}

const taskSchema = z.object({
  title: z.string().nonempty('Title is required'),
  description: z.string().optional(),
  dueDate: z
    .date()
    .refine((date) => !isNaN(date.getTime()), { message: 'Invalid date' })
    .nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'DONE']),
});

type TaskFormData = z.infer<typeof taskSchema>;

const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const labelClass = 'block text-sm font-medium text-[var(--text)] mb-1';
const errorClass = 'text-red-500 text-xs mt-1';

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onDelete }) => {
  const isEditMode = !!initialData;
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultValues: TaskFormData = initialData
    ? { ...initialData, dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null }
    : { title: '', description: '', dueDate: null, priority: 'MEDIUM', status: 'TO_DO' };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues,
    resolver: zodResolver(taskSchema),
  });

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-white rounded-xl border border-[var(--border)] shadow-card"
        data-form="task"
      >
        {/* Title */}
        <div className="sm:col-span-1">
          <label htmlFor="title" className={labelClass}>Title</label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input {...field} id="title" type="text" placeholder="Task title" className={`${inputClass} ${errors.title ? 'border-red-400' : ''}`} />
            )}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Due Date */}
        <div className="sm:col-span-1">
          <label htmlFor="dueDate" className={labelClass}>Due Date</label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <input
                id="dueDate"
                type="date"
                value={field.value ? field.value.toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                className={inputClass}
              />
            )}
          />
          {errors.dueDate && <p className={errorClass}>{errors.dueDate.message}</p>}
        </div>

        {/* Priority */}
        <div className="sm:col-span-1">
          <label htmlFor="priority" className={labelClass}>Priority</label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <select {...field} id="priority" className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            )}
          />
        </div>

        {/* Status */}
        <div className="sm:col-span-1">
          <label htmlFor="status" className={labelClass}>Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} id="status" className={inputClass}>
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            )}
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea {...field} id="description" rows={3} placeholder="Task description" className={inputClass} />
            )}
          />
        </div>

        {/* Actions */}
        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 justify-center mt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            data-action="save-task"
          >
            <Save size={16} /> Save
          </button>
          {isEditMode && (
            <>
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[var(--text)] font-semibold py-2 px-6 rounded-lg transition-colors"
                data-action="undo-task"
              >
                <Undo2 size={16} /> Undo
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-6 rounded-lg transition-colors"
                data-action="delete-task"
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </form>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" data-dialog="confirm-delete">
          <div className="bg-white rounded-xl shadow-elevated p-6 max-w-sm w-full mx-4 animate-slide-up">
            <h3 className="font-semibold text-lg text-[var(--text)] mb-2">Delete task?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); onDelete?.(); }}
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

export default TaskForm;
