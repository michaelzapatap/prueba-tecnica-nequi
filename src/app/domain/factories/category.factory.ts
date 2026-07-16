import { Category, CreateCategoryCommand, UpdateCategoryCommand } from '../models/category.model';
import { Clock } from '../services/clock';
import { IdGenerator } from '../services/id-generator';
import { DomainError } from '../errors/domain-error';

const DEFAULT_CATEGORY_COLOR = '#6c2bd9';
const MAX_CATEGORY_NAME_LENGTH = 40;

export function createCategory(
  command: CreateCategoryCommand,
  idGenerator: IdGenerator,
  clock: Clock,
): Category {
  const timestamp = clock.now();

  return {
    id: idGenerator.create(),
    name: normalizeCategoryName(command.name),
    color: normalizeCategoryColor(command.color),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateCategory(
  category: Category,
  command: UpdateCategoryCommand,
  clock: Clock,
): Category {
  return {
    ...category,
    name: normalizeCategoryName(command.name),
    color: normalizeCategoryColor(command.color),
    updatedAt: clock.now(),
  };
}

function normalizeCategoryName(name: string): string {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new DomainError('Category name is required.');
  }

  if (normalizedName.length > MAX_CATEGORY_NAME_LENGTH) {
    throw new DomainError(`Category name cannot exceed ${MAX_CATEGORY_NAME_LENGTH} characters.`);
  }

  return normalizedName;
}

function normalizeCategoryColor(color: string): string {
  const normalizedColor = color.trim();
  const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

  return hexColorPattern.test(normalizedColor)
    ? normalizedColor.toLowerCase()
    : DEFAULT_CATEGORY_COLOR;
}
