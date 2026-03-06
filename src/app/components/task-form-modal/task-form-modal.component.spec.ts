import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { TaskFormModalComponent } from './task-form-modal.component';

describe('TaskFormModalComponent', () => {
  let component: TaskFormModalComponent;
  let fixture: ComponentFixture<TaskFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormModalComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            mode: 'create',
            formValues: {
              name: '',
              description: '',
            },
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

    fixture = TestBed.createComponent(TaskFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
