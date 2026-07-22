import { Injectable, signal } from '@angular/core';

import { Category } from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { Task } from '../../domain/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskBoardStore {
  private readonly taskState = signal<readonly Task[]>([]);
  private readonly categoryState = signal<readonly Category[]>([]);

  readonly tasks = this.taskState.asReadonly();
  readonly categories = this.categoryState.asReadonly();

  replaceTasks(tasks: readonly Task[]): void {
    this.taskState.set(tasks);
  }

  prependTask(task: Task): void {
    this.taskState.update((tasks) => [task, ...tasks]);
  }

  replaceTask(task: Task): void {
    this.taskState.update((tasks) =>
      tasks.map((currentTask) => (currentTask.id === task.id ? task : currentTask)),
    );
  }

  removeTask(taskId: EntityId): void {
    this.taskState.update((tasks) => tasks.filter((task) => task.id !== taskId));
  }

  replaceCategories(categories: readonly Category[]): void {
    this.categoryState.set(categories);
  }

  addCategory(category: Category): void {
    this.categoryState.update((categories) => [...categories, category]);
  }

  replaceCategory(category: Category): void {
    this.categoryState.update((categories) =>
      categories.map((currentCategory) =>
        currentCategory.id === category.id ? category : currentCategory,
      ),
    );
  }

  removeCategory(categoryId: EntityId): void {
    this.categoryState.update((categories) =>
      categories.filter((category) => category.id !== categoryId),
    );
  }
}
