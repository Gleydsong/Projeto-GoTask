import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { ITask } from '../interfaces/task.interface';
import { TaskService } from './task.service';

describe('TaskService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('deve carregar cada coluna da chave correta no localStorage', async () => {
    const todoTasks: ITask[] = [
      {
        id: 'todo-1',
        name: 'Tarefa TODO',
        description: 'Descrição TODO',
        comments: [],
        status: TaskStatusEnum.TODO,
      },
    ];
    const doingTasks: ITask[] = [
      {
        id: 'doing-1',
        name: 'Tarefa DOING',
        description: 'Descrição DOING',
        comments: [],
        status: TaskStatusEnum.DOING,
      },
    ];
    const doneTasks: ITask[] = [
      {
        id: 'done-1',
        name: 'Tarefa DONE',
        description: 'Descrição DONE',
        comments: [],
        status: TaskStatusEnum.DONE,
      },
    ];

    localStorage.setItem(TaskStatusEnum.TODO, JSON.stringify(todoTasks));
    localStorage.setItem(TaskStatusEnum.DOING, JSON.stringify(doingTasks));
    localStorage.setItem(TaskStatusEnum.DONE, JSON.stringify(doneTasks));

    const service = TestBed.inject(TaskService);

    expect(await firstValueFrom(service.todoTasks)).toEqual(todoTasks);
    expect(await firstValueFrom(service.doingTasks)).toEqual(doingTasks);
    expect(await firstValueFrom(service.doneTasks)).toEqual(doneTasks);
  });

  it('deve criar nova tarefa em TODO com comentários vazios', async () => {
    const service = TestBed.inject(TaskService);

    service.addTask({
      name: 'Implementar autenticação',
      description: 'Criar fluxo de login com refresh token',
    });

    const todoTasks = await firstValueFrom(service.todoTasks);
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].status).toBe(TaskStatusEnum.TODO);
    expect(todoTasks[0].comments).toEqual([]);
    expect(todoTasks[0].id).toBeTruthy();
  });

  it('deve mover tarefa entre colunas e atualizar status', async () => {
    const service = TestBed.inject(TaskService);

    service.addTask({
      name: 'Criar página de dashboard',
      description: 'Montar layout inicial com métricas',
    });
    const createdTask = (await firstValueFrom(service.todoTasks))[0];

    service.updateTaskStatus(
      createdTask.id,
      TaskStatusEnum.TODO,
      TaskStatusEnum.DOING,
    );

    const todoTasks = await firstValueFrom(service.todoTasks);
    const doingTasks = await firstValueFrom(service.doingTasks);

    expect(todoTasks.length).toBe(0);
    expect(doingTasks.length).toBe(1);
    expect(doingTasks[0].id).toBe(createdTask.id);
    expect(doingTasks[0].status).toBe(TaskStatusEnum.DOING);
  });

  it('deve reordenar tarefas dentro da mesma coluna', async () => {
    const service = TestBed.inject(TaskService);

    service.addTask({
      name: 'Task A importante',
      description: 'Descrição da task A importante',
    });
    service.addTask({
      name: 'Task B importante',
      description: 'Descrição da task B importante',
    });

    const todoTasks = await firstValueFrom(service.todoTasks);
    const firstTaskId = todoTasks[0].id;
    const secondTaskId = todoTasks[1].id;

    service.reorderTask(secondTaskId, TaskStatusEnum.TODO, 0);

    const reorderedTasks = await firstValueFrom(service.todoTasks);
    expect(reorderedTasks[0].id).toBe(secondTaskId);
    expect(reorderedTasks[1].id).toBe(firstTaskId);
  });
});
