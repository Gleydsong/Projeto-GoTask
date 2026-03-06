import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TaskService } from '../../services/task.service';

import { TaskListSectionComponent } from './task-list-section.component';

describe('TaskListSectionComponent', () => {
  let component: TaskListSectionComponent;
  let fixture: ComponentFixture<TaskListSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListSectionComponent],
      providers: [
        {
          provide: TaskService,
          useValue: {
            todoTasks: of([]),
            doingTasks: of([]),
            doneTasks: of([]),
            updateTaskStatus: jasmine.createSpy('updateTaskStatus'),
            reorderTask: jasmine.createSpy('reorderTask'),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskListSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
