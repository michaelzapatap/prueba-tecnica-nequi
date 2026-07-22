import { Category } from '../../domain/models/category.model';

export function sortCategoriesByName(categories: readonly Category[]): readonly Category[] {
  return [...categories].sort((firstCategory, secondCategory) =>
    firstCategory.name.localeCompare(secondCategory.name, 'es'),
  );
}
