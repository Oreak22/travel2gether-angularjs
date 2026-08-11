import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
@Component({
  selector: 'app-payment-confirmation.component',
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent],
  templateUrl: './payment-confirmation.component.html',
  styleUrl: './payment-confirmation.component.css',
})
export class PaymentConfirmationComponent implements OnInit {
  isProcessing = signal(true);

  ngOnInit(): void {
    setTimeout(() => {
      this.isProcessing.set(false);
    }, 2000);
  }
}
