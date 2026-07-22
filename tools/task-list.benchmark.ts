import { performance } from 'node:perf_hooks';

import { Task } from '../src/app/domain/models/task.model';
import { TASK_RENDER_BATCH_SIZE } from '../src/app/application/config/task-board.config';
import {
  countTasks,
  queryTasks,
  selectTaskListPage,
  sortTasksByCreationDate,
} from '../src/app/application/queries/task-list.query';

interface Measurement {
  readonly name: string;
  readonly iterations: number;
  readonly totalMilliseconds: number;
  readonly averageMilliseconds: number;
}

const dataSetSize = 50_000;
const baseTimestamp = Date.parse('2026-07-16T12:00:00.000Z');

function createTasks(size: number): readonly Task[] {
  return Array.from({ length: size }, (_, index) => {
    const timestamp = new Date(baseTimestamp - index * 1_000).toISOString();

    return {
      id: `task-${index}`,
      title: index % 10 === 0 ? `Quarterly report ${index}` : `Task ${index}`,
      categoryId: index % 4 === 0 ? 'category-work' : null,
      isCompleted: index % 3 === 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}

function measure(name: string, iterations: number, action: () => unknown): Measurement {
  action();
  const startTime = performance.now();

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    action();
  }

  const totalMilliseconds = performance.now() - startTime;

  return {
    name,
    iterations,
    totalMilliseconds: Number(totalMilliseconds.toFixed(3)),
    averageMilliseconds: Number((totalMilliseconds / iterations).toFixed(3)),
  };
}

const initialHeapBytes = process.memoryUsage().heapUsed;
const tasks = createTasks(dataSetSize);
const generatedHeapBytes = process.memoryUsage().heapUsed;
const sortedTasks = sortTasksByCreationDate(tasks);

const measurements = [
  measure('sort_tasks', 10, () => sortTasksByCreationDate(tasks)),
  measure('count_tasks', 100, () => countTasks(tasks)),
  measure('search_all_tasks', 25, () =>
    queryTasks(sortedTasks, {
      categoryFilter: 'all',
      searchQuery: 'quarterly report 499',
      isSearchEnabled: true,
    }),
  ),
  measure('filter_category_and_search', 25, () =>
    queryTasks(sortedTasks, {
      categoryFilter: 'category-work',
      searchQuery: 'report',
      isSearchEnabled: true,
    }),
  ),
  measure('select_render_page', 100, () =>
    selectTaskListPage(
      sortedTasks,
      {
        categoryFilter: 'category-work',
        searchQuery: 'report',
        isSearchEnabled: true,
      },
      TASK_RENDER_BATCH_SIZE,
    ),
  ),
  measure('render_batch_slice', 1_000, () => sortedTasks.slice(0, TASK_RENDER_BATCH_SIZE)),
];

const result = {
  runtime: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
  },
  dataSetSize,
  renderBatchSize: TASK_RENDER_BATCH_SIZE,
  approximateDataSetHeapMegabytes: Number(
    ((generatedHeapBytes - initialHeapBytes) / 1_048_576).toFixed(3),
  ),
  measurements,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
