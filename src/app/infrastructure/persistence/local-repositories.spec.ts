import { DomainError } from '../../domain/errors/domain-error';
import { KeyValueStorage } from './key-value-storage';
import { LocalCategoryRepository } from './local-category.repository';
import { LocalTaskRepository } from './local-task.repository';
import { VersionedLocalStore } from './versioned-local-store';

class InMemoryKeyValueStorage extends KeyValueStorage {
  private readonly values = new Map<string, string>();

  override getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  override setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  override removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('local repositories', () => {
  let categoryRepository: LocalCategoryRepository;
  let taskRepository: LocalTaskRepository;

  beforeEach(() => {
    const store = new VersionedLocalStore(new InMemoryKeyValueStorage());
    categoryRepository = new LocalCategoryRepository(store);
    taskRepository = new LocalTaskRepository(store);
  });

  it('creates and reads categories and tasks', async () => {
    const category = await categoryRepository.create({ name: 'Trabajo', color: '#123456' });
    const task = await taskRepository.create({ title: 'Preparar demo', categoryId: category.id });

    expect(await categoryRepository.findById(category.id)).toEqual(category);
    expect(await taskRepository.findById(task.id)).toEqual(task);
    expect(await taskRepository.findAll()).toEqual([task]);
  });

  it('prevents assigning a task to a missing category', async () => {
    await expectAsync(
      taskRepository.create({ title: 'Tarea invalida', categoryId: 'missing-category' }),
    ).toBeRejectedWithError(DomainError, 'Category was not found.');
  });

  it('updates task completion and deletes tasks', async () => {
    const task = await taskRepository.create({ title: 'Enviar evidencia' });
    const completedTask = await taskRepository.setCompletion(task.id, true);

    expect(completedTask.isCompleted).toBeTrue();

    await taskRepository.deleteById(task.id);

    expect(await taskRepository.findAll()).toEqual([]);
  });

  it('detaches tasks when a category is deleted', async () => {
    const category = await categoryRepository.create({ name: 'Casa', color: '#654321' });
    const task = await taskRepository.create({
      title: 'Ordenar documentos',
      categoryId: category.id,
    });

    await categoryRepository.deleteById(category.id);

    expect(await categoryRepository.findAll()).toEqual([]);
    expect((await taskRepository.findById(task.id))?.categoryId).toBeNull();
  });
});
