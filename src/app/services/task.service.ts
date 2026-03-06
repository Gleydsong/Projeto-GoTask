import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SessionStoreService } from '../core/auth/services/session-store.service';
import { STORAGE_KEYS } from '../core/shared/constants/storage-keys.const';
import { TaskComment } from '../core/tasks/interfaces/task-comment.interface';
import { TaskEntity } from '../core/tasks/interfaces/task-entity.interface';
import { TaskHistoryFilters } from '../core/tasks/interfaces/task-history-filters.interface';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { IComment } from '../interfaces/comment.interface';
import { ITaskFormControls } from '../interfaces/task.form-controls.interface';
import { ITask } from '../interfaces/task.interface';
import { TaskStatus } from '../types/task-status';
import { generateUniqueIdWithTimestamp } from '../utils/generate-unique-id-with-timestamp';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _tasks = new BehaviorSubject<TaskEntity[]>(this.loadTasks());

  readonly tasks$ = this._tasks.asObservable().pipe(
    map((tasks) => structuredClone(tasks)),
  );

  readonly currentUserTasks$ = combineLatest([
    this.tasks$,
    this._sessionStore.currentUser$,
  ]).pipe(
    map(([tasks, currentUser]) => {
      if (!currentUser) {
        return [];
      }

      return this.sortByUpdatedAtDesc(
        tasks.filter((task) => task.ownerId === currentUser.id),
      );
    }),
  );

  readonly todoTasks = this.getCurrentUserTasksByStatus(TaskStatusEnum.TODO);
  readonly doingTasks = this.getCurrentUserTasksByStatus(TaskStatusEnum.DOING);
  readonly doneTasks = this.getCurrentUserTasksByStatus(TaskStatusEnum.DONE);

  getCurrentUserTasksByStatus(status: TaskStatus) {
    return this.currentUserTasks$.pipe(
      map((tasks) =>
        tasks
          .filter((task) => task.status === status)
          .sort((taskA, taskB) => taskA.order - taskB.order),
      ),
    );
  }

  getCurrentUserHistory(filters: TaskHistoryFilters = {}) {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (!currentUser) {
      return [];
    }

    const normalizedSearch = filters.search?.trim().toLowerCase() ?? '';

    return this.sortByUpdatedAtDesc(
      this._tasks.value.filter((task) => {
        if (task.ownerId !== currentUser.id) {
          return false;
        }

        if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          task.name.toLowerCase().includes(normalizedSearch) ||
          task.description.toLowerCase().includes(normalizedSearch)
        );
      }),
    );
  }

  getTaskById(taskId: string) {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (!currentUser) {
      return null;
    }

    const task = this._tasks.value.find(
      (currentTask) =>
        currentTask.id === taskId && currentTask.ownerId === currentUser.id,
    );

    return task ? structuredClone(task) : null;
  }

  addTask(taskInfos: ITaskFormControls) {
    const currentUserId = this.getCurrentUserIdOrThrow();
    const now = new Date().toISOString();
    const todoTasks = this.getTasksForUserAndStatus(currentUserId, TaskStatusEnum.TODO);

    const newTask: TaskEntity = {
      id: generateUniqueIdWithTimestamp(),
      ownerId: currentUserId,
      name: taskInfos.name.trim(),
      description: taskInfos.description.trim(),
      comments: [],
      status: TaskStatusEnum.TODO,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      order: todoTasks.length,
    };

    this.commitTasks([...this._tasks.value, newTask]);
    return structuredClone(newTask);
  }

  updateTask(taskId: string, payload: Partial<TaskEntity>) {
    const currentUserId = this.getCurrentUserIdOrThrow();
    const taskIndex = this._tasks.value.findIndex(
      (task) => task.id === taskId && task.ownerId === currentUserId,
    );

    if (taskIndex < 0) {
      return null;
    }

    const nextTasks = [...this._tasks.value];
    const currentTask = nextTasks[taskIndex];
    nextTasks[taskIndex] = {
      ...currentTask,
      ...payload,
      id: currentTask.id,
      ownerId: currentTask.ownerId,
      updatedAt: new Date().toISOString(),
    };

    this.commitTasks(nextTasks);
    return structuredClone(nextTasks[taskIndex]);
  }

  moveTask(taskId: string, nextStatus: TaskStatus, nextOrder: number) {
    const currentUserId = this.getCurrentUserIdOrThrow();
    const currentTask = this._tasks.value.find(
      (task) => task.id === taskId && task.ownerId === currentUserId,
    );

    if (!currentTask) {
      return;
    }

    const otherUsersTasks = this._tasks.value.filter(
      (task) => task.ownerId !== currentUserId,
    );
    const currentUserTasks = this._tasks.value.filter(
      (task) => task.ownerId === currentUserId,
    );

    const remainingCurrentStatusTasks = currentUserTasks
      .filter(
        (task) => !(task.id === taskId && task.status === currentTask.status),
      )
      .filter((task) => task.status === currentTask.status)
      .sort((taskA, taskB) => taskA.order - taskB.order)
      .map((task, index) => ({ ...task, order: index }));

    const unaffectedTasks = currentUserTasks.filter(
      (task) =>
        task.status !== currentTask.status &&
        !(task.id === taskId && task.status === currentTask.status) &&
        !(task.id === taskId && task.status === nextStatus),
    );

    const targetBaseTasks =
      currentTask.status === nextStatus
        ? remainingCurrentStatusTasks
        : currentUserTasks
            .filter((task) => task.status === nextStatus && task.id !== taskId)
            .sort((taskA, taskB) => taskA.order - taskB.order);

    const boundedOrder = Math.max(0, Math.min(nextOrder, targetBaseTasks.length));
    const movedTask: TaskEntity = {
      ...currentTask,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      completedAt:
        nextStatus === TaskStatusEnum.DONE ? new Date().toISOString() : null,
      order: boundedOrder,
    };

    const nextTargetTasks = [...targetBaseTasks];
    nextTargetTasks.splice(boundedOrder, 0, movedTask);
    const normalizedTargetTasks = nextTargetTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const normalizedCurrentStatusTasks =
      currentTask.status === nextStatus ? [] : remainingCurrentStatusTasks;

    const mergedTasks = [
      ...otherUsersTasks,
      ...unaffectedTasks.filter(
        (task) => task.status !== nextStatus && task.status !== currentTask.status,
      ),
      ...normalizedCurrentStatusTasks,
      ...normalizedTargetTasks,
    ];

    this.commitTasks(mergedTasks);
  }

  deleteTask(taskId: string, _taskCurrentStatus?: TaskStatus) {
    const currentUserId = this.getCurrentUserIdOrThrow();
    const taskToDelete = this._tasks.value.find(
      (task) => task.id === taskId && task.ownerId === currentUserId,
    );

    if (!taskToDelete) {
      return;
    }

    const nextTasks = this._tasks.value.filter(
      (task) => !(task.id === taskId && task.ownerId === currentUserId),
    );
    const normalizedTasks = this.normalizeOrdersForUserStatus(
      nextTasks,
      currentUserId,
      taskToDelete.status,
    );

    this.commitTasks(normalizedTasks);
  }

  addComment(taskId: string, description: string) {
    const currentUserId = this.getCurrentUserIdOrThrow();
    const task = this.getTaskById(taskId);

    if (!task) {
      return;
    }

    const newComment: TaskComment = {
      id: generateUniqueIdWithTimestamp(),
      authorId: currentUserId,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    this.updateTask(taskId, {
      comments: [newComment, ...task.comments],
    });
  }

  removeComment(taskId: string, commentId: string) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return;
    }

    this.updateTask(taskId, {
      comments: task.comments.filter((comment) => comment.id !== commentId),
    });
  }

  migrateLegacyTasksToUser(userId: string) {
    const hasCurrentModelTasks = this._tasks.value.length > 0;
    const alreadyMigrated = localStorage.getItem(STORAGE_KEYS.migrationV1) === 'true';

    if (hasCurrentModelTasks || alreadyMigrated) {
      return;
    }

    const legacyTodoTasks = this.loadLegacyTasks(STORAGE_KEYS.legacyTodo);
    const legacyDoingTasks = this.loadLegacyTasks(STORAGE_KEYS.legacyDoing);
    const legacyDoneTasks = this.loadLegacyTasks(STORAGE_KEYS.legacyDone);
    const legacyTasks = [
      ...legacyTodoTasks,
      ...legacyDoingTasks,
      ...legacyDoneTasks,
    ];

    if (legacyTasks.length === 0) {
      return;
    }

    const migratedTasks: TaskEntity[] = [
      ...this.mapLegacyTasks(legacyTodoTasks, userId, TaskStatusEnum.TODO),
      ...this.mapLegacyTasks(legacyDoingTasks, userId, TaskStatusEnum.DOING),
      ...this.mapLegacyTasks(legacyDoneTasks, userId, TaskStatusEnum.DONE),
    ];

    this.commitTasks(migratedTasks);
    localStorage.setItem(STORAGE_KEYS.migrationV1, 'true');
  }

  updateTaskStatus(
    taskId: string,
    _taskCurrentStatus: TaskStatus,
    taskNextStatus: TaskStatus,
  ) {
    const nextOrder = this.getTasksForUserAndStatus(
      this.getCurrentUserIdOrThrow(),
      taskNextStatus,
    ).length;
    this.moveTask(taskId, taskNextStatus, nextOrder);
  }

  reorderTask(taskId: string, taskStatus: TaskStatus, taskNewIndex: number) {
    this.moveTask(taskId, taskStatus, taskNewIndex);
  }

  updateTaskNameAndDescription(
    taskId: string,
    _taskCurrentStatus: TaskStatus,
    newTaskName: string,
    newTaskDescription: string,
  ) {
    this.updateTask(taskId, {
      name: newTaskName.trim(),
      description: newTaskDescription.trim(),
    });
  }

  updateTaskComments(
    taskId: string,
    _taskCurrentStatus: TaskStatus,
    newTaskComments: IComment[],
  ) {
    this.updateTask(taskId, {
      comments: structuredClone(newTaskComments),
    });
  }

  private getCurrentUserIdOrThrow() {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (!currentUser) {
      throw new Error('É necessário ter uma sessão ativa para manipular tarefas.');
    }

    return currentUser.id;
  }

  private getTasksForUserAndStatus(userId: string, status: TaskStatus) {
    return this._tasks.value
      .filter((task) => task.ownerId === userId && task.status === status)
      .sort((taskA, taskB) => taskA.order - taskB.order);
  }

  private normalizeOrdersForUserStatus(
    tasks: TaskEntity[],
    userId: string,
    status: TaskStatus,
  ) {
    const targetTasks = tasks
      .filter((task) => task.ownerId === userId && task.status === status)
      .sort((taskA, taskB) => taskA.order - taskB.order)
      .map((task, index) => ({ ...task, order: index }));
    const otherTasks = tasks.filter(
      (task) => !(task.ownerId === userId && task.status === status),
    );

    return [...otherTasks, ...targetTasks];
  }

  private mapLegacyTasks(
    legacyTasks: Array<{
      id?: string;
      name?: string;
      description?: string;
      comments?: Array<{ id?: string; description?: string }>;
    }>,
    ownerId: string,
    status: TaskStatus,
  ) {
    const now = new Date().toISOString();

    return legacyTasks.map((legacyTask, index) => ({
      id: legacyTask.id ?? generateUniqueIdWithTimestamp(),
      ownerId,
      name: legacyTask.name?.trim() || 'Tarefa migrada',
      description: legacyTask.description?.trim() || '',
      comments: (legacyTask.comments ?? []).map((comment) => ({
        id: comment.id ?? generateUniqueIdWithTimestamp(),
        authorId: ownerId,
        description: comment.description ?? '',
        createdAt: now,
      })),
      status,
      createdAt: now,
      updatedAt: now,
      completedAt: status === TaskStatusEnum.DONE ? now : null,
      order: index,
    }));
  }

  private loadLegacyTasks(key: string) {
    try {
      const rawTasks = localStorage.getItem(key);
      const parsedTasks = rawTasks ? JSON.parse(rawTasks) : [];
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      return [];
    }
  }

  private loadTasks() {
    try {
      const rawTasks = localStorage.getItem(STORAGE_KEYS.tasks);
      const parsedTasks = rawTasks ? JSON.parse(rawTasks) : [];
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch {
      return [];
    }
  }

  private commitTasks(tasks: TaskEntity[]) {
    this._tasks.next(structuredClone(tasks));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }

  private sortByUpdatedAtDesc(tasks: TaskEntity[]) {
    return [...tasks].sort((taskA, taskB) =>
      taskA.updatedAt < taskB.updatedAt ? 1 : -1,
    );
  }
}
