import { TestBed } from '@angular/core/testing';

import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TaskRepository } from '../../domain/repositories/task.repository';
import {
  FakeFeatureFlagService,
  InMemoryCategoryRepository,
  InMemoryTaskRepository,
} from '../../testing/in-memory-repositories';
import { provideApplicationServices } from '../application.providers';
import { FeatureFlagService } from '../feature-flags/feature-flag.service';
import { TaskListFacade } from './task-list.facade';

describe('TaskListFacade', () => {
  let facade: TaskListFacade;
  let featureFlagService: FakeFeatureFlagService;
  let taskRepository: InMemoryTaskRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TASK_REPOSITORY, useClass: InMemoryTaskRepository },
        { provide: CATEGORY_REPOSITORY, useClass: InMemoryCategoryRepository },
        { provide: FeatureFlagService, useClass: FakeFeatureFlagService },
        provideApplicationServices(),
      ],
    });

    facade = TestBed.inject(TaskListFacade);
    featureFlagService = TestBed.inject(FeatureFlagService) as FakeFeatureFlagService;
    taskRepository = TestBed.inject(TASK_REPOSITORY) as InMemoryTaskRepository;
  });

  it('loads local data and resolves the remote search flag', async () => {
    taskRepository.seed(2);

    await facade.load();

    expect(facade.tasks()).toHaveSize(2);
    expect(facade.isTaskSearchEnabled()).toBeTrue();
    expect(facade.isLoading()).toBeFalse();
    expect(taskRepository.findAllCalls).toBe(1);
  });

  it('deduplicates concurrent initial load requests', async () => {
    const firstLoad = facade.load();
    const secondLoad = facade.load();

    await Promise.all([firstLoad, secondLoad]);

    expect(taskRepository.findAllCalls).toBe(1);
  });

  it('filters by category and search while exposing only the render window', async () => {
    const categoryRepository = TestBed.inject(CATEGORY_REPOSITORY) as InMemoryCategoryRepository;
    const category = await categoryRepository.create({ name: 'Trabajo', color: '#2f80ed' });
    taskRepository.seed(65, category.id);
    await facade.load();

    facade.setCategoryFilter(category.id);
    facade.setSearchQuery('Tarea');

    expect(facade.visibleTaskCount()).toBe(65);
    expect(facade.renderedTasks()).toHaveSize(30);
    expect(facade.remainingTaskCount()).toBe(35);

    facade.loadMoreTasks();
    expect(facade.renderedTasks()).toHaveSize(60);

    facade.loadMoreTasks();
    expect(facade.renderedTasks()).toHaveSize(65);
    expect(facade.hasMoreTasks()).toBeFalse();
  });

  it('clears search and ignores new queries when the flag is disabled', async () => {
    featureFlagService.isSearchEnabled = false;
    taskRepository.seed(1);

    await facade.load();
    facade.setSearchQuery('sin coincidencias');

    expect(facade.isTaskSearchEnabled()).toBeFalse();
    expect(facade.searchQuery()).toBe('');
    expect(facade.visibleTaskCount()).toBe(1);
  });

  it('falls back to disabled search when the feature flag service fails unexpectedly', async () => {
    featureFlagService.error = new Error('Unexpected failure.');

    await facade.load();

    expect(facade.isTaskSearchEnabled()).toBeFalse();
  });

  it('normalizes a removed category filter and resolves fallback category presentation', async () => {
    facade.setCategoryFilter('missing-category');

    expect(facade.selectedCategory()).toBe('all');
    expect(facade.getCategoryName('missing-category')).toBe('Sin categoría');
    expect(facade.getCategoryColor('missing-category')).toBe('#8f9bb3');
    expect(facade.getCategoryName(null)).toBe('Sin categoría');
    expect(facade.getCategoryColor(null)).toBe('#8f9bb3');
  });

  it('reports local loading failures and allows clearing the feedback', async () => {
    taskRepository.operationError = new Error('Storage failure.');
    spyOn(taskRepository, 'findAll').and.rejectWith(taskRepository.operationError);

    await facade.load();

    expect(facade.errorMessage()).toContain('No pudimos');
    facade.clearError();
    expect(facade.errorMessage()).toBeNull();
  });
});
