import { InjectionToken } from '@angular/core';

import { CategoryRepository } from './category.repository';
import { TaskRepository } from './task.repository';

export const TASK_REPOSITORY = new InjectionToken<TaskRepository>('TASK_REPOSITORY');
export const CATEGORY_REPOSITORY = new InjectionToken<CategoryRepository>('CATEGORY_REPOSITORY');
