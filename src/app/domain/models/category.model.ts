import { EntityId } from './entity-id.model';

export interface Category {
  readonly id: EntityId;
  readonly name: string;
  readonly color: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCategoryCommand {
  readonly name: string;
  readonly color: string;
}

export interface UpdateCategoryCommand {
  readonly name: string;
  readonly color: string;
}
