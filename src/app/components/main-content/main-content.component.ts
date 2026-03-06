import { Component } from '@angular/core';
import { TaskListSectionComponent } from '../task-list-section/task-list-section.component';
import { WelcomeSectionComponent } from '../welcome-section/welcome-section.component';

@Component({
  selector: 'app-main-content',
  imports: [WelcomeSectionComponent, TaskListSectionComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css',
})
export class MainContentComponent {}
