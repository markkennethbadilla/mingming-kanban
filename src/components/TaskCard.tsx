import React, { useState, useRef } from "react";
import { useDrag } from "react-dnd";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { Button } from "primereact/button";
import { useToast } from "../context/ToastContext";

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  dueDate: string | Date;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  onStatusChange?: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  dueDate,
  priority,
  status,
  onStatusChange,
  onDelete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // To handle delayed collapse
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current); // Clear any pending timeout
      hoverTimeout.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 1000); // Delay of 1 second
  };

  const currentYear = new Date().getFullYear();
  const taskDate = new Date(typeof dueDate === "string" ? dueDate : dueDate);
  const isMissed = status === "TO_DO" && taskDate < new Date();
  const priorityColors = {
    LOW: "var(--neutral-color)",
    MEDIUM: "var(--highlight-color)",
    HIGH: "var(--secondary-color)",
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    onDelete(id);
    showToast({
      severity: "success",
      summary: "Task Deleted",
      detail: `Task "${title}" has been deleted.`,
      life: 3000,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange && status !== newStatus) {
      onStatusChange(id, newStatus);
      showToast({
        severity: "info",
        summary: "Status Updated",
        detail: `Task "${title}" status updated to ${newStatus.replace(
          "_",
          " "
        )}.`,
        life: 3000,
      });
    }
  };

  const handleEditClick = () => {
    window.location.href = `/tasks/${id}/edit`;
  };

  drag(cardRef);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: isHovered ? "0px 12px 12px 12px" : "8px",
        borderRadius: "8px",
        boxShadow: isHovered
          ? "0 6px 12px rgba(0, 0, 0, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.3s, padding 0.2s",
        marginBottom: "8px",
        cursor: "default",
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isMissed
          ? "var(--highlight-color-light)"
          : "var(--card-background)",
        borderLeft: `4px solid ${priorityColors[priority]}`,
        position: "relative",
        overflow: "hidden",
        minHeight: isHovered ? "auto" : "48px",
      }}
    >
      {isHovered && (
        <span
          style={{
            position: "absolute",
            top: "8px",
            right: "12px",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "600",
            backgroundColor: priorityColors[priority],
            color: "white",
          }}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
        </span>
      )}

      {!isHovered && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "500",
              color: "var(--primary-color)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "0.65rem",
              color: isMissed
                ? "var(--secondary-color)"
                : "var(--neutral-color)",
            }}
          >
            {taskDate.toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year:
                taskDate.getFullYear() !== currentYear ? "numeric" : undefined,
            })}
          </p>
        </div>
      )}

      {isHovered && (
        <>
          <div style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "500",
                color: "var(--primary-color)",
                marginBottom: "4px",
                wordWrap: "break-word",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "grey",
                whiteSpace: "normal",
              }}
            >
              {description}
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--neutral-color)",
                marginBottom: "30px",
                fontStyle: "italic",
              }}
            >
              Due on{" "}
              {taskDate.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "var(--neutral-color)",
            }}
          >
            <span
              className="p-overlay-badge"
              data-pr-tooltip="Edit Task"
              data-pr-position="top"
              style={{
              cursor: "pointer",
              color: "var(--primary-color)",
              fontSize: "0.875rem",
              transition: "transform 0.2s ease, color 0.2s ease",
              }}
              onClick={handleEditClick}
              onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              (e.currentTarget as HTMLElement).style.color = "var(--primary-color)";
              }}
              onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.color = "var(--primary-color)";
              }}
            >
              <FaPencilAlt />
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
                {["TO_DO", "IN_PROGRESS", "DONE"].map((statusKey) => (
                <span
                  key={statusKey}
                  className={`${status === statusKey ? "active-status" : ""}`}
                  data-pr-tooltip={statusKey.replace("_", " ")}
                  data-pr-position="top"
                  onClick={() => handleStatusChange(statusKey)}
                  style={{
                  cursor: status === statusKey ? "not-allowed" : "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor:
                    status === statusKey
                    ? "#d3d3d3" // lighter grey
                    : "transparent",
                  color: "var(--neutral-color)",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                  (e.currentTarget as HTMLElement).style.color = "var(--primary-color)";
                  }}
                  onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLElement).style.color = "var(--neutral-color)";
                  }}
                >
                  {statusKey
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/^\w/, (c) => c.toUpperCase())}
                </span>
                ))}
            </div>

            <span
              className="p-overlay-badge"
              data-pr-tooltip="Delete Task"
              data-pr-position="top"
              onClick={handleDeleteClick}
              style={{
              cursor: "pointer",
              color: "var(--secondary-color)",
              fontSize: "0.875rem",
              transition: "transform 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              (e.currentTarget as HTMLElement).style.color = "var(--primary-color)";
              }}
              onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.color = "var(--secondary-color)";
              }}
            >
              <FaTrash />
            </span>
          </div>
        </>
      )}

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
              onClick={confirmDelete}
            />
          </div>
        }
      >
        <p>
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
      </Dialog>
      <Tooltip target=".p-overlay-badge" />
    </div>
  );
};

export default TaskCard;
