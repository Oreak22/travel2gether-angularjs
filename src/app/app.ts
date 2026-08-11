import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component/admin-layout.component';
import { CardComponent } from './shared/components/card/card.component.ts/card.component.ts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardComponent, AdminLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('travel2gether');
}
