import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

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

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onDelete,
}) => {
  const isEditMode = !!initialData;
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultValues: TaskFormData = initialData
    ? {
        ...initialData,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : null,
      }
    : {
        title: '',
        description: '',
        dueDate: null,
        priority: 'MEDIUM',
        status: 'TO_DO',
      };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues,
    resolver: zodResolver(taskSchema),
  });

  const priorityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
  ];

  const statusOptions = [
    { label: 'To Do', value: 'TO_DO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 p-6 bg-[var(--background-color)] rounded-lg"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      }}
    >
      {/* Title Field */}
      <div className="col-span-full sm:col-span-1">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--text-color)]"
        >
          Title
        </label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputText
              {...field}
              id="title"
              className={`w-full p-2 text-sm rounded-md border ${
                errors.title
                  ? 'border-[var(--secondary-color)]'
                  : 'border-[var(--neutral-color)]'
              }`}
              placeholder="Task title"
            />
          )}
        />
        {errors.title && (
          <small className="text-[var(--secondary-color)] text-xs">
            {errors.title.message}
          </small>
        )}
      </div>

      {/* Due Date Field */}
      <div className="col-span-full sm:col-span-1">
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-[var(--text-color)]"
        >
          Due Date
        </label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <Calendar
              {...field}
              id="dueDate"
              dateFormat="yy-mm-dd"
              showIcon
              inputClassName="w-full p-2 text-sm rounded-l-md border border-[var(--neutral-color)]"
              placeholder="Select date"
              className="w-full"
            />
          )}
        />
        {errors.dueDate && (
          <small className="text-[var(--secondary-color)] text-xs">
            {errors.dueDate.message}
          </small>
        )}
      </div>

      {/* Priority Field */}
      <div className="col-span-full sm:col-span-1">
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-[var(--text-color)]"
        >
          Priority
        </label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Dropdown
              {...field}
              id="priority"
              options={priorityOptions}
              placeholder="Priority"
              className="w-full p-2 text-sm rounded-md border border-[var(--neutral-color)]"
            />
          )}
        />
      </div>

      {/* Status Field */}
      <div className="col-span-full sm:col-span-1">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-[var(--text-color)]"
        >
          Status
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Dropdown
              {...field}
              id="status"
              options={statusOptions}
              placeholder="Status"
              className="w-full p-2 text-sm rounded-md border border-[var(--neutral-color)]"
            />
          )}
        />
      </div>

      {/* Description Field */}
      <div className="col-span-full">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-[var(--text-color)]"
        >
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <InputTextarea
              {...field}
              id="description"
              rows={3}
              className="w-full p-2 text-sm rounded-md border border-[var(--neutral-color)]"
              placeholder="Task description"
            />
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="col-span-full flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <Button
          type="submit"
          label="Save"
          icon="pi pi-save"
          className="bg-[var(--primary-color)] text-white font-semibold py-2 px-6 rounded-lg"
        />
        {isEditMode && (
          <>
            <Button
              type="button"
              label="Undo"
              icon="pi pi-undo"
              className="p-button-secondary font-semibold py-2 px-6 rounded-lg"
              onClick={() => reset()}
            />
            <Button
              type="button"
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger font-semibold py-2 px-6 rounded-lg"
              onClick={() => setShowConfirm(true)}
            />
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        header="Confirm Deletion"
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowConfirm(false)}
            />
            <Button
              label="Delete"
              icon="pi pi-check"
              className="p-button-danger"
              onClick={() => {
                setShowConfirm(false);
                if (onDelete) {
                  onDelete();
                }
              }}
            />
          </div>
        }
      >
        <p>
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
      </Dialog>
    </form>
  );
};

export default TaskForm;
