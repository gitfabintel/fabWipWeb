
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlynumber]'
})
export class OnlynumberDirective {

   private regex: RegExp = /^[0-9]*\.?[0-9]*$/;
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    const current: string = (event.target as HTMLInputElement).value;
    const next: string = current.concat(event.key);
    if (!this.regex.test(next)) {
      event.preventDefault();
    }
  }

}