import { KeyValueStorage } from './key-value-storage';
import { createEmptyState, PersistedState, STORAGE_KEY } from './storage-schema';
import { migrateState } from './storage-migrations';

export class VersionedLocalStore {
  constructor(private readonly storage: KeyValueStorage) {}

  read(): PersistedState {
    const serializedState = this.storage.getItem(STORAGE_KEY);

    if (!serializedState) {
      return createEmptyState();
    }

    try {
      return migrateState(JSON.parse(serializedState));
    } catch {
      return createEmptyState();
    }
  }

  write(state: PersistedState): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  update(mutator: (state: PersistedState) => PersistedState): PersistedState {
    const nextState = mutator(this.read());
    this.write(nextState);
    return nextState;
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}
