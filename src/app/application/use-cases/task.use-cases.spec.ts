import { CreateTaskCommand, Task, UpdateTaskCommand } from '../../domain/models/task.model';
import { EntityId } from '../../domain/models/entity-id.model';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskUseCases } from './task.use-cases';

describe('TaskUseCases', () => {
  const task: Task = {
    id: 'task-1',
    title: 'Preparar entrega',
    categoryId: null,
    isCompleted: false,
    createdAt: '2026-07-22T12:00:00.000Z',
    updatedAt: '2026-07-22T12:00:00.000Z',
  };

  it('delegates every task operation to the repository contract', async () => {
    const repository = jasmine.createSpyObj<TaskRepository>('TaskRepository', [
      'findAll',
      'findById',
      'create',
      'update',
      'setCompletion',
      'deleteById',
    ]);
    repository.findAll.and.resolveTo([task]);
    repository.create.and.resolveTo(task);
    repository.update.and.resolveTo(task);
    repository.setCompletion.and.resolveTo({ ...task, isCompleted: true });
    repository.deleteById.and.resolveTo();
    const useCases = new TaskUseCases(repository);
    const createCommand: CreateTaskCommand = { title: task.title, categoryId: null };
    const updateCommand: UpdateTaskCommand = { title: task.title, categoryId: null };

    expect(await useCases.getTasks()).toEqual([task]);
    expect(await useCases.createTask(createCommand)).toBe(task);
    expect(await useCases.updateTask(task.id, updateCommand)).toBe(task);
    expect((await useCases.setTaskCompletion(task.id, true)).isCompleted).toBeTrue();
    await useCases.deleteTask(task.id);

    expect(repository.create).toHaveBeenCalledWith(createCommand);
    expect(repository.update).toHaveBeenCalledWith(task.id as EntityId, updateCommand);
    expect(repository.setCompletion).toHaveBeenCalledWith(task.id, true);
    expect(repository.deleteById).toHaveBeenCalledWith(task.id);
  });
});
