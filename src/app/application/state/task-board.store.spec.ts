import { TestBed } from '@angular/core/testing';

import { Category } from '../../domain/models/category.model';
import { Task } from '../../domain/models/task.model';
import { TaskBoardStore } from './task-board.store';

describe('TaskBoardStore', () => {
  let store: TaskBoardStore;
  const task: Task = {
    id: 'task-1',
    title: 'Tarea',
    categoryId: null,
    isCompleted: false,
    createdAt: '2026-07-22T12:00:00.000Z',
    updatedAt: '2026-07-22T12:00:00.000Z',
  };
  const category: Category = {
    id: 'category-1',
    name: 'Trabajo',
    color: '#2f80ed',
    createdAt: '2026-07-22T12:00:00.000Z',
    updatedAt: '2026-07-22T12:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskBoardStore);
  });

  it('applies incremental task mutations', () => {
    store.replaceTasks([task]);
    store.prependTask({ ...task, id: 'task-2' });
    store.replaceTask({ ...task, title: 'Actualizada' });
    store.removeTask('task-2');

    expect(store.tasks()).toEqual([{ ...task, title: 'Actualizada' }]);
  });

  it('applies incremental category mutations', () => {
    store.replaceCategories([category]);
    store.addCategory({ ...category, id: 'category-2' });
    store.replaceCategory({ ...category, name: 'Archivo' });
    store.removeCategory('category-2');

    expect(store.categories()).toEqual([{ ...category, name: 'Archivo' }]);
  });
});
