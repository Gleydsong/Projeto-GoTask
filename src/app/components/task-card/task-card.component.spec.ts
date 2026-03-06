import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PreferencesService } from '../../core/users/services/preferences.service';
import { TaskStatusEnum } from '../../enums/task-status.enum';
import { ModalControllerService } from '../../services/modal-controller.service';
import { TaskService } from '../../services/task.service';

import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        {
          provide: TaskService,
          useValue: {
            updateTaskNameAndDescription: jasmine.createSpy(
              'updateTaskNameAndDescription',
            ),
            updateTaskComments: jasmine.createSpy('updateTaskComments'),
            deleteTask: jasmine.createSpy('deleteTask'),
          },
        },
        {
          provide: ModalControllerService,
          useValue: {
            openEditTaskModal: () => ({ closed: of(undefined) }),
            openTaskCommentsModal: () => ({ closed: of(false) }),
          },
        },
        {
          provide: PreferencesService,
          useValue: {
            getCurrentUserPreferences: () =>
              of({
                userId: 'seed-employer',
                showWelcomeBanner: true,
                compactTaskCards: false,
                inAppNotifications: true,
                defaultRoute: '/app/tarefas',
              }),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = {
      id: 'task-1',
      ownerId: 'seed-employer',
      name: 'Tarefa de teste',
      description: 'Descrição de teste',
      comments: [],
      status: TaskStatusEnum.TODO,
      createdAt: '2026-03-06T00:00:00.000Z',
      updatedAt: '2026-03-06T00:00:00.000Z',
      completedAt: null,
      order: 0,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
