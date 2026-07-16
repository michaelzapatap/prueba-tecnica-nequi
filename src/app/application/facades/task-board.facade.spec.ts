import { TestBed } from '@angular/core/testing';

import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../../domain/models/task.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { provideApplicationServices } from '../application.providers';
import { FeatureFlagService } from '../feature-flags/feature-flag.service';
import { TaskBoardFacade } from './task-board.facade';

class FakeTaskRepository implements TaskRepository {
  private tasks: Task[] = [];
  findAllCalls = 0;

  async findAll(): Promise<readonly Task[]> {
    this.findAllCalls += 1;
    return this.tasks;
  }

  seedTasks(taskCount: number): void {
    this.tasks = Array.from({ length: taskCount }, (_, index) => ({
      id: `seed-task-${index}`,
      title: `Tarea ${index}`,
      categoryId: null,
      isCompleted: false,
      createdAt: new Date(Date.parse('2026-07-16T12:00:00.000Z') - index * 1_000).toISOString(),
      updatedAt: new Date(Date.parse('2026-07-16T12:00:00.000Z') - index * 1_000).toISOString(),
    }));
  }

  async findById(taskId: EntityId): Promise<Task | null> {
    return this.tasks.find((task) => task.id === taskId) ?? null;
  }

  async create(command: CreateTaskCommand): Promise<Task> {
    const task: Task = {
      id: `task-${this.tasks.length + 1}`,
      title: command.title.trim(),
      categoryId: command.categoryId ?? null,
      isCompleted: false,
      createdAt: `2026-07-16T10:00:0${this.tasks.length}.000Z`,
      updatedAt: `2026-07-16T10:00:0${this.tasks.length}.000Z`,
    };

    this.tasks = [...this.tasks, task];
    return task;
  }

  async update(taskId: EntityId, command: UpdateTaskCommand): Promise<Task> {
    const task = this.tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      throw new Error('Task was not found.');
    }

    const updatedTask = {
      ...task,
      title: command.title,
      categoryId: command.categoryId ?? null,
    };

    this.tasks = this.tasks.map((currentTask) =>
      currentTask.id === taskId ? updatedTask : currentTask,
    );
    return updatedTask;
  }

  async setCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task> {
    const task = this.tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      throw new Error('Task was not found.');
    }

    const updatedTask = { ...task, isCompleted };
    this.tasks = this.tasks.map((currentTask) =>
      currentTask.id === taskId ? updatedTask : currentTask,
    );
    return updatedTask;
  }

  async deleteById(taskId: EntityId): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }
}

class FakeCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async findAll(): Promise<readonly Category[]> {
    return this.categories;
  }

  async findById(categoryId: EntityId): Promise<Category | null> {
    return this.categories.find((category) => category.id === categoryId) ?? null;
  }

  async create(command: CreateCategoryCommand): Promise<Category> {
    const category: Category = {
      id: `category-${this.categories.length + 1}`,
      name: command.name.trim(),
      color: command.color,
      createdAt: `2026-07-16T10:01:0${this.categories.length}.000Z`,
      updatedAt: `2026-07-16T10:01:0${this.categories.length}.000Z`,
    };

    this.categories = [...this.categories, category];
    return category;
  }

  async update(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category> {
    const category = this.categories.find((currentCategory) => currentCategory.id === categoryId);

    if (!category) {
      throw new Error('Category was not found.');
    }

    const updatedCategory = {
      ...category,
      name: command.name,
      color: command.color,
    };

    this.categories = this.categories.map((currentCategory) =>
      currentCategory.id === categoryId ? updatedCategory : currentCategory,
    );
    return updatedCategory;
  }

  async deleteById(categoryId: EntityId): Promise<void> {
    this.categories = this.categories.filter((category) => category.id !== categoryId);
  }
}

class FakeFeatureFlagService implements FeatureFlagService {
  isSearchEnabled = true;

  async isEnabled(): Promise<boolean> {
    return this.isSearchEnabled;
  }
}

describe('TaskBoardFacade', () => {
  let facade: TaskBoardFacade;
  let featureFlagService: FakeFeatureFlagService;
  let taskRepository: FakeTaskRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TASK_REPOSITORY, useClass: FakeTaskRepository },
        { provide: CATEGORY_REPOSITORY, useClass: FakeCategoryRepository },
        { provide: FeatureFlagService, useClass: FakeFeatureFlagService },
        provideApplicationServices(),
      ],
    });

    facade = TestBed.inject(TaskBoardFacade);
    featureFlagService = TestBed.inject(FeatureFlagService) as FakeFeatureFlagService;
    taskRepository = TestBed.inject(TASK_REPOSITORY) as FakeTaskRepository;
  });

  it('loads tasks and categories through application use cases', async () => {
    await facade.createCategory('Trabajo', '#2f80ed');
    const [category] = facade.categories();

    await facade.createTask('Preparar demo', category.id);

    expect(facade.categories().map((currentCategory) => currentCategory.name)).toEqual(['Trabajo']);
    expect(facade.tasks().map((task) => task.title)).toEqual(['Preparar demo']);
    expect(facade.pendingTasks()).toBe(1);
  });

  it('filters tasks by category and uncategorized items', async () => {
    await facade.createCategory('Casa', '#27ab83');
    const [category] = facade.categories();

    await facade.createTask('Ordenar recibos', category.id);
    await facade.createTask('Leer correo', null);

    facade.setCategoryFilter(category.id);
    expect(facade.visibleTasks().map((task) => task.title)).toEqual(['Ordenar recibos']);

    facade.setCategoryFilter('uncategorized');
    expect(facade.visibleTasks().map((task) => task.title)).toEqual(['Leer correo']);
  });

  it('filters task titles when remote search is enabled', async () => {
    await facade.load();
    await facade.createTask('Preparar demostración', null);
    await facade.createTask('Enviar correo', null);

    facade.setSearchQuery('demo');

    expect(facade.isTaskSearchEnabled()).toBeTrue();
    expect(facade.visibleTasks().map((task) => task.title)).toEqual(['Preparar demostración']);
  });

  it('ignores search queries when the remote flag is disabled', async () => {
    featureFlagService.isSearchEnabled = false;
    await facade.load();
    await facade.createTask('Preparar demostración', null);

    facade.setSearchQuery('sin coincidencias');

    expect(facade.isTaskSearchEnabled()).toBeFalse();
    expect(facade.searchQuery()).toBe('');
    expect(facade.visibleTasks()).toHaveSize(1);
  });

  it('updates counters when a task is completed and deleted', async () => {
    await facade.createTask('Enviar evidencia', null);
    const [task] = facade.tasks();

    await facade.setTaskCompletion(task, true);

    expect(facade.pendingTasks()).toBe(0);
    expect(facade.completedTasks()).toBe(1);

    await facade.deleteTask(task.id);

    expect(facade.tasks()).toEqual([]);
  });

  it('renders large lists in incremental batches and resets the window on filters', async () => {
    taskRepository.seedTasks(65);

    await facade.load();

    expect(facade.visibleTasks()).toHaveSize(65);
    expect(facade.renderedTasks()).toHaveSize(30);
    expect(facade.remainingTaskCount()).toBe(35);

    facade.loadMoreTasks();
    expect(facade.renderedTasks()).toHaveSize(60);

    facade.setCategoryFilter('uncategorized');
    expect(facade.renderedTasks()).toHaveSize(30);
  });

  it('updates task state without reloading the complete repository after each mutation', async () => {
    await facade.load();
    await facade.createTask('Preparar entrega', null);
    const [task] = facade.tasks();
    await facade.setTaskCompletion(task, true);
    await facade.deleteTask(task.id);

    expect(taskRepository.findAllCalls).toBe(1);
  });
});
