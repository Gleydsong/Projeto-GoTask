import { TaskStatus } from '../../../types/task-status';
import { TaskComment } from './task-comment.interface';

export interface TaskEntity {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  comments: TaskComment[];
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: number;
}
