import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkCircleOutline,
  closeOutline,
  createOutline,
  pricetagOutline,
  trashOutline,
} from 'ionicons/icons';

import { Category } from '../domain/models/category.model';
import { EntityId } from '../domain/models/entity-id.model';
import { Task } from '../domain/models/task.model';
import { DEFAULT_CATEGORY_COLOR } from '../domain/config/category.config';
import { CategoryCommandFacade } from '../application/facades/category-command.facade';
import { TaskCommandFacade } from '../application/facades/task-command.facade';
import { CategoryFilter, TaskListFacade } from '../application/facades/task-list.facade';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  readonly taskList = inject(TaskListFacade);
  readonly taskCommands = inject(TaskCommandFacade);
  readonly categoryCommands = inject(CategoryCommandFacade);
  readonly taskTitle = signal('');
  readonly selectedTaskCategoryId = signal<EntityId | ''>('');
  readonly categoryName = signal('');
  readonly categoryColor = signal(DEFAULT_CATEGORY_COLOR);
  readonly editingCategoryId = signal<EntityId | null>(null);
  readonly editingCategoryName = signal('');
  readonly editingCategoryColor = signal(DEFAULT_CATEGORY_COLOR);

  readonly canCreateTask = computed(() => this.taskTitle().trim().length > 0);
  readonly canCreateCategory = computed(() => this.categoryName().trim().length > 0);
  readonly canUpdateCategory = computed(() => this.editingCategoryName().trim().length > 0);

  constructor() {
    addIcons({
      addOutline,
      checkmarkCircleOutline,
      closeOutline,
      createOutline,
      pricetagOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    void this.taskList.load();
  }

  onTaskCategoryChange(categoryId: EntityId | '' | null | undefined): void {
    this.selectedTaskCategoryId.set(categoryId ?? '');
  }

  onCategoryFilterChange(categoryFilter: CategoryFilter | undefined): void {
    this.taskList.setCategoryFilter(categoryFilter ?? 'all');
  }

  onTaskTitleChange(title: string | number | null | undefined): void {
    this.taskTitle.set(String(title ?? ''));
  }

  onSearchQueryChange(searchQuery: string | null | undefined): void {
    this.taskList.setSearchQuery(searchQuery ?? '');
  }

  onCategoryNameChange(name: string | number | null | undefined): void {
    this.categoryName.set(String(name ?? ''));
  }

  onCategoryColorChange(event: Event): void {
    this.categoryColor.set(this.readInputValue(event));
  }

  onEditingCategoryNameChange(name: string | number | null | undefined): void {
    this.editingCategoryName.set(String(name ?? ''));
  }

  onEditingCategoryColorChange(event: Event): void {
    this.editingCategoryColor.set(this.readInputValue(event));
  }

  async createTask(): Promise<void> {
    if (!this.canCreateTask() || this.taskCommands.isCreatingTask()) {
      return;
    }

    const selectedCategoryId = this.selectedTaskCategoryId();
    const wasCreated = await this.taskCommands.createTask(
      this.taskTitle(),
      selectedCategoryId || null,
    );

    if (wasCreated) {
      this.taskTitle.set('');
    }
  }

  async toggleTask(task: Task, isCompleted: boolean): Promise<void> {
    await this.taskCommands.setTaskCompletion(task.id, isCompleted);
  }

  async deleteTask(taskId: EntityId): Promise<void> {
    await this.taskCommands.deleteTask(taskId);
  }

  loadMoreTasks(): void {
    this.taskList.loadMoreTasks();
  }

  async createCategory(): Promise<void> {
    if (!this.canCreateCategory() || this.categoryCommands.isCreatingCategory()) {
      return;
    }

    const wasCreated = await this.categoryCommands.createCategory(
      this.categoryName(),
      this.categoryColor(),
    );

    if (wasCreated) {
      this.categoryName.set('');
      this.categoryColor.set(DEFAULT_CATEGORY_COLOR);
    }
  }

  startCategoryEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.editingCategoryName.set(category.name);
    this.editingCategoryColor.set(category.color);
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId.set(null);
    this.editingCategoryName.set('');
    this.editingCategoryColor.set(DEFAULT_CATEGORY_COLOR);
  }

  async saveCategoryEdit(categoryId: EntityId): Promise<void> {
    if (!this.canUpdateCategory() || this.categoryCommands.isCategoryPending(categoryId)) {
      return;
    }

    const wasUpdated = await this.categoryCommands.updateCategory(
      categoryId,
      this.editingCategoryName(),
      this.editingCategoryColor(),
    );
    if (wasUpdated) {
      this.cancelCategoryEdit();
    }
  }

  async deleteCategory(categoryId: EntityId): Promise<void> {
    await this.categoryCommands.deleteCategory(categoryId);
  }

  private readInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : DEFAULT_CATEGORY_COLOR;
  }
}
