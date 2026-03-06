import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';
import { TaskStatusEnum } from '../../../enums/task-status.enum';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-history-page',
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.css',
})
export class HistoryPageComponent {
  private readonly _taskService = inject(TaskService);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusControl = new FormControl<'all' | TaskStatusEnum>(
    'all',
    { nonNullable: true },
  );
  protected readonly taskStatusEnum = TaskStatusEnum;

  protected readonly history$ = combineLatest([
    this._taskService.currentUserTasks$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
    this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)),
  ]).pipe(
    map(([tasks, search, status]) => {
      const normalizedSearch = search.trim().toLowerCase();
      const filteredTasks = tasks.filter((task) => {
        if (status !== 'all' && task.status !== status) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          task.name.toLowerCase().includes(normalizedSearch) ||
          task.description.toLowerCase().includes(normalizedSearch)
        );
      });

      const orderedTasks = [...filteredTasks].sort((taskA, taskB) =>
        taskA.updatedAt < taskB.updatedAt ? 1 : -1,
      );

      return {
        total: orderedTasks.length,
        todo: orderedTasks.filter((task) => task.status === TaskStatusEnum.TODO),
        doing: orderedTasks.filter((task) => task.status === TaskStatusEnum.DOING),
        done: orderedTasks.filter((task) => task.status === TaskStatusEnum.DONE),
      };
    }),
  );
}
