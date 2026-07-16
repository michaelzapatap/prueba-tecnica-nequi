import { Task } from '../../domain/models/task.model';
import { countTasks, queryTasks, sortTasksByCreationDate } from './task-list.query';

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
});
