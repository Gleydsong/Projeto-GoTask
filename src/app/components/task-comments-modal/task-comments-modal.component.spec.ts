import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { TaskStatusEnum } from '../../enums/task-status.enum';

import { TaskCommentsModalComponent } from './task-comments-modal.component';

describe('TaskCommentsModalComponent', () => {
  let component: TaskCommentsModalComponent;
  let fixture: ComponentFixture<TaskCommentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCommentsModalComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            id: 'task-1',
            ownerId: 'seed-employer',
            name: 'Tarefa de teste',
            description: 'Descrição da tarefa de teste',
            comments: [],
            status: TaskStatusEnum.TODO,
            createdAt: '2026-03-06T00:00:00.000Z',
            updatedAt: '2026-03-06T00:00:00.000Z',
            completedAt: null,
            order: 0,
          },
        },
        {
          provide: DialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
          },
        },
        {
          provide: SessionStoreService,
          useValue: {
            currentUserSnapshot: {
              id: 'seed-employer',
            },
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCommentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
