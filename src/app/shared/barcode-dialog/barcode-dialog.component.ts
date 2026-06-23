import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BarcodeService } from '../barcode.service';

@Component({
  selector: 'app-barcode-dialog',
  templateUrl: './barcode-dialog.component.html',
  styleUrls: ['./barcode-dialog.component.css']
})
export class BarcodeDialogComponent {
  barcode: string | null = null;

  constructor(private barcodeService: BarcodeService) { }

  ngOnInit() {
    this.barcodeService.getBarcodeStream().subscribe((barcode) => {
      this.barcode = barcode;
      this.showPopup(barcode);
    });
  }

  showPopup(barcode: string) {
    this.barcode = barcode;
    setTimeout(() => this.barcode = null, 3000); // Hide popup after 3 seconds
  }
}
