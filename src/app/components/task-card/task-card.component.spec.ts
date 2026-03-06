import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = {
      id: 'task-1',
      name: 'Tarefa de teste',
      description: 'Descrição de teste',
      comments: [],
      status: TaskStatusEnum.TODO,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
