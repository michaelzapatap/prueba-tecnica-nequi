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
import { CategoryCommandFacade } from './category-command.facade';

describe('CategoryCommandFacade', () => {
  let facade: CategoryCommandFacade;
  let repository: InMemoryCategoryRepository;
  let taskRepository: InMemoryTaskRepository;
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

    facade = TestBed.inject(CategoryCommandFacade);
    repository = TestBed.inject(CATEGORY_REPOSITORY) as InMemoryCategoryRepository;
    taskRepository = TestBed.inject(TASK_REPOSITORY) as InMemoryTaskRepository;
    store = TestBed.inject(TaskBoardStore);
    feedback = TestBed.inject(TaskBoardFeedbackService);
  });

  it('creates and updates categories in sorted order', async () => {
    expect(await facade.createCategory('Trabajo', '#2f80ed')).toBeTrue();
    expect(await facade.createCategory('Casa', '#27ab83')).toBeTrue();
    expect(store.categories().map((category) => category.name)).toEqual(['Casa', 'Trabajo']);

    const trabajo = store.categories().find((category) => category.name === 'Trabajo')!;
    expect(await facade.updateCategory(trabajo.id, 'Archivo', '#8f9bb3')).toBeTrue();
    expect(store.categories().map((category) => category.name)).toEqual(['Archivo', 'Casa']);
  });

  it('prevents duplicate category creation while the request is pending', async () => {
    const gate = createDeferred<void>();
    repository.createGate = gate.promise;

    const firstCreate = facade.createCategory('Entrega', '#2f80ed');
    expect(facade.isCreatingCategory()).toBeTrue();
    expect(await facade.createCategory('Duplicada', '#2f80ed')).toBeFalse();
    expect(repository.createCalls).toBe(1);

    gate.resolve(undefined);
    expect(await firstCreate).toBeTrue();
    expect(facade.isCreatingCategory()).toBeFalse();
  });

  it('prevents update and delete races for the same category', async () => {
    await facade.createCategory('Entrega', '#2f80ed');
    const [category] = store.categories();
    const gate = createDeferred<void>();
    spyOn(repository, 'update').and.callFake(async () => {
      await gate.promise;
      return { ...category, name: 'Actualizada' };
    });

    const update = facade.updateCategory(category.id, 'Actualizada', category.color);
    expect(facade.isCategoryPending(category.id)).toBeTrue();
    expect(await facade.deleteCategory(category.id)).toBeFalse();
    expect(repository.deleteCalls).toBe(0);

    gate.resolve(undefined);
    expect(await update).toBeTrue();
    expect(facade.isCategoryPending(category.id)).toBeFalse();
  });

  it('reloads task state after deleting a category', async () => {
    await facade.createCategory('Trabajo', '#2f80ed');
    const [category] = store.categories();
    taskRepository.seed(1, category.id);

    expect(await facade.deleteCategory(category.id)).toBeTrue();
    expect(store.categories()).toEqual([]);
    expect(store.tasks()).toHaveSize(1);
    expect(taskRepository.findAllCalls).toBe(1);
  });

  it('reports command failures without clearing the current state', async () => {
    await facade.createCategory('Trabajo', '#2f80ed');
    const [category] = store.categories();
    repository.operationError = new Error('Write failed.');

    expect(await facade.deleteCategory(category.id)).toBeFalse();
    expect(store.categories()).toHaveSize(1);
    expect(feedback.errorMessage()).toContain('No pudimos');
    expect(facade.isCategoryPending(category.id)).toBeFalse();
  });
});
