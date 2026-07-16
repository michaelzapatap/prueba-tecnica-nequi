import { DomainError } from '../../domain/errors/domain-error';
import {
  completeTask,
  createTask,
  reopenTask,
  updateTask,
} from '../../domain/factories/task.factory';
import { EntityId } from '../../domain/models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Clock, SystemClock } from '../../domain/services/clock';
import { CryptoIdGenerator, IdGenerator } from '../../domain/services/id-generator';
import { VersionedLocalStore } from './versioned-local-store';

export class LocalTaskRepository implements TaskRepository {
  private readonly clock: Clock = new SystemClock();
  private readonly idGenerator: IdGenerator = new CryptoIdGenerator();

  constructor(private readonly store: VersionedLocalStore) {}

  async findAll(): Promise<readonly Task[]> {
    return this.store.read().tasks;
  }

  async findById(taskId: EntityId): Promise<Task | null> {
    return this.store.read().tasks.find((task) => task.id === taskId) ?? null;
  }

  async create(command: CreateTaskCommand): Promise<Task> {
    this.assertCategoryExists(command.categoryId ?? null);

    const task = createTask(command, this.idGenerator, this.clock);

    this.store.update((state) => ({
      ...state,
      tasks: [...state.tasks, task],
    }));

    return task;
  }

  async update(taskId: EntityId, command: UpdateTaskCommand): Promise<Task> {
    this.assertCategoryExists(command.categoryId ?? null);

    let updatedTask: Task | null = null;

    this.store.update((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        updatedTask = updateTask(task, command, this.clock);
        return updatedTask;
      });

      return { ...state, tasks };
    });

    if (!updatedTask) {
      throw new DomainError('Task was not found.');
    }

    return updatedTask;
  }

  async setCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task> {
    let updatedTask: Task | null = null;

    this.store.update((state) => {
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        updatedTask = isCompleted ? completeTask(task, this.clock) : reopenTask(task, this.clock);
        return updatedTask;
      });

      return { ...state, tasks };
    });

    if (!updatedTask) {
      throw new DomainError('Task was not found.');
    }

    return updatedTask;
  }

  async deleteById(taskId: EntityId): Promise<void> {
    this.store.update((state) => ({
      ...state,
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  }

  private assertCategoryExists(categoryId: EntityId | null): void {
    if (!categoryId) {
      return;
    }

    const categoryExists = this.store
      .read()
      .categories.some((category) => category.id === categoryId);

    if (!categoryExists) {
      throw new DomainError('Category was not found.');
    }
  }
}
