import { TaskStatus } from '../../../types/task-status';

export interface TaskHistoryFilters {
  search?: string;
  status?: TaskStatus | 'all';
}
