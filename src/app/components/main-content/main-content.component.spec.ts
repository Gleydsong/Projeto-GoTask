import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { PreferencesService } from '../../core/users/services/preferences.service';
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
        {
          provide: SessionStoreService,
          useValue: {
            currentUser$: of({
              id: 'seed-employer',
              name: 'GoTask Employer',
              email: 'employer@gotask.local',
              role: 'employer',
              active: true,
              avatarUrl: null,
              jobTitle: '',
              department: '',
              bio: '',
              phone: '',
              location: '',
              createdAt: '',
              updatedAt: '',
            }),
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

    fixture = TestBed.createComponent(MainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
