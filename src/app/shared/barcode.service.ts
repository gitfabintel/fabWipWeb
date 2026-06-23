import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private barcode = '';
  private barcode$ = new Subject<string>();
  private timer: any;

  constructor() {
    this.initializeScanner();
  }

  getBarcodeStream() {
    return this.barcode$.asObservable();
  }

  private initializeScanner() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        if (this.barcode.length > 0) {
          this.barcode$.next(this.barcode);
          this.barcode = '';
        }
        clearTimeout(this.timer);
      } else {
        this.barcode += event.key;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.barcode.length > 0) {
            this.barcode$.next(this.barcode);
            this.barcode = '';
          }
        }, 100); // Adjust the timeout duration as needed
      }
    });
  }

  private playSound() {
    const audio = new Audio('assets/sound/beep.mp3');
    audio.play().catch(error => console.error('Error playing sound:', error));
  }
}
