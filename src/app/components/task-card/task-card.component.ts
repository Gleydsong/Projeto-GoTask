import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { map } from 'rxjs';
import { PreferencesService } from '../../core/users/services/preferences.service';
import { ITask } from '../../interfaces/task.interface';
import { ModalControllerService } from '../../services/modal-controller.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-card',
  imports: [AsyncPipe, DatePipe, SlicePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: ITask;

  private readonly _taskService = inject(TaskService);
  private readonly _modalControllerService = inject(ModalControllerService);
  readonly compactMode$ = inject(PreferencesService)
    .getCurrentUserPreferences()
    .pipe(map((preferences) => preferences?.compactTaskCards ?? false));

  openEditTaskModal() {
    const dialogRef = this._modalControllerService.openEditTaskModal({
      name: this.task.name,
      description: this.task.description,
    });

    dialogRef.closed.subscribe((taskForm) => {
      if (taskForm) {
        this._taskService.updateTaskNameAndDescription(
          this.task.id,
          this.task.status,
          taskForm.name,
          taskForm.description,
        );
      }
    });
  }

  openCommentsModal() {
    const dialogRef = this._modalControllerService.openTaskCommentsModal(
      this.task,
    );

    dialogRef.closed.subscribe((taskCommentsChanged) => {
      if (taskCommentsChanged) {
        this._taskService.updateTaskComments(
          this.task.id,
          this.task.status,
          this.task.comments,
        );
      }
    });
  }

  deleteTask() {
    this._taskService.deleteTask(this.task.id, this.task.status);
  }
}
