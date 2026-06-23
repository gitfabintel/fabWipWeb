import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphabeticOnly]'
})
export class AlphabeticOnlyDirective {

  private regex: RegExp = /^[a-zA-Z]*$/; // allows letters and spaces
 private specialKeys: string[] = [
    'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
  ];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    // Prevent number or special characters
    const key = event.key;
    if (!/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedInput: string = event.clipboardData?.getData('text') ?? '';
    if (!this.regex.test(pastedInput)) {
      event.preventDefault();
    }
  }
}