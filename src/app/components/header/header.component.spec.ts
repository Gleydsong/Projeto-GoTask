import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { PreferencesService } from '../../core/users/services/preferences.service';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            logout: jasmine.createSpy('logout'),
          },
        },
        {
          provide: SessionStoreService,
          useValue: {
            currentUser$: of({
              id: 'seed-admin',
              name: 'GoTask Admin',
              email: 'admin@gotask.local',
              role: 'admin',
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
            currentUserSnapshot: {
              id: 'seed-admin',
            },
          },
        },
        {
          provide: PreferencesService,
          useValue: {
            getCurrentUserPreferences: () =>
              of({
                userId: 'seed-admin',
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

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
