import { KeyValueStorage } from './key-value-storage';
import { STORAGE_KEY } from './storage-schema';
import { VersionedLocalStore } from './versioned-local-store';

class InMemoryKeyValueStorage extends KeyValueStorage {
  private readonly values = new Map<string, string>();

  override getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  override setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  override removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('VersionedLocalStore', () => {
  let storage: InMemoryKeyValueStorage;
  let store: VersionedLocalStore;

  beforeEach(() => {
    storage = new InMemoryKeyValueStorage();
    store = new VersionedLocalStore(storage);
  });

  it('returns an empty v1 state when storage is empty', () => {
    expect(store.read()).toEqual({
      version: 1,
      tasks: [],
      categories: [],
    });
  });

  it('recovers with an empty v1 state when stored JSON is invalid', () => {
    storage.setItem(STORAGE_KEY, '{invalid');

    expect(store.read()).toEqual({
      version: 1,
      tasks: [],
      categories: [],
    });
  });

  it('persists updates under the configured storage key', () => {
    store.update((state) => ({
      ...state,
      categories: [
        {
          id: 'category-1',
          name: 'Trabajo',
          color: '#111111',
          createdAt: '2026-07-15T22:40:00.000Z',
          updatedAt: '2026-07-15T22:40:00.000Z',
        },
      ],
    }));

    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')).toEqual(store.read());
  });
});
