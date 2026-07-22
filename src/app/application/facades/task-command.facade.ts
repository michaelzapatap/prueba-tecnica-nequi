import { inject, Injectable, signal } from '@angular/core';

import { EntityId } from '../../domain/models/entity-id.model';
import { TaskBoardFeedbackService } from '../state/task-board-feedback.service';
import { TaskBoardStore } from '../state/task-board.store';
import { TaskUseCases } from '../use-cases/task.use-cases';

@Injectable({ providedIn: 'root' })
export class TaskCommandFacade {
  private readonly taskUseCases = inject(TaskUseCases);
  private readonly store = inject(TaskBoardStore);
  private readonly feedback = inject(TaskBoardFeedbackService);
  private readonly creatingTaskState = signal(false);
  private readonly pendingTaskIdsState = signal<ReadonlySet<EntityId>>(new Set());

  readonly isCreatingTask = this.creatingTaskState.asReadonly();

  isTaskPending(taskId: EntityId): boolean {
    return this.pendingTaskIdsState().has(taskId);
  }

  async createTask(title: string, categoryId: EntityId | null): Promise<boolean> {
    if (this.creatingTaskState()) {
      return false;
    }

    this.creatingTaskState.set(true);
    this.feedback.clear();

    try {
      const createdTask = await this.taskUseCases.createTask({ title, categoryId });
      this.store.prependTask(createdTask);
      return true;
    } catch (error) {
      this.feedback.report(error);
      return false;
    } finally {
      this.creatingTaskState.set(false);
    }
  }

  setTaskCompletion(taskId: EntityId, isCompleted: boolean): Promise<boolean> {
    return this.runTaskOperation(taskId, async () => {
      const updatedTask = await this.taskUseCases.setTaskCompletion(taskId, isCompleted);
      this.store.replaceTask(updatedTask);
    });
  }

  deleteTask(taskId: EntityId): Promise<boolean> {
    return this.runTaskOperation(taskId, async () => {
      await this.taskUseCases.deleteTask(taskId);
      this.store.removeTask(taskId);
    });
  }

  private async runTaskOperation(
    taskId: EntityId,
    operation: () => Promise<void>,
  ): Promise<boolean> {
    if (this.isTaskPending(taskId)) {
      return false;
    }

    this.setTaskPending(taskId, true);
    this.feedback.clear();

    try {
      await operation();
      return true;
    } catch (error) {
      this.feedback.report(error);
      return false;
    } finally {
      this.setTaskPending(taskId, false);
    }
  }

  private setTaskPending(taskId: EntityId, isPending: boolean): void {
    this.pendingTaskIdsState.update((pendingTaskIds) => {
      const nextPendingTaskIds = new Set(pendingTaskIds);

      if (isPending) {
        nextPendingTaskIds.add(taskId);
      } else {
        nextPendingTaskIds.delete(taskId);
      }

      return nextPendingTaskIds;
    });
  }
}
