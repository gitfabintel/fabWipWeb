import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[disableAutofill]'
})
export class DisableAutofillDirective implements AfterViewInit {

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.disableAutofill();
  }

  private disableAutofill() {
    const input = this.elementRef.nativeElement as HTMLInputElement;
    input.autocomplete = 'new-password'; // Use "new-password" for password fields
    setTimeout(() => {
      input.autocomplete = 'off';
    }, 200);
  }
}