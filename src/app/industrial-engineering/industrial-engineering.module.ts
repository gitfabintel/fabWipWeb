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
import { PopupModule } from '@progress/kendo-angular-popup';
import { IndustrialEngineeringRoutingModule } from './industrial-engineering-routing.module';
// ── List components ───────────────────────────────────────────
import { SectionsComponent }   from './sections/sections.component';
import { OperationsComponent } from './operations/operations.component';
import { MachinesComponent }   from './machines/machines.component';
import { WorkersComponent }    from './workers/workers.component';
import { StyleBulletinComponent } from './style-bulletin/style-bulletin.component';

// ── Modal components ──────────────────────────────────────────
import { AddEditSectionsComponent }       from './sections/add-edit-sections/add-edit-sections.component';
import { AddEditOperationsComponent }     from './operations/add-edit-operations/add-edit-operations.component';
import { AddEditMachinesComponent }       from './machines/add-edit-machines/add-edit-machines.component';
import { AddEditWorkersComponent }        from './workers/add-edit-workers/add-edit-workers.component';
import { AddEditStyleBulletinComponent } from './style-bulletin/add-edit-style-bulletin/add-edit-style-bulletin.component';

@NgModule({
  declarations: [
    // Lists
    SectionsComponent,
    OperationsComponent,
    MachinesComponent,
    WorkersComponent,
    StyleBulletinComponent,

    // Modals / add-edit
    AddEditSectionsComponent,
    AddEditOperationsComponent,
    AddEditMachinesComponent,
    AddEditWorkersComponent,
    AddEditStyleBulletinComponent,
  ],

   imports: [
         CommonModule,
             ReactiveFormsModule,
             NgbModule,
             NgSelectModule,
             NgxLoadingModule.forRoot({}),
             NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
             IndustrialEngineeringRoutingModule,
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
export class IndustrialEngineeringModule { }
