import { Component, input, output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label
          [for]="id()"
          class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          {{ label() }}
          @if (required()) {
            <span class="text-rose-500">*</span>
          }
        </label>
      }

      <div class="relative rounded-lg shadow-sm">
        <input
          [id]="id()"
          [type]="type()"
          [value]="value"
          [placeholder]="placeholder()"
          [disabled]="disabled"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500"
          [class.border-rose-500]="error()"
        />
      </div>

      @if (error()) {
        <p class="mt-1 text-xs text-rose-500 font-medium">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="mt-1 text-xs text-slate-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');

  value: string = '';
  disabled: boolean = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
}
