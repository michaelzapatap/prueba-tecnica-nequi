import { Category } from '../../domain/models/category.model';
import { Task } from '../../domain/models/task.model';

export const STORAGE_KEY = 'nequi-tasks-state';
export const CURRENT_STORAGE_VERSION = 1;

export interface PersistedStateV1 {
  readonly version: 1;
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
}

export type PersistedState = PersistedStateV1;

export function createEmptyState(): PersistedState {
  return {
    version: CURRENT_STORAGE_VERSION,
    tasks: [],
    categories: [],
  };
}
