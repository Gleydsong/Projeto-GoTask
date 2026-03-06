import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TaskStatusEnum } from '../../enums/task-status.enum';
import { ITask } from '../../interfaces/task.interface';
import { TaskService } from '../../services/task.service';
import { TaskStatus } from '../../types/task-status';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-list-section',
  imports: [TaskCardComponent, CdkDropList, CdkDrag, AsyncPipe],
  templateUrl: './task-list-section.component.html',
  styleUrl: './task-list-section.component.css',
})
export class TaskListSectionComponent {
  readonly _taskService = inject(TaskService);

  onCardDrop(event: CdkDragDrop<ITask[]>) {
    const cardDroppedOnSameColumn = event.previousContainer === event.container;
    this.moveCardToColumn(event);

    if (cardDroppedOnSameColumn) {
      this._taskService.reorderTask(
        event.item.data.id,
        event.item.data.status,
        event.currentIndex,
      );
      return;
    }

    const taskId = event.item.data.id;
    const taskCurrentStatus = event.item.data.status;
    const droppedColumn = event.container.id;

    this.updateTaskStatus(taskId, taskCurrentStatus, droppedColumn);
  }

  private updateTaskStatus(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    droppedColumn: string,
  ) {
    let taskNextStatus: TaskStatus;
    switch (droppedColumn) {
      case 'to-do-column':
        taskNextStatus = TaskStatusEnum.TODO;
        break;
      case 'doing-column':
        taskNextStatus = TaskStatusEnum.DOING;
        break;
      case 'done-column':
        taskNextStatus = TaskStatusEnum.DONE;
        break;
      default:
        throw new Error('Coluna não identificada');
    }
    this._taskService.updateTaskStatus(
      taskId,
      taskCurrentStatus,
      taskNextStatus,
    );
  }

  private moveCardToColumn(event: CdkDragDrop<ITask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
