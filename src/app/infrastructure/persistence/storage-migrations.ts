import { createEmptyState, PersistedState } from './storage-schema';

interface MaybePersistedState {
  readonly version?: unknown;
  readonly tasks?: unknown;
  readonly categories?: unknown;
}

export function migrateState(rawState: unknown): PersistedState {
  if (!isRecord(rawState)) {
    return createEmptyState();
  }

  const state = rawState as MaybePersistedState;

  if (state.version === 1) {
    return {
      version: 1,
      tasks: Array.isArray(state.tasks) ? state.tasks : [],
      categories: Array.isArray(state.categories) ? state.categories : [],
    };
  }

  return createEmptyState();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
