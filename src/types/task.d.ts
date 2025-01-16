// src/types/task.d.ts
export interface Task {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    priority: number;
}
