import { computed, Injectable, inject, signal } from '@angular/core';

import { DomainError } from '../../domain/errors/domain-error';
import { Category } from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { Task } from '../../domain/models/task.model';
import { FEATURE_FLAGS, FeatureFlagService } from '../feature-flags/feature-flag.service';
import { CategoryUseCases } from '../use-cases/category.use-cases';
import { TaskUseCases } from '../use-cases/task.use-cases';
import {
  countTasks,
  queryTasks,
  sortTasksByCreationDate,
  TASK_RENDER_BATCH_SIZE,
  TaskCategoryFilter,
} from '../queries/task-list.query';

export type CategoryFilter = TaskCategoryFilter;

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
  private readonly renderedTaskLimitState = signal(TASK_RENDER_BATCH_SIZE);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly tasks = this.taskState.asReadonly();
  readonly categories = this.categoryState.asReadonly();
  readonly selectedCategory = this.selectedCategoryState.asReadonly();
  readonly searchQuery = this.searchQueryState.asReadonly();
  readonly isTaskSearchEnabled = this.taskSearchEnabledState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly errorMessage = this.errorState.asReadonly();
  readonly renderBatchSize = TASK_RENDER_BATCH_SIZE;

  private readonly taskCounts = computed(() => countTasks(this.taskState()));
  private readonly categoryMap = computed(
    () => new Map(this.categoryState().map((category) => [category.id, category])),
  );

  readonly pendingTasks = computed(() => this.taskCounts().pending);
  readonly completedTasks = computed(() => this.taskCounts().completed);

  readonly visibleTasks = computed(() =>
    queryTasks(this.taskState(), {
      categoryFilter: this.selectedCategoryState(),
      searchQuery: this.searchQueryState(),
      isSearchEnabled: this.taskSearchEnabledState(),
    }),
  );

  readonly renderedTasks = computed(() =>
    this.visibleTasks().slice(0, this.renderedTaskLimitState()),
  );

  readonly hasMoreTasks = computed(() => this.renderedTasks().length < this.visibleTasks().length);

  readonly remainingTaskCount = computed(
    () => this.visibleTasks().length - this.renderedTasks().length,
  );

  async load(): Promise<void> {
    const featureFlagRequest = this.loadFeatureFlags();

    await this.run(async () => {
      const [tasks, categories] = await Promise.all([
        this.taskUseCases.getTasks(),
        this.categoryUseCases.getCategories(),
      ]);

      this.taskState.set(sortTasksByCreationDate(tasks));
      this.categoryState.set(this.sortCategories(categories));
      this.resetRenderedTasks();
    });

    await featureFlagRequest;
  }

  setCategoryFilter(categoryFilter: CategoryFilter): void {
    this.selectedCategoryState.set(categoryFilter);
    this.resetRenderedTasks();
  }

  setSearchQuery(searchQuery: string): void {
    this.searchQueryState.set(this.taskSearchEnabledState() ? searchQuery : '');
    this.resetRenderedTasks();
  }

  loadMoreTasks(): void {
    this.renderedTaskLimitState.update((currentLimit) => currentLimit + TASK_RENDER_BATCH_SIZE);
  }

  clearError(): void {
    this.errorState.set(null);
  }

  getCategoryName(categoryId: EntityId | null): string {
    if (!categoryId) {
      return 'Sin categoría';
    }

    return this.categoryMap().get(categoryId)?.name ?? 'Sin categoría';
  }

  getCategoryColor(categoryId: EntityId | null): string {
    return categoryId ? (this.categoryMap().get(categoryId)?.color ?? '#8f9bb3') : '#8f9bb3';
  }

  async createTask(title: string, categoryId: EntityId | null): Promise<void> {
    await this.run(async () => {
      const createdTask = await this.taskUseCases.createTask({ title, categoryId });
      this.taskState.update((tasks) => [createdTask, ...tasks]);
      this.resetRenderedTasks();
    });
  }

  async setTaskCompletion(task: Task, isCompleted: boolean): Promise<void> {
    await this.run(async () => {
      const updatedTask = await this.taskUseCases.setTaskCompletion(task.id, isCompleted);
      this.taskState.update((tasks) =>
        tasks.map((currentTask) => (currentTask.id === updatedTask.id ? updatedTask : currentTask)),
      );
    });
  }

  async deleteTask(taskId: EntityId): Promise<void> {
    await this.run(async () => {
      await this.taskUseCases.deleteTask(taskId);
      this.taskState.update((tasks) => tasks.filter((task) => task.id !== taskId));
    });
  }

  async createCategory(name: string, color: string): Promise<void> {
    await this.run(async () => {
      const createdCategory = await this.categoryUseCases.createCategory({ name, color });
      this.categoryState.update((categories) =>
        this.sortCategories([...categories, createdCategory]),
      );
    });
  }

  async updateCategory(categoryId: EntityId, name: string, color: string): Promise<void> {
    await this.run(async () => {
      const updatedCategory = await this.categoryUseCases.updateCategory(categoryId, {
        name,
        color,
      });
      this.categoryState.update((categories) =>
        this.sortCategories(
          categories.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        ),
      );
    });
  }

  async deleteCategory(categoryId: EntityId): Promise<void> {
    await this.run(async () => {
      await this.categoryUseCases.deleteCategory(categoryId);
      await Promise.all([this.reloadTasks(), this.reloadCategories()]);

      if (this.selectedCategoryState() === categoryId) {
        this.selectedCategoryState.set('all');
      }

      this.resetRenderedTasks();
    });
  }

  private async reloadTasks(): Promise<void> {
    this.taskState.set(sortTasksByCreationDate(await this.taskUseCases.getTasks()));
  }

  private async reloadCategories(): Promise<void> {
    this.categoryState.set(this.sortCategories(await this.categoryUseCases.getCategories()));
  }

  private resetRenderedTasks(): void {
    this.renderedTaskLimitState.set(TASK_RENDER_BATCH_SIZE);
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
    this.resetRenderedTasks();

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
