import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { ModalControllerService } from './services/modal-controller.service';
import { TaskService } from './services/task.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
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
            openNewTaskModal: () => ({ closed: of(undefined) }),
            openEditTaskModal: () => ({ closed: of(undefined) }),
            openTaskCommentsModal: () => ({ closed: of(false) }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).not.toBeNull();
    expect(compiled.querySelector('app-main-content')).not.toBeNull();
  });
});
