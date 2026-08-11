import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');

  badgeClasses(): string {
    const base =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase';

    const variants = {
      success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      warning: 'bg-amber-100 text-amber-800 border border-amber-200',
      danger: 'bg-rose-100 text-rose-800 border border-rose-200',
      info: 'bg-sky-100 text-sky-800 border border-sky-200',
      neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    }[this.variant()];

    return `${base} ${variants}`;
  }
}
