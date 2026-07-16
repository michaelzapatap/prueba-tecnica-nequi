import { Provider } from '@angular/core';

import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../domain/repositories/repository.tokens';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { TaskRepository } from '../domain/repositories/task.repository';
import { CategoryUseCases } from './use-cases/category.use-cases';
import { TaskUseCases } from './use-cases/task.use-cases';

export function provideApplicationServices(): Provider[] {
  return [
    {
      provide: TaskUseCases,
      useFactory: (taskRepository: TaskRepository) => new TaskUseCases(taskRepository),
      deps: [TASK_REPOSITORY],
    },
    {
      provide: CategoryUseCases,
      useFactory: (categoryRepository: CategoryRepository) =>
        new CategoryUseCases(categoryRepository),
      deps: [CATEGORY_REPOSITORY],
    },
  ];
}
