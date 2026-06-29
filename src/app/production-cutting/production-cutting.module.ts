import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IndexedDbService } from '../shared/indexed-db.service';
import { ProductService } from '../shared/product.service';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  GridModule,
  PDFModule,
  ExcelModule,
  FilterMenuModule,
  ColumnResizingService
} from "@progress/kendo-angular-grid";
import { ChartsModule } from "@progress/kendo-angular-charts";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { GuiGridModule } from '@generic-ui/ngx-grid';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxLoadingModule } from 'ngx-loading';
import { BarcodeService } from '../shared/barcode.service';
import { NgxBarcodeModule } from '@greatcloak/ngx-barcode'
import { BarcodesModule } from '@progress/kendo-angular-barcodes';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { HelpersModule } from '../helpers/helpers.module';

import { ProductionCuttingRoutingModule } from './production-cutting-routing.module';
import { CuttingMasterComponent } from './cutting-master/cutting-master.component';
import { AddEditCuttingMasterComponent } from './cutting-master/add-edit-cutting-master/add-edit-cutting-master.component';
import { RollRegisterComponent } from './cutting-master/roll-register/roll-register.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LaySpreadingReportComponent } from './cutting-master/lay-spreading-report/lay-spreading-report.component';
import { ScanCuttingComponent } from './scan-cutting/scan-cutting.component';
import { CuttingDashboardComponent } from './cutting-dashboard/cutting-dashboard.component';



@NgModule({
  declarations: [
    CuttingMasterComponent,
    AddEditCuttingMasterComponent,
    RollRegisterComponent,
    LaySpreadingReportComponent,
    ScanCuttingComponent,
    CuttingDashboardComponent
  ],
  imports: [
       CommonModule,
           ReactiveFormsModule,
           NgbModule,
           NgSelectModule,
           NgxLoadingModule.forRoot({}),
           NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
           ProductionCuttingRoutingModule,
           FormsModule,
           ToastrModule.forRoot({
             progressBar: true
           }),
       
           GuiGridModule,
           GridModule,
           FilterMenuModule,
           ChartsModule,
           InputsModule,
           PDFModule,
           BarcodesModule,
           PDFExportModule,
           ExcelModule,
           NgxBarcodeModule,
           HelpersModule,
           PopupModule
      ],
      providers: [ColumnResizingService,IndexedDbService,ProductService,DatePipe,BarcodeService ],
})
export class ProductionCuttingModule { }
