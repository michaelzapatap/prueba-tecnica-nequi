import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Clock, SystemClock } from '../../domain/services/clock';
import { CryptoIdGenerator, IdGenerator } from '../../domain/services/id-generator';
import { createCategory, updateCategory } from '../../domain/factories/category.factory';
import { detachTaskCategory } from '../../domain/factories/task.factory';
import { DomainError } from '../../domain/errors/domain-error';
import { VersionedLocalStore } from './versioned-local-store';

export class LocalCategoryRepository implements CategoryRepository {
  private readonly clock: Clock = new SystemClock();
  private readonly idGenerator: IdGenerator = new CryptoIdGenerator();

  constructor(private readonly store: VersionedLocalStore) {}

  async findAll(): Promise<readonly Category[]> {
    return this.store.read().categories;
  }

  async findById(categoryId: EntityId): Promise<Category | null> {
    return this.store.read().categories.find((category) => category.id === categoryId) ?? null;
  }

  async create(command: CreateCategoryCommand): Promise<Category> {
    const category = createCategory(command, this.idGenerator, this.clock);

    this.store.update((state) => ({
      ...state,
      categories: [...state.categories, category],
    }));

    return category;
  }

  async update(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category> {
    let updatedCategory: Category | null = null;

    this.store.update((state) => {
      const categories = state.categories.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        updatedCategory = updateCategory(category, command, this.clock);
        return updatedCategory;
      });

      return { ...state, categories };
    });

    if (!updatedCategory) {
      throw new DomainError('Category was not found.');
    }

    return updatedCategory;
  }

  async deleteById(categoryId: EntityId): Promise<void> {
    this.store.update((state) => ({
      ...state,
      categories: state.categories.filter((category) => category.id !== categoryId),
      tasks: state.tasks.map((task) => detachTaskCategory(task, categoryId, this.clock)),
    }));
  }
}
