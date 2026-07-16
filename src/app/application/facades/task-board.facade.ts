import { computed, Injectable, inject, signal } from '@angular/core';

import { DomainError } from '../../domain/errors/domain-error';
import { Category } from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { Task } from '../../domain/models/task.model';
import { FEATURE_FLAGS, FeatureFlagService } from '../feature-flags/feature-flag.service';
import { CategoryUseCases } from '../use-cases/category.use-cases';
import { TaskUseCases } from '../use-cases/task.use-cases';

export type CategoryFilter = EntityId | 'all' | 'uncategorized';

@Injectable({ providedIn: 'root' })
export class TaskBoardFacade {
  private readonly taskUseCases = inject(TaskUseCases);
  private readonly categoryUseCases = inject(CategoryUseCases);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly taskState = signal<readonly Task[]>([]);
  private readonly categoryState = signal<readonly Category[]>([]);
  private readonly selectedCategoryState = signal<CategoryFilter>('all');
  private readonly searchQueryState = signal('');
  private readonly taskSearchEnabledState = signal(false);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly tasks = this.taskState.asReadonly();
  readonly categories = this.categoryState.asReadonly();
  readonly selectedCategory = this.selectedCategoryState.asReadonly();
  readonly searchQuery = this.searchQueryState.asReadonly();
  readonly isTaskSearchEnabled = this.taskSearchEnabledState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();

  readonly pendingTasks = computed(
    () => this.taskState().filter((task) => !task.isCompleted).length,
  );

  readonly completedTasks = computed(
    () => this.taskState().filter((task) => task.isCompleted).length,
  );

  readonly visibleTasks = computed(() => {
    const selectedCategory = this.selectedCategoryState();
    const searchQuery = this.searchQueryState().trim().toLocaleLowerCase('es');
    let tasks = this.taskState();

    if (selectedCategory === 'uncategorized') {
      tasks = tasks.filter((task) => task.categoryId === null);
    } else if (selectedCategory !== 'all') {
      tasks = tasks.filter((task) => task.categoryId === selectedCategory);
    }

    if (!this.taskSearchEnabledState() || !searchQuery) {
      return tasks;
    }

    return tasks.filter((task) => task.title.toLocaleLowerCase('es').includes(searchQuery));
  });

  async load(): Promise<void> {
    const featureFlagRequest = this.loadFeatureFlags();

    await this.run(async () => {
      const [tasks, categories] = await Promise.all([
        this.taskUseCases.getTasks(),
        this.categoryUseCases.getCategories(),
      ]);

      this.taskState.set(this.sortTasks(tasks));
      this.categoryState.set(this.sortCategories(categories));
    });

    await featureFlagRequest;
  }

  setCategoryFilter(categoryFilter: CategoryFilter): void {
    this.selectedCategoryState.set(categoryFilter);
  }

  setSearchQuery(searchQuery: string): void {
    this.searchQueryState.set(this.taskSearchEnabledState() ? searchQuery : '');
  }

  clearError(): void {
    this.errorState.set(null);
  }

  getCategoryName(categoryId: EntityId | null): string {
    if (!categoryId) {
      return 'Sin categoría';
    }

    return (
      this.categoryState().find((category) => category.id === categoryId)?.name ?? 'Sin categoría'
    );
  }

  getCategoryColor(categoryId: EntityId | null): string {
    return this.categoryState().find((category) => category.id === categoryId)?.color ?? '#8f9bb3';
  }

  async createTask(title: string, categoryId: EntityId | null): Promise<void> {
    await this.run(async () => {
      await this.taskUseCases.createTask({ title, categoryId });
      await this.reloadTasks();
    });
  }

  async setTaskCompletion(task: Task, isCompleted: boolean): Promise<void> {
    await this.run(async () => {
      await this.taskUseCases.setTaskCompletion(task.id, isCompleted);
      await this.reloadTasks();
    });
  }

  async deleteTask(taskId: EntityId): Promise<void> {
    await this.run(async () => {
      await this.taskUseCases.deleteTask(taskId);
      await this.reloadTasks();
    });
  }

  async createCategory(name: string, color: string): Promise<void> {
    await this.run(async () => {
      await this.categoryUseCases.createCategory({ name, color });
      await this.reloadCategories();
    });
  }

  async updateCategory(categoryId: EntityId, name: string, color: string): Promise<void> {
    await this.run(async () => {
      await this.categoryUseCases.updateCategory(categoryId, { name, color });
      await this.reloadCategories();
    });
  }

  async deleteCategory(categoryId: EntityId): Promise<void> {
    await this.run(async () => {
      await this.categoryUseCases.deleteCategory(categoryId);
      await Promise.all([this.reloadTasks(), this.reloadCategories()]);

      if (this.selectedCategoryState() === categoryId) {
        this.selectedCategoryState.set('all');
      }
    });
  }

  private async reloadTasks(): Promise<void> {
    this.taskState.set(this.sortTasks(await this.taskUseCases.getTasks()));
  }

  private async reloadCategories(): Promise<void> {
    this.categoryState.set(this.sortCategories(await this.categoryUseCases.getCategories()));
  }

  private async loadFeatureFlags(): Promise<void> {
    let isTaskSearchEnabled = false;

    try {
      isTaskSearchEnabled = await this.featureFlagService.isEnabled(
        FEATURE_FLAGS.taskSearchEnabled,
      );
    } catch {
      isTaskSearchEnabled = false;
    }

    this.taskSearchEnabledState.set(isTaskSearchEnabled);

    if (!isTaskSearchEnabled) {
      this.searchQueryState.set('');
    }
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);

    try {
      await action();
    } catch (error) {
      this.errorState.set(this.toUserMessage(error));
    } finally {
      this.loadingState.set(false);
    }
  }

  private sortTasks(tasks: readonly Task[]): readonly Task[] {
    return [...tasks].sort((firstTask, secondTask) =>
      secondTask.createdAt.localeCompare(firstTask.createdAt),
    );
  }

  private sortCategories(categories: readonly Category[]): readonly Category[] {
    return [...categories].sort((firstCategory, secondCategory) =>
      firstCategory.name.localeCompare(secondCategory.name, 'es'),
    );
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof DomainError) {
      return 'Revisa los datos ingresados.';
    }

    return 'No pudimos completar la acción. Inténtalo de nuevo.';
  }
}
