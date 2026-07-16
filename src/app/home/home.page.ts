import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { CategoryFilter, TaskBoardFacade } from '../application/facades/task-board.facade';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class HomePage implements OnInit {
  readonly facade = inject(TaskBoardFacade);
  readonly taskTitle = signal('');
  readonly selectedTaskCategoryId = signal<EntityId | ''>('');
  readonly categoryName = signal('');
  readonly categoryColor = signal('#2f80ed');
  readonly editingCategoryId = signal<EntityId | null>(null);
  readonly editingCategoryName = signal('');
  readonly editingCategoryColor = signal('#2f80ed');

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
    void this.facade.load();
  }

  onTaskCategoryChange(categoryId: EntityId | '' | null | undefined): void {
    this.selectedTaskCategoryId.set(categoryId ?? '');
  }

  onCategoryFilterChange(categoryFilter: CategoryFilter | undefined): void {
    this.facade.setCategoryFilter(categoryFilter ?? 'all');
  }

  onTaskTitleChange(title: string | number | null | undefined): void {
    this.taskTitle.set(String(title ?? ''));
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
    if (!this.canCreateTask()) {
      return;
    }

    const selectedCategoryId = this.selectedTaskCategoryId();

    await this.facade.createTask(this.taskTitle(), selectedCategoryId || null);
    this.taskTitle.set('');
  }

  async toggleTask(task: Task, isCompleted: boolean): Promise<void> {
    await this.facade.setTaskCompletion(task, isCompleted);
  }

  async deleteTask(taskId: EntityId): Promise<void> {
    await this.facade.deleteTask(taskId);
  }

  async createCategory(): Promise<void> {
    if (!this.canCreateCategory()) {
      return;
    }

    await this.facade.createCategory(this.categoryName(), this.categoryColor());
    this.categoryName.set('');
    this.categoryColor.set('#2f80ed');
  }

  startCategoryEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.editingCategoryName.set(category.name);
    this.editingCategoryColor.set(category.color);
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId.set(null);
    this.editingCategoryName.set('');
    this.editingCategoryColor.set('#2f80ed');
  }

  async saveCategoryEdit(categoryId: EntityId): Promise<void> {
    if (!this.canUpdateCategory()) {
      return;
    }

    await this.facade.updateCategory(
      categoryId,
      this.editingCategoryName(),
      this.editingCategoryColor(),
    );
    this.cancelCategoryEdit();
  }

  async deleteCategory(categoryId: EntityId): Promise<void> {
    await this.facade.deleteCategory(categoryId);
  }

  private readInputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '#2f80ed';
  }
}
