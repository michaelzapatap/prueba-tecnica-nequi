import { DomainError } from '../errors/domain-error';
import { EntityId } from '../models/entity-id.model';
import { CreateTaskCommand, Task, UpdateTaskCommand } from '../models/task.model';
import { Clock } from '../services/clock';
import { IdGenerator } from '../services/id-generator';

const MAX_TASK_TITLE_LENGTH = 120;

export function createTask(
  command: CreateTaskCommand,
  idGenerator: IdGenerator,
  clock: Clock,
): Task {
  const timestamp = clock.now();

  return {
    id: idGenerator.create(),
    title: normalizeTaskTitle(command.title),
    categoryId: command.categoryId ?? null,
    isCompleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateTask(task: Task, command: UpdateTaskCommand, clock: Clock): Task {
  return {
    ...task,
    title: normalizeTaskTitle(command.title),
    categoryId: command.categoryId ?? null,
    updatedAt: clock.now(),
  };
}

export function completeTask(task: Task, clock: Clock): Task {
  return setTaskCompletion(task, true, clock);
}

export function reopenTask(task: Task, clock: Clock): Task {
  return setTaskCompletion(task, false, clock);
}

export function detachTaskCategory(task: Task, categoryId: EntityId, clock: Clock): Task {
  if (task.categoryId !== categoryId) {
    return task;
  }

  return {
    ...task,
    categoryId: null,
    updatedAt: clock.now(),
  };
}

function setTaskCompletion(task: Task, isCompleted: boolean, clock: Clock): Task {
  if (task.isCompleted === isCompleted) {
    return task;
  }

  return {
    ...task,
    isCompleted,
    updatedAt: clock.now(),
  };
}

function normalizeTaskTitle(title: string): string {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new DomainError('Task title is required.');
  }

  if (normalizedTitle.length > MAX_TASK_TITLE_LENGTH) {
    throw new DomainError(`Task title cannot exceed ${MAX_TASK_TITLE_LENGTH} characters.`);
  }

  return normalizedTitle;
}
