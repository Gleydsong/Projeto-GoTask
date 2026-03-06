import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalControllerService } from '../../services/modal-controller.service';
import { TaskService } from '../../services/task.service';

import { WelcomeSectionComponent } from './welcome-section.component';

describe('WelcomeSectionComponent', () => {
  let component: WelcomeSectionComponent;
  let fixture: ComponentFixture<WelcomeSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeSectionComponent],
      providers: [
        {
          provide: ModalControllerService,
          useValue: {
            openNewTaskModal: () => ({ closed: of(undefined) }),
          },
        },
        {
          provide: TaskService,
          useValue: {
            addTask: jasmine.createSpy('addTask'),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
