import { EntityId } from '../../domain/models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class TaskUseCases {
  constructor(private readonly taskRepository: TaskRepository) {}

  getTasks(): Promise<readonly Task[]> {
    return this.taskRepository.findAll();
  }

  createTask(command: CreateTaskCommand): Promise<Task> {
    return this.taskRepository.create(command);
  }

  updateTask(taskId: EntityId, command: UpdateTaskCommand): Promise<Task> {
    return this.taskRepository.update(taskId, command);
  }

  setTaskCompletion(taskId: EntityId, isCompleted: boolean): Promise<Task> {
    return this.taskRepository.setCompletion(taskId, isCompleted);
  }

  deleteTask(taskId: EntityId): Promise<void> {
    return this.taskRepository.deleteById(taskId);
  }
}
