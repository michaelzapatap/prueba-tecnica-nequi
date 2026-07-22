import { inject, Injectable, signal } from '@angular/core';

import { EntityId } from '../../domain/models/entity-id.model';
import { sortCategoriesByName } from '../queries/category-list.query';
import { sortTasksByCreationDate } from '../queries/task-list.query';
import { TaskBoardFeedbackService } from '../state/task-board-feedback.service';
import { TaskBoardStore } from '../state/task-board.store';
import { CategoryUseCases } from '../use-cases/category.use-cases';
import { TaskUseCases } from '../use-cases/task.use-cases';

@Injectable({ providedIn: 'root' })
export class CategoryCommandFacade {
  private readonly categoryUseCases = inject(CategoryUseCases);
  private readonly taskUseCases = inject(TaskUseCases);
  private readonly store = inject(TaskBoardStore);
  private readonly feedback = inject(TaskBoardFeedbackService);
  private readonly creatingCategoryState = signal(false);
  private readonly pendingCategoryIdsState = signal<ReadonlySet<EntityId>>(new Set());

  readonly isCreatingCategory = this.creatingCategoryState.asReadonly();

  isCategoryPending(categoryId: EntityId): boolean {
    return this.pendingCategoryIdsState().has(categoryId);
  }

  async createCategory(name: string, color: string): Promise<boolean> {
    if (this.creatingCategoryState()) {
      return false;
    }

    this.creatingCategoryState.set(true);
    this.feedback.clear();

    try {
      const createdCategory = await this.categoryUseCases.createCategory({ name, color });
      this.store.addCategory(createdCategory);
      this.store.replaceCategories(sortCategoriesByName(this.store.categories()));
      return true;
    } catch (error) {
      this.feedback.report(error);
      return false;
    } finally {
      this.creatingCategoryState.set(false);
    }
  }

  updateCategory(categoryId: EntityId, name: string, color: string): Promise<boolean> {
    return this.runCategoryOperation(categoryId, async () => {
      const updatedCategory = await this.categoryUseCases.updateCategory(categoryId, {
        name,
        color,
      });
      this.store.replaceCategory(updatedCategory);
      this.store.replaceCategories(sortCategoriesByName(this.store.categories()));
    });
  }

  deleteCategory(categoryId: EntityId): Promise<boolean> {
    return this.runCategoryOperation(categoryId, async () => {
      await this.categoryUseCases.deleteCategory(categoryId);
      this.store.removeCategory(categoryId);
      this.store.replaceTasks(sortTasksByCreationDate(await this.taskUseCases.getTasks()));
    });
  }

  private async runCategoryOperation(
    categoryId: EntityId,
    operation: () => Promise<void>,
  ): Promise<boolean> {
    if (this.isCategoryPending(categoryId)) {
      return false;
    }

    this.setCategoryPending(categoryId, true);
    this.feedback.clear();

    try {
      await operation();
      return true;
    } catch (error) {
      this.feedback.report(error);
      return false;
    } finally {
      this.setCategoryPending(categoryId, false);
    }
  }

  private setCategoryPending(categoryId: EntityId, isPending: boolean): void {
    this.pendingCategoryIdsState.update((pendingCategoryIds) => {
      const nextPendingCategoryIds = new Set(pendingCategoryIds);

      if (isPending) {
        nextPendingCategoryIds.add(categoryId);
      } else {
        nextPendingCategoryIds.delete(categoryId);
      }

      return nextPendingCategoryIds;
    });
  }
}
