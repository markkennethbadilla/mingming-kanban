
export interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
