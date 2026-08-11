import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  hoverable = input<boolean>(false);

  cardClasses(): string {
    const base =
      'bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200';
    const hover = this.hoverable() ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : '';
    return `${base} ${hover}`;
  }
}
