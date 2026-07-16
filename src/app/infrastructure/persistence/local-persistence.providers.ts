import { Provider } from '@angular/core';

import { CATEGORY_REPOSITORY, TASK_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { BrowserKeyValueStorage, KeyValueStorage } from './key-value-storage';
import { LocalCategoryRepository } from './local-category.repository';
import { LocalTaskRepository } from './local-task.repository';
import { VersionedLocalStore } from './versioned-local-store';

export function provideLocalPersistence(): Provider[] {
  return [
    { provide: KeyValueStorage, useClass: BrowserKeyValueStorage },
    {
      provide: VersionedLocalStore,
      useFactory: (storage: KeyValueStorage) => new VersionedLocalStore(storage),
      deps: [KeyValueStorage],
    },
    {
      provide: LocalTaskRepository,
      useFactory: (store: VersionedLocalStore) => new LocalTaskRepository(store),
      deps: [VersionedLocalStore],
    },
    {
      provide: LocalCategoryRepository,
      useFactory: (store: VersionedLocalStore) => new LocalCategoryRepository(store),
      deps: [VersionedLocalStore],
    },
    { provide: TASK_REPOSITORY, useExisting: LocalTaskRepository },
    { provide: CATEGORY_REPOSITORY, useExisting: LocalCategoryRepository },
  ];
}
