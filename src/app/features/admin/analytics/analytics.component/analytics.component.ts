import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
@Component({
  selector: 'app-analytics.component',
  imports: [CommonModule, LucideAngularModule, CardComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent {}
