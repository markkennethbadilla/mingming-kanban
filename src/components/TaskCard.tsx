import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  onStatusChange: (id: number, status: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  dueDate,
  priority,
  status,
  onStatusChange,
}) => {
  const router = useRouter();

  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id, status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const isMissed = status === "TO_DO" && new Date(dueDate) < new Date();

  const priorityStyles = {
    LOW: { backgroundColor: "var(--neutral-color)", color: "#fff" },
    MEDIUM: { backgroundColor: "var(--highlight-color)", color: "var(--text-color)" },
    HIGH: { backgroundColor: "var(--secondary-color)", color: "#fff" },
  };

  const handleCardClick = () => {
    router.push(`/tasks/${id}/edit`);
  };

  drag(dragRef);

  return (
    <div
      ref={dragRef}
      onClick={handleCardClick}
      style={{
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s",
        marginBottom: "8px",
        cursor: "pointer",
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isMissed ? "var(--highlight-color-light)" : "var(--background-color)",
        borderLeft: `4px solid ${isMissed ? "var(--secondary-color)" : "var(--primary-color)"}`,
      }}
    >
      {/* Header: Title and Priority */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--primary-color)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </h3>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px 6px",
            fontSize: "0.75rem",
            fontWeight: "500",
            borderRadius: "4px",
            ...priorityStyles[priority],
          }}
        >
          {priority}
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-color)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: "8px",
        }}
      >
        {description}
      </p>

      {/* Footer: Due Date and Status Dropdown */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", alignItems: "center" }}>
        <p
          style={{
            color: isMissed ? "var(--secondary-color)" : "var(--neutral-color)",
            fontWeight: isMissed ? "600" : "400",
          }}
        >
          Due: {new Date(dueDate).toLocaleDateString()}
        </p>
        <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
          <select
            value={status}
            onChange={(e) => onStatusChange(id, e.target.value)}
            style={{
              fontSize: "0.75rem",
              backgroundColor: "var(--background-color)",
              border: `1px solid var(--neutral-color)`,
              borderRadius: "4px",
              padding: "4px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {["TO_DO", "IN_PROGRESS", "DONE"].map((option) => (
              <option key={option} value={option}>
                {option.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
