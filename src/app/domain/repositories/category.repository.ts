import { Category, CreateCategoryCommand, UpdateCategoryCommand } from '../models/category.model';
import { EntityId } from '../models/entity-id.model';

export interface CategoryRepository {
  findAll(): Promise<readonly Category[]>;
  findById(categoryId: EntityId): Promise<Category | null>;
  create(command: CreateCategoryCommand): Promise<Category>;
  update(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category>;
  deleteById(categoryId: EntityId): Promise<void>;
}
