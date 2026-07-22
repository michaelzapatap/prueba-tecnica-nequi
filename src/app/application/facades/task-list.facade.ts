import { computed, inject, Injectable, signal } from '@angular/core';

import { EntityId } from '../../domain/models/entity-id.model';
import { FEATURE_FLAGS, FeatureFlagService } from '../feature-flags/feature-flag.service';
import { TASK_RENDER_BATCH_SIZE, UNCATEGORIZED_CATEGORY_COLOR } from '../config/task-board.config';
import { sortCategoriesByName } from '../queries/category-list.query';
import {
  countTasks,
  selectTaskListPage,
  sortTasksByCreationDate,
  TaskCategoryFilter,
} from '../queries/task-list.query';
import { TaskBoardFeedbackService } from '../state/task-board-feedback.service';
import { TaskBoardStore } from '../state/task-board.store';
import { CategoryUseCases } from '../use-cases/category.use-cases';
import { TaskUseCases } from '../use-cases/task.use-cases';

export type CategoryFilter = TaskCategoryFilter;

@Injectable({ providedIn: 'root' })
export class TaskListFacade {
  private readonly taskUseCases = inject(TaskUseCases);
  private readonly categoryUseCases = inject(CategoryUseCases);
  private readonly featureFlagService = inject(FeatureFlagService);
  private readonly store = inject(TaskBoardStore);
  private readonly feedback = inject(TaskBoardFeedbackService);
  private readonly selectedCategoryState = signal<CategoryFilter>('all');
  private readonly searchQueryState = signal('');
  private readonly taskSearchEnabledState = signal(false);
  private readonly renderedTaskLimitState = signal(TASK_RENDER_BATCH_SIZE);
  private readonly loadingState = signal(false);
  private loadRequest: Promise<void> | null = null;

  readonly tasks = this.store.tasks;
  readonly categories = this.store.categories;
  readonly searchQuery = this.searchQueryState.asReadonly();
  readonly isTaskSearchEnabled = this.taskSearchEnabledState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly errorMessage = this.feedback.errorMessage;
  readonly renderBatchSize = TASK_RENDER_BATCH_SIZE;

  readonly selectedCategory = computed<CategoryFilter>(() => {
    const selectedCategory = this.selectedCategoryState();

    if (selectedCategory === 'all' || selectedCategory === 'uncategorized') {
      return selectedCategory;
    }

    return this.categories().some((category) => category.id === selectedCategory)
      ? selectedCategory
      : 'all';
  });

  private readonly taskCounts = computed(() => countTasks(this.tasks()));
  private readonly categoryMap = computed(
    () => new Map(this.categories().map((category) => [category.id, category])),
  );
  private readonly taskPage = computed(() =>
    selectTaskListPage(
      this.tasks(),
      {
        categoryFilter: this.selectedCategory(),
        searchQuery: this.searchQueryState(),
        isSearchEnabled: this.taskSearchEnabledState(),
      },
      this.renderedTaskLimitState(),
    ),
  );

  readonly pendingTasks = computed(() => this.taskCounts().pending);
  readonly completedTasks = computed(() => this.taskCounts().completed);
  readonly renderedTasks = computed(() => this.taskPage().tasks);
  readonly visibleTaskCount = computed(() => this.taskPage().matchingTaskCount);
  readonly hasMoreTasks = computed(() => this.renderedTasks().length < this.visibleTaskCount());
  readonly remainingTaskCount = computed(
    () => this.visibleTaskCount() - this.renderedTasks().length,
  );

  load(): Promise<void> {
    this.loadRequest ??= this.performLoad().finally(() => {
      this.loadRequest = null;
    });

    return this.loadRequest;
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
    this.renderedTaskLimitState.update((currentLimit) =>
      Math.min(currentLimit + TASK_RENDER_BATCH_SIZE, this.visibleTaskCount()),
    );
  }

  clearError(): void {
    this.feedback.clear();
  }

  getCategoryName(categoryId: EntityId | null): string {
    return categoryId
      ? (this.categoryMap().get(categoryId)?.name ?? 'Sin categoría')
      : 'Sin categoría';
  }

  getCategoryColor(categoryId: EntityId | null): string {
    return categoryId
      ? (this.categoryMap().get(categoryId)?.color ?? UNCATEGORIZED_CATEGORY_COLOR)
      : UNCATEGORIZED_CATEGORY_COLOR;
  }

  private async performLoad(): Promise<void> {
    this.loadingState.set(true);
    this.feedback.clear();
    const featureFlagRequest = this.resolveTaskSearchFlag();

    try {
      const [tasks, categories] = await Promise.all([
        this.taskUseCases.getTasks(),
        this.categoryUseCases.getCategories(),
      ]);

      this.store.replaceTasks(sortTasksByCreationDate(tasks));
      this.store.replaceCategories(sortCategoriesByName(categories));
      this.resetRenderedTasks();
    } catch (error) {
      this.feedback.report(error);
    } finally {
      this.loadingState.set(false);
    }

    this.applyTaskSearchFlag(await featureFlagRequest);
  }

  private async resolveTaskSearchFlag(): Promise<boolean> {
    try {
      return await this.featureFlagService.isEnabled(FEATURE_FLAGS.taskSearchEnabled);
    } catch {
      return false;
    }
  }

  private applyTaskSearchFlag(isTaskSearchEnabled: boolean): void {
    this.taskSearchEnabledState.set(isTaskSearchEnabled);
    this.resetRenderedTasks();

    if (!isTaskSearchEnabled) {
      this.searchQueryState.set('');
    }
  }

  private resetRenderedTasks(): void {
    this.renderedTaskLimitState.set(TASK_RENDER_BATCH_SIZE);
  }
}
