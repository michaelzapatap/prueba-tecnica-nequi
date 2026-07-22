import {
  Category,
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from '../../domain/models/category.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryUseCases } from './category.use-cases';

describe('CategoryUseCases', () => {
  const category: Category = {
    id: 'category-1',
    name: 'Trabajo',
    color: '#2f80ed',
    createdAt: '2026-07-22T12:00:00.000Z',
    updatedAt: '2026-07-22T12:00:00.000Z',
  };

  it('delegates every category operation to the repository contract', async () => {
    const repository = jasmine.createSpyObj<CategoryRepository>('CategoryRepository', [
      'findAll',
      'findById',
      'create',
      'update',
      'deleteById',
    ]);
    repository.findAll.and.resolveTo([category]);
    repository.create.and.resolveTo(category);
    repository.update.and.resolveTo(category);
    repository.deleteById.and.resolveTo();
    const useCases = new CategoryUseCases(repository);
    const createCommand: CreateCategoryCommand = {
      name: category.name,
      color: category.color,
    };
    const updateCommand: UpdateCategoryCommand = {
      name: category.name,
      color: category.color,
    };

    expect(await useCases.getCategories()).toEqual([category]);
    expect(await useCases.createCategory(createCommand)).toBe(category);
    expect(await useCases.updateCategory(category.id, updateCommand)).toBe(category);
    await useCases.deleteCategory(category.id);

    expect(repository.create).toHaveBeenCalledWith(createCommand);
    expect(repository.update).toHaveBeenCalledWith(category.id, updateCommand);
    expect(repository.deleteById).toHaveBeenCalledWith(category.id);
  });
});
