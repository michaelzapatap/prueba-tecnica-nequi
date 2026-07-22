import { DEFAULT_CATEGORY_COLOR } from '../config/category.config';
import { DomainError } from '../errors/domain-error';
import { Clock } from '../services/clock';
import { IdGenerator } from '../services/id-generator';
import { createCategory, updateCategory } from './category.factory';

describe('category factory', () => {
  const clock: Clock = { now: () => '2026-07-15T22:35:00.000Z' };
  const idGenerator: IdGenerator = { create: () => 'category-1' };

  it('creates a normalized category', () => {
    const category = createCategory({ name: '  Personal  ', color: '#AABBCC' }, idGenerator, clock);

    expect(category).toEqual({
      id: 'category-1',
      name: 'Personal',
      color: '#aabbcc',
      createdAt: '2026-07-15T22:35:00.000Z',
      updatedAt: '2026-07-15T22:35:00.000Z',
    });
  });

  it('uses the default color when the provided color is invalid', () => {
    const category = createCategory({ name: 'Trabajo', color: 'blue' }, idGenerator, clock);

    expect(category.color).toBe(DEFAULT_CATEGORY_COLOR);
  });

  it('rejects empty names', () => {
    expect(() => createCategory({ name: '', color: '#111111' }, idGenerator, clock)).toThrowError(
      DomainError,
      'Category name is required.',
    );
  });

  it('updates name and color without mutating the original category', () => {
    const category = createCategory({ name: 'Casa', color: '#111111' }, idGenerator, clock);
    const updatedCategory = updateCategory(category, { name: 'Hogar', color: '#222222' }, clock);

    expect(category.name).toBe('Casa');
    expect(updatedCategory.name).toBe('Hogar');
    expect(updatedCategory.color).toBe('#222222');
  });
});
