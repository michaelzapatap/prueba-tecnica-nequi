import { EntityId } from '../models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../models/task.model';

export interface TaskRepository {
  findAll(): Promise<readonly Task[]>;
  findById(taskId: EntityId): Promise<Task | null>;
  create(command: CreateTaskCommand): Promise<Task>;
  update(taskId: EntityId, command: UpdateTaskCommand): Promise<Task>;
  setCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task>;
  deleteById(taskId: EntityId): Promise<void>;
}
