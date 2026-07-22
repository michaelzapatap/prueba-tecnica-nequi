import { TestBed } from '@angular/core/testing';

import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../../domain/repositories/repository.tokens';
import {
  createDeferred,
  FakeFeatureFlagService,
  InMemoryCategoryRepository,
  InMemoryTaskRepository,
} from '../../testing/in-memory-repositories';
import { provideApplicationServices } from '../application.providers';
import { FeatureFlagService } from '../feature-flags/feature-flag.service';
import { TaskBoardFeedbackService } from '../state/task-board-feedback.service';
import { TaskBoardStore } from '../state/task-board.store';
import { TaskCommandFacade } from './task-command.facade';

describe('TaskCommandFacade', () => {
  let facade: TaskCommandFacade;
  let repository: InMemoryTaskRepository;
  let store: TaskBoardStore;
  let feedback: TaskBoardFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TASK_REPOSITORY, useClass: InMemoryTaskRepository },
        { provide: CATEGORY_REPOSITORY, useClass: InMemoryCategoryRepository },
        { provide: FeatureFlagService, useClass: FakeFeatureFlagService },
        provideApplicationServices(),
      ],
    });

    facade = TestBed.inject(TaskCommandFacade);
    repository = TestBed.inject(TASK_REPOSITORY) as InMemoryTaskRepository;
    store = TestBed.inject(TaskBoardStore);
    feedback = TestBed.inject(TaskBoardFeedbackService);
  });

  it('creates, completes and deletes a task incrementally', async () => {
    expect(await facade.createTask('Preparar entrega', null)).toBeTrue();
    const [task] = store.tasks();

    expect(task.title).toBe('Preparar entrega');
    expect(await facade.setTaskCompletion(task.id, true)).toBeTrue();
    expect(store.tasks()[0].isCompleted).toBeTrue();
    expect(await facade.deleteTask(task.id)).toBeTrue();
    expect(store.tasks()).toEqual([]);
    expect(repository.findAllCalls).toBe(0);
  });

  it('prevents duplicate creates while the first request is pending', async () => {
    const gate = createDeferred<void>();
    repository.createGate = gate.promise;

    const firstCreate = facade.createTask('Tarea única', null);
    expect(facade.isCreatingTask()).toBeTrue();
    expect(await facade.createTask('Duplicada', null)).toBeFalse();
    expect(repository.createCalls).toBe(1);

    gate.resolve(undefined);
    expect(await firstCreate).toBeTrue();
    expect(facade.isCreatingTask()).toBeFalse();
  });

  it('blocks concurrent operations for the same task id', async () => {
    await facade.createTask('Tarea', null);
    const [task] = store.tasks();
    const gate = createDeferred<void>();
    spyOn(repository, 'setCompletion').and.callFake(async () => {
      await gate.promise;
      return { ...task, isCompleted: true };
    });

    const completion = facade.setTaskCompletion(task.id, true);
    expect(facade.isTaskPending(task.id)).toBeTrue();
    expect(await facade.deleteTask(task.id)).toBeFalse();
    expect(repository.deleteCalls).toBe(0);

    gate.resolve(undefined);
    expect(await completion).toBeTrue();
    expect(facade.isTaskPending(task.id)).toBeFalse();
  });

  it('keeps state unchanged and reports errors when a command fails', async () => {
    repository.operationError = new Error('Write failed.');

    expect(await facade.createTask('No guardar', null)).toBeFalse();
    expect(store.tasks()).toEqual([]);
    expect(feedback.errorMessage()).toContain('No pudimos');
    expect(facade.isCreatingTask()).toBeFalse();
  });
});
