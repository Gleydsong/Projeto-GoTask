import { Component } from '@angular/core';
import { TaskListSectionComponent } from '../../components/task-list-section/task-list-section.component';
import { WelcomeSectionComponent } from '../../components/welcome-section/welcome-section.component';

@Component({
  selector: 'app-tasks-page',
  imports: [WelcomeSectionComponent, TaskListSectionComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
})
export class TasksPageComponent {}
