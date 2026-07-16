import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../../domain/models/category.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';

export class CategoryUseCases {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  getCategories(): Promise<readonly Category[]> {
    return this.categoryRepository.findAll();
  }

  createCategory(command: CreateCategoryCommand): Promise<Category> {
    return this.categoryRepository.create(command);
  }

  updateCategory(categoryId: EntityId, command: UpdateCategoryCommand): Promise<Category> {
    return this.categoryRepository.update(categoryId, command);
  }

  deleteCategory(categoryId: EntityId): Promise<void> {
    return this.categoryRepository.deleteById(categoryId);
  }
}
