import { Category } from '../../domain/models/category.model';
import { sortCategoriesByName } from './category-list.query';

describe('category list queries', () => {
  it('sorts categories using Spanish collation without mutating the input', () => {
    const categories: readonly Category[] = [
      {
        id: 'category-2',
        name: 'Trabajo',
        color: '#2f80ed',
        createdAt: '2026-07-22T12:00:00.000Z',
        updatedAt: '2026-07-22T12:00:00.000Z',
      },
      {
        id: 'category-1',
        name: 'Casa',
        color: '#27ab83',
        createdAt: '2026-07-22T12:00:00.000Z',
        updatedAt: '2026-07-22T12:00:00.000Z',
      },
    ];

    expect(sortCategoriesByName(categories).map((category) => category.name)).toEqual([
      'Casa',
      'Trabajo',
    ]);
    expect(categories.map((category) => category.name)).toEqual(['Trabajo', 'Casa']);
  });
});
