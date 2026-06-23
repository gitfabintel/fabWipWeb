import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin/admin.component';

import { IndexedDbService } from '../shared/indexed-db.service';
import { ProductService } from '../shared/product.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  GridModule,
  PDFModule,
  ExcelModule,
  ColumnResizingService,
} from '@progress/kendo-angular-grid';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { InputsModule } from '@progress/kendo-angular-inputs';

import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxLoadingModule } from 'ngx-loading';
import { BarcodeService } from '../shared/barcode.service';
import { NgxBarcodeModule } from '@greatcloak/ngx-barcode';
import { BarcodesModule } from '@progress/kendo-angular-barcodes';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';

// ✅ ToastrModule plain (no forRoot in lazy modules)
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AdminComponent,
  ],
  imports: [
    CommonModule,       
    FormsModule,         
    ReactiveFormsModule,
    NgbModule,            
    NgSelectModule,
    NgxLoadingModule.forRoot({}),
    NgxSpinnerModule,     
    AdminRoutingModule,
    ToastrModule,        
    GridModule,
    ChartsModule,
    InputsModule,
    PDFModule,
    BarcodesModule,
    PDFExportModule,
    ExcelModule,
    NgxBarcodeModule,
  ],
  providers: [
    ColumnResizingService,
    IndexedDbService,
    ProductService,
    DatePipe,
    BarcodeService
  ],
})
export class AdminModule { }