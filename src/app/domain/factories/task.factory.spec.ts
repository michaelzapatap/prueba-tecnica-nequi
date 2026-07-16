import { DomainError } from '../errors/domain-error';
import { Clock } from '../services/clock';
import { IdGenerator } from '../services/id-generator';
import {
  completeTask,
  createTask,
  detachTaskCategory,
  reopenTask,
  updateTask,
} from './task.factory';

describe('task factory', () => {
  const clock: Clock = { now: () => '2026-07-15T22:30:00.000Z' };
  const idGenerator: IdGenerator = { create: () => 'task-1' };

  it('creates a normalized pending task', () => {
    const task = createTask(
      { title: '  Comprar cafe  ', categoryId: 'category-1' },
      idGenerator,
      clock,
    );

    expect(task).toEqual({
      id: 'task-1',
      title: 'Comprar cafe',
      categoryId: 'category-1',
      isCompleted: false,
      createdAt: '2026-07-15T22:30:00.000Z',
      updatedAt: '2026-07-15T22:30:00.000Z',
    });
  });

  it('rejects empty titles', () => {
    expect(() => createTask({ title: '   ' }, idGenerator, clock)).toThrowError(
      DomainError,
      'Task title is required.',
    );
  });

  it('updates title, completion and category without mutating the original task', () => {
    const task = createTask({ title: 'Inicial', categoryId: 'category-1' }, idGenerator, clock);

    const updatedTask = updateTask(task, { title: 'Final', categoryId: 'category-2' }, clock);
    const completedTask = completeTask(updatedTask, clock);
    const reopenedTask = reopenTask(completedTask, clock);
    const detachedTask = detachTaskCategory(reopenedTask, 'category-2', clock);

    expect(task.title).toBe('Inicial');
    expect(updatedTask.title).toBe('Final');
    expect(completedTask.isCompleted).toBeTrue();
    expect(reopenedTask.isCompleted).toBeFalse();
    expect(detachedTask.categoryId).toBeNull();
  });
});
