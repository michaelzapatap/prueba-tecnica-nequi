import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryRepository } from '../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../domain/repositories/repository.tokens';
import { TaskRepository } from '../domain/repositories/task.repository';
import { provideApplicationServices } from '../application/application.providers';
import { HomePage } from './home.page';

const taskRepository: TaskRepository = {
  findAll: async () => [],
  findById: async () => null,
  create: async () => {
    throw new Error('Not needed in this test.');
  },
  update: async () => {
    throw new Error('Not needed in this test.');
  },
  setCompletion: async () => {
    throw new Error('Not needed in this test.');
  },
  deleteById: async () => undefined,
};

const categoryRepository: CategoryRepository = {
  findAll: async () => [],
  findById: async () => null,
  create: async () => {
    throw new Error('Not needed in this test.');
  },
  update: async () => {
    throw new Error('Not needed in this test.');
  },
  deleteById: async () => undefined,
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: TASK_REPOSITORY, useValue: taskRepository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
        provideApplicationServices(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
