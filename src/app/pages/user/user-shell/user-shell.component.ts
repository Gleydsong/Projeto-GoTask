import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './user-shell.component.html',
  styleUrl: './user-shell.component.css',
})
export class UserShellComponent {}
