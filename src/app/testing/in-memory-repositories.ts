/* istanbul ignore file -- deterministic test infrastructure */
import { FeatureFlagService } from '../application/feature-flags/feature-flag.service';
import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../domain/models/category.model';
import { EntityId } from '../domain/models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../domain/models/task.model';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { TaskRepository } from '../domain/repositories/task.repository';

export interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T | PromiseLike<T>) => void;
  readonly reject: (reason?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];
  findAllCalls = 0;
  createCalls = 0;
  setCompletionCalls = 0;
  deleteCalls = 0;
  createGate: Promise<void> | null = null;
  operationError: Error | null = null;

  seed(taskCount: number, categoryId: EntityId | null = null): void {
    this.tasks = Array.from({ length: taskCount }, (_, index) =>
      this.buildTask(`task-${index}`, `Tarea ${index}`, index, { categoryId }),
    );
  }

  async findAll(): Promise<readonly Task[]> {
    this.findAllCalls += 1;
    return this.tasks;
  }

  async findById(taskId: EntityId): Promise<Task | null> {
    return this.tasks.find((task) => task.id === taskId) ?? null;
  }

  async create(command: CreateTaskCommand): Promise<Task> {
    this.createCalls += 1;
    await this.createGate;
    this.throwWhenConfigured();
    const task = this.buildTask(`task-${this.tasks.length}`, command.title, this.tasks.length, {
      categoryId: command.categoryId ?? null,
    });
    this.tasks = [...this.tasks, task];
    return task;
  }

  async update(taskId: EntityId, command: UpdateTaskCommand): Promise<Task> {
    this.throwWhenConfigured();
    return this.updateTask(taskId, (task) => ({
      ...task,
      title: command.title,
      categoryId: command.categoryId ?? null,
    }));
  }

  async setCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task> {
    this.setCompletionCalls += 1;
    this.throwWhenConfigured();
    return this.updateTask(taskId, (task) => ({ ...task, isCompleted }));
  }

  async deleteById(taskId: EntityId): Promise<void> {
    this.deleteCalls += 1;
    this.throwWhenConfigured();
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  private throwWhenConfigured(): void {
    if (this.operationError) {
      throw this.operationError;
    }
  }

  private updateTask(taskId: EntityId, updater: (task: Task) => Task): Task {
    const task = this.tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      throw new Error('Task was not found.');
    }

    const updatedTask = updater(task);
    this.tasks = this.tasks.map((currentTask) =>
      currentTask.id === taskId ? updatedTask : currentTask,
    );
    return updatedTask;
  }

  private buildTask(
    id: EntityId,
    title: string,
    index: number,
    overrides: Partial<Task> = {},
  ): Task {
    const timestamp = new Date(
      Date.parse('2026-07-22T12:00:00.000Z') - index * 1_000,
    ).toISOString();

    return {
      id,
      title,
      categoryId: null,
      isCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...overrides,
    };
  }
}

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];
  createCalls = 0;
  updateCalls = 0;
  deleteCalls = 0;
  createGate: Promise<void> | null = null;
  operationError: Error | null = null;

  async findAll(): Promise<readonly Category[]> {
    return this.categories;
  }

  async findById(categoryId: EntityId): Promise<Category | null> {
    return this.categories.find((category) => category.id === categoryId) ?? null;
  }

  async create(command: CreateCategoryCommand): Promise<Category> {
    this.createCalls += 1;
    await this.createGate;
    this.throwWhenConfigured();
    const timestamp = '2026-07-22T12:00:00.000Z';
    const category: Category = {
      id: `category-${this.categories.length}`,
      name: command.name.trim(),
      color: command.color,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.categories = [...this.categories, category];
    return category;
  }

  async update(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category> {
    this.updateCalls += 1;
    this.throwWhenConfigured();
    const category = await this.findById(categoryId);

    if (!category) {
      throw new Error('Category was not found.');
    }

    const updatedCategory = { ...category, ...command };
    this.categories = this.categories.map((currentCategory) =>
      currentCategory.id === categoryId ? updatedCategory : currentCategory,
    );
    return updatedCategory;
  }

  async deleteById(categoryId: EntityId): Promise<void> {
    this.deleteCalls += 1;
    this.throwWhenConfigured();
    this.categories = this.categories.filter((category) => category.id !== categoryId);
  }

  private throwWhenConfigured(): void {
    if (this.operationError) {
      throw this.operationError;
    }
  }
}

export class FakeFeatureFlagService implements FeatureFlagService {
  isSearchEnabled = true;
  error: Error | null = null;

  async isEnabled(): Promise<boolean> {
    if (this.error) {
      throw this.error;
    }

    return this.isSearchEnabled;
  }
}
