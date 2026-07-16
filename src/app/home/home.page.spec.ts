import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideApplicationServices } from '../application/application.providers';
import { TaskBoardFacade } from '../application/facades/task-board.facade';
import { FeatureFlagService } from '../application/feature-flags/feature-flag.service';
import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../domain/models/category.model';
import { EntityId } from '../domain/models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../domain/models/task.model';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../domain/repositories/repository.tokens';
import { TaskRepository } from '../domain/repositories/task.repository';
import { HomePage } from './home.page';

class InteractiveTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  seed(taskCount: number): void {
    this.tasks = Array.from({ length: taskCount }, (_, index) =>
      this.buildTask(`task-${index}`, `Tarea ${index}`, index),
    );
  }

  async findAll(): Promise<readonly Task[]> {
    return this.tasks;
  }

  async findById(taskId: EntityId): Promise<Task | null> {
    return this.tasks.find((task) => task.id === taskId) ?? null;
  }

  async create(command: CreateTaskCommand): Promise<Task> {
    const task = this.buildTask(`task-${this.tasks.length}`, command.title, this.tasks.length, {
      categoryId: command.categoryId ?? null,
    });
    this.tasks = [...this.tasks, task];
    return task;
  }

  async update(taskId: EntityId, command: UpdateTaskCommand): Promise<Task> {
    return this.updateTask(taskId, (task) => ({
      ...task,
      title: command.title,
      categoryId: command.categoryId ?? null,
    }));
  }

  async setCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task> {
    return this.updateTask(taskId, (task) => ({ ...task, isCompleted }));
  }

  async deleteById(taskId: EntityId): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  private updateTask(taskId: EntityId, updater: (task: Task) => Task): Task {
    const task = this.tasks.find((currentTask) => currentTask.id === taskId);

    if (!task) {
      throw new Error('Task was not found.');
    }

    const updatedTask = updater(task);
    this.tasks = this.tasks.map((currentTask) =>
      currentTask.id === taskId ? updatedTask : currentTask,
    );
    return updatedTask;
  }

  private buildTask(
    id: EntityId,
    title: string,
    index: number,
    overrides: Partial<Task> = {},
  ): Task {
    const timestamp = new Date(
      Date.parse('2026-07-16T12:00:00.000Z') - index * 1_000,
    ).toISOString();

    return {
      id,
      title,
      categoryId: null,
      isCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...overrides,
    };
  }
}

class InteractiveCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async findAll(): Promise<readonly Category[]> {
    return this.categories;
  }

  async findById(categoryId: EntityId): Promise<Category | null> {
    return this.categories.find((category) => category.id === categoryId) ?? null;
  }

  async create(command: CreateCategoryCommand): Promise<Category> {
    const timestamp = '2026-07-16T12:00:00.000Z';
    const category: Category = {
      id: `category-${this.categories.length}`,
      name: command.name,
      color: command.color,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.categories = [...this.categories, category];
    return category;
  }

  async update(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category> {
    const category = await this.findById(categoryId);

    if (!category) {
      throw new Error('Category was not found.');
    }

    const updatedCategory = { ...category, ...command };
    this.categories = this.categories.map((currentCategory) =>
      currentCategory.id === categoryId ? updatedCategory : currentCategory,
    );
    return updatedCategory;
  }

  async deleteById(categoryId: EntityId): Promise<void> {
    this.categories = this.categories.filter((category) => category.id !== categoryId);
  }
}

const featureFlagService: FeatureFlagService = {
  isEnabled: async () => true,
};

describe('HomePage interactions', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let taskRepository: InteractiveTaskRepository;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: TASK_REPOSITORY, useClass: InteractiveTaskRepository },
        { provide: CATEGORY_REPOSITORY, useClass: InteractiveCategoryRepository },
        { provide: FeatureFlagService, useValue: featureFlagService },
        provideApplicationServices(),
      ],
    }).compileComponents();

    taskRepository = TestBed.inject(TASK_REPOSITORY) as InteractiveTaskRepository;
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates a task and renders its Spanish interface content', async () => {
    component.onTaskTitleChange('Preparar entrega');

    await component.createTask();
    fixture.detectChanges();

    expect(component.facade.tasks().map((task) => task.title)).toEqual(['Preparar entrega']);
    expect(fixture.nativeElement.querySelector('.task-row h2')?.textContent).toContain(
      'Preparar entrega',
    );
  });

  it('completes and deletes a task through page handlers', async () => {
    component.onTaskTitleChange('Enviar evidencia');
    await component.createTask();
    const [task] = component.facade.tasks();

    await component.toggleTask(task, true);
    expect(component.facade.completedTasks()).toBe(1);

    await component.deleteTask(task.id);
    expect(component.facade.tasks()).toEqual([]);
  });

  it('expands a large rendered list when the user clicks the load-more control', async () => {
    taskRepository.seed(35);
    await TestBed.inject(TaskBoardFacade).load();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.task-row')).toHaveSize(30);

    const loadMoreButton = fixture.nativeElement.querySelector('.load-more-button') as HTMLElement;
    loadMoreButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.task-row')).toHaveSize(35);
    expect(fixture.nativeElement.querySelector('.load-more-button')).toBeNull();
  });
});
