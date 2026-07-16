import { EntityId } from './entity-id.model';

export interface Task {
  readonly id: EntityId;
  readonly title: string;
  readonly isCompleted: boolean;
  readonly categoryId: EntityId | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateTaskCommand {
  readonly title: string;
  readonly categoryId?: EntityId | null;
}

export interface UpdateTaskCommand {
  readonly title: string;
  readonly categoryId?: EntityId | null;
}
