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

export interface TaskListPage {
  readonly tasks: readonly Task[];
  readonly matchingTaskCount: number;
}

export function queryTasks(tasks: readonly Task[], query: TaskListQuery): readonly Task[] {
  const normalizedSearchQuery = normalizeSearchQuery(query);
  return tasks.filter((task) => matchesTask(task, query, normalizedSearchQuery));
}

export function selectTaskListPage(
  tasks: readonly Task[],
  query: TaskListQuery,
  limit: number,
): TaskListPage {
  const normalizedSearchQuery = normalizeSearchQuery(query);

  if (query.categoryFilter === 'all' && !normalizedSearchQuery) {
    return {
      tasks: tasks.slice(0, limit),
      matchingTaskCount: tasks.length,
    };
  }

  const page: Task[] = [];
  let matchingTaskCount = 0;

  for (const task of tasks) {
    if (!matchesTask(task, query, normalizedSearchQuery)) {
      continue;
    }

    matchingTaskCount += 1;

    if (page.length < limit) {
      page.push(task);
    }
  }

  return { tasks: page, matchingTaskCount };
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

function normalizeSearchQuery(query: TaskListQuery): string {
  return query.isSearchEnabled ? query.searchQuery.trim().toLowerCase() : '';
}

function matchesTask(task: Task, query: TaskListQuery, normalizedSearchQuery: string): boolean {
  const matchesCategory =
    query.categoryFilter === 'all' ||
    (query.categoryFilter === 'uncategorized'
      ? task.categoryId === null
      : task.categoryId === query.categoryFilter);

  return (
    matchesCategory &&
    (!normalizedSearchQuery || task.title.toLowerCase().includes(normalizedSearchQuery))
  );
}
