import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BarcodeService } from './shared/barcode.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BarcodeDialogComponent } from './shared/barcode-dialog/barcode-dialog.component';
import { Store } from '@ngrx/store';
import { Permission } from './permission/permission.model';
import { setPermissions } from './permission/permission.actions';
declare const KTApp: any;
declare const KTMenu: any;
declare const KTDrawer: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,AfterViewInit  {
  constructor(private barcodeService: BarcodeService,  private modalService: NgbModal,private store: Store) {}

  ngOnInit() {
    const savedPermissions = sessionStorage.getItem('permissions');
    if (savedPermissions) {
      const permissions: Permission[] = JSON.parse(savedPermissions);
      this.store.dispatch(setPermissions({ permissions }));
    }
    this.barcodeService.getBarcodeStream().subscribe(barcode => {


    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      KTApp?.init?.();
      KTMenu?.init?.();
      KTDrawer?.init?.();

      // IMPORTANT: re-run toggle binding
      document.body.dispatchEvent(new Event('kt.init'));
    }, 200);
  }
}
