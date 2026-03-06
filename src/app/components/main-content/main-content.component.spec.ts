import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalControllerService } from '../../services/modal-controller.service';
import { TaskService } from '../../services/task.service';

import { MainContentComponent } from './main-content.component';

describe('MainContentComponent', () => {
  let component: MainContentComponent;
  let fixture: ComponentFixture<MainContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContentComponent],
      providers: [
        {
          provide: TaskService,
          useValue: {
            todoTasks: of([]),
            doingTasks: of([]),
            doneTasks: of([]),
            addTask: jasmine.createSpy('addTask'),
            updateTaskStatus: jasmine.createSpy('updateTaskStatus'),
            reorderTask: jasmine.createSpy('reorderTask'),
          },
        },
        {
          provide: ModalControllerService,
          useValue: {
            openNewTaskModal: () => ({ closed: of(undefined) }),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
