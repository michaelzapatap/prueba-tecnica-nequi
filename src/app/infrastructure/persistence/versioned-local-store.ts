import { KeyValueStorage } from './key-value-storage';
import { createEmptyState, PersistedState, STORAGE_KEY } from './storage-schema';
import { migrateState } from './storage-migrations';

export class VersionedLocalStore {
  private cachedState: PersistedState | null = null;

  constructor(private readonly storage: KeyValueStorage) {}

  read(): PersistedState {
    if (this.cachedState) {
      return this.cachedState;
    }

    const serializedState = this.storage.getItem(STORAGE_KEY);

    if (!serializedState) {
      this.cachedState = createEmptyState();
      return this.cachedState;
    }

    try {
      this.cachedState = migrateState(JSON.parse(serializedState));
    } catch {
      this.cachedState = createEmptyState();
    }

    return this.cachedState;
  }

  write(state: PersistedState): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.cachedState = state;
  }

  update(mutator: (state: PersistedState) => PersistedState): PersistedState {
    const nextState = mutator(this.read());
    this.write(nextState);
    return nextState;
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
    this.cachedState = null;
  }
}
