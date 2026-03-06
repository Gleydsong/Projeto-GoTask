import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
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
            name: 'Tarefa de teste',
            description: 'Descrição da tarefa de teste',
            comments: [],
            status: TaskStatusEnum.TODO,
          },
        },
        {
          provide: DialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
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
