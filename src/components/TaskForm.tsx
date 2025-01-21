import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onDelete?: () => void;
}

const taskSchema = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  dueDate: z
    .date()
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" })
    .nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]),
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
        title: "",
        description: "",
        dueDate: null,
        priority: "MEDIUM",
        status: "TO_DO",
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
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ];

  const statusOptions = [
    { label: "To Do", value: "TO_DO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Done", value: "DONE" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        alignItems: "center",
        backgroundColor: "var(--background-color)",
        padding: "24px",
        borderRadius: "12px",
      }}
    >
      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            marginBottom: "4px",
            display: "block",
            color: "var(--text-color)",
          }}
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
              style={{
                width: "100%",
                borderRadius: "6px",
                border: `1px solid ${
                  errors.title
                    ? "var(--secondary-color)"
                    : "var(--neutral-color)"
                }`,
                padding: "8px",
                fontSize: "0.9rem",
              }}
              placeholder="Task title"
            />
          )}
        />
        {errors.title && (
          <small
            style={{ color: "var(--secondary-color)", fontSize: "0.8rem" }}
          >
            {errors.title.message}
          </small>
        )}
      </div>

      {/* Due Date Field */}
      <div className="taskform-calendar-wrapper">
        <label htmlFor="dueDate">Due Date</label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <Calendar
              {...field}
              id="dueDate"
              dateFormat="yy-mm-dd"
              showIcon
              inputStyle={{
                width: "100%",
                borderRadius: "6px",
              }}
              placeholder="Select date"
              className="taskform-calendar"
            />
          )}
        />
        {errors.dueDate && (
          <small style={{ color: "var(--secondary-color)" }}>
            {errors.dueDate.message}
          </small>
        )}
      </div>

      {/* Priority Field */}
      <div>
        <label
          htmlFor="priority"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            marginBottom: "4px",
            display: "block",
            color: "var(--text-color)",
          }}
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
              style={{
                width: "100%",
                borderRadius: "6px",
                border: `1px solid var(--neutral-color)`,
                fontSize: "0.9rem",
              }}
            />
          )}
        />
      </div>

      {/* Status Field */}
      <div>
        <label
          htmlFor="status"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            marginBottom: "4px",
            display: "block",
            color: "var(--text-color)",
          }}
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
              style={{
                width: "100%",
                borderRadius: "6px",
                border: `1px solid var(--neutral-color)`,
                fontSize: "0.9rem",
              }}
            />
          )}
        />
      </div>

      {/* Description Field */}
      <div style={{ gridColumn: "span 2" }}>
        <label
          htmlFor="description"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
            marginBottom: "4px",
            display: "block",
            color: "var(--text-color)",
          }}
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
              style={{
                width: "100%",
                borderRadius: "6px",
                border: `1px solid var(--neutral-color)`,
                padding: "8px",
                fontSize: "0.9rem",
              }}
              placeholder="Task description"
            />
          )}
        />
      </div>

      {/* Action Buttons */}
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        <Button
          type="submit"
          label="Save"
          icon="pi pi-save"
          style={{
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            fontWeight: "600",
            padding: "10px 24px",
            borderRadius: "8px",
          }}
        />
        {isEditMode && (
          <>
            <Button
              type="button"
              label="Undo"
              icon="pi pi-undo"
              className="p-button-secondary"
              onClick={() => reset()}
              style={{
                fontWeight: "600",
                padding: "10px 24px",
                borderRadius: "8px",
              }}
            />
            <Button
              type="button"
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={() => setShowConfirm(true)}
              style={{
                fontWeight: "600",
                padding: "10px 24px",
                borderRadius: "8px",
              }}
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
