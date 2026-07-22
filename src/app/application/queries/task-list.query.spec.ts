import { Task } from '../../domain/models/task.model';
import {
  countTasks,
  queryTasks,
  selectTaskListPage,
  sortTasksByCreationDate,
} from './task-list.query';

const tasks: readonly Task[] = [
  {
    id: 'task-1',
    title: 'Preparar demostración',
    categoryId: 'category-1',
    isCompleted: false,
    createdAt: '2026-07-16T10:00:00.000Z',
    updatedAt: '2026-07-16T10:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Enviar correo',
    categoryId: null,
    isCompleted: true,
    createdAt: '2026-07-16T11:00:00.000Z',
    updatedAt: '2026-07-16T11:00:00.000Z',
  },
];

describe('task list queries', () => {
  it('combines category and case-insensitive title filters', () => {
    expect(
      queryTasks(tasks, {
        categoryFilter: 'category-1',
        searchQuery: 'DEMO',
        isSearchEnabled: true,
      }).map((task) => task.id),
    ).toEqual(['task-1']);
  });

  it('sorts newest tasks first without mutating the input', () => {
    const sortedTasks = sortTasksByCreationDate(tasks);

    expect(sortedTasks.map((task) => task.id)).toEqual(['task-2', 'task-1']);
    expect(tasks.map((task) => task.id)).toEqual(['task-1', 'task-2']);
  });

  it('counts task states in one traversal', () => {
    expect(countTasks(tasks)).toEqual({ pending: 1, completed: 1 });
  });

  it('selects only the requested render window while counting all matches', () => {
    const page = selectTaskListPage(
      tasks,
      {
        categoryFilter: 'all',
        searchQuery: '',
        isSearchEnabled: true,
      },
      1,
    );

    expect(page.tasks.map((task) => task.id)).toEqual(['task-1']);
    expect(page.matchingTaskCount).toBe(2);
  });

  it('combines filters without allocating the complete matching collection', () => {
    const page = selectTaskListPage(
      tasks,
      {
        categoryFilter: 'uncategorized',
        searchQuery: 'correo',
        isSearchEnabled: true,
      },
      1,
    );

    expect(page.tasks.map((task) => task.id)).toEqual(['task-2']);
    expect(page.matchingTaskCount).toBe(1);
  });
});
