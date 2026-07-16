import { EntityId } from '../../domain/models/entity-id.model';
import { Task } from '../../domain/models/task.model';

export type TaskCategoryFilter = EntityId | 'all' | 'uncategorized';

export interface TaskListQuery {
  readonly categoryFilter: TaskCategoryFilter;
  readonly searchQuery: string;
  readonly isSearchEnabled: boolean;
}

export interface TaskCounts {
  readonly pending: number;
  readonly completed: number;
}

export const TASK_RENDER_BATCH_SIZE = 30;

export function queryTasks(tasks: readonly Task[], query: TaskListQuery): readonly Task[] {
  const normalizedSearchQuery = query.searchQuery.trim().toLowerCase();
  let filteredTasks = tasks;

  if (query.categoryFilter === 'uncategorized') {
    filteredTasks = filteredTasks.filter((task) => task.categoryId === null);
  } else if (query.categoryFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.categoryId === query.categoryFilter);
  }

  if (!query.isSearchEnabled || !normalizedSearchQuery) {
    return filteredTasks;
  }

  return filteredTasks.filter((task) => task.title.toLowerCase().includes(normalizedSearchQuery));
}

export function sortTasksByCreationDate(tasks: readonly Task[]): readonly Task[] {
  return [...tasks].sort((firstTask, secondTask) =>
    secondTask.createdAt.localeCompare(firstTask.createdAt),
  );
}

export function countTasks(tasks: readonly Task[]): TaskCounts {
  let pending = 0;
  let completed = 0;

  for (const task of tasks) {
    if (task.isCompleted) {
      completed += 1;
    } else {
      pending += 1;
    }
  }

  return { pending, completed };
}
