import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AuthSystemService } from 'src/app/shared/auth/auth.system.service';
import { ServiceService } from 'src/app/shared/service.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { Observable } from 'rxjs';
import {
  DataBindingDirective,
  PagerPosition,
} from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor,process } from '@progress/kendo-data-query';
import { PagerType } from '@progress/kendo-angular-pager';

import { environment } from 'src/environments/environment';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Dateformater } from 'src/app/shared/dateformater';
import { AddEditCuttingMasterComponent } from './add-edit-cutting-master/add-edit-cutting-master.component';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import * as JsBarcode from 'jsbarcode';
declare const KTMenu: any;
@Component({
  selector: 'app-cutting-master',
  templateUrl: './cutting-master.component.html',
  styleUrls: ['./cutting-master.component.css']
})
export class CuttingMasterComponent {
public gridView: unknown[] = [];
public gridData: any[] = [];
  columns: any = [];
  // temp: any = [];
  menuTop  = 0;
menuLeft = 0;
  image : any;
  image2 : any;
  response: any;
  data:any;
  canAdd$!: Observable<boolean>;
           canDelete$!: Observable<boolean>;
             Filter: any = [];
  Count: any;
  public buttonCount = 5;
  public info = true;
  public pageSizes = true;
  public previousNext = true;
  public position: PagerPosition = 'bottom';
  public pagerTypes = ['numeric', 'input'];
  public type: PagerType = 'numeric';
  public pageSize = 20;
  public skip = 0;
  loadingIndicator = true;
  dateformater: Dateformater = new Dateformater();
  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;
data1:any={}
    constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private modalService: NgbModal,
    private serviceSystem: AuthSystemService,
    private service: ServiceService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnInit(): void {
    const menuName = 'Inward Gate Pass'; // or 'Security/Users' or whatever your key is

    const permission$ = this.store.select(selectPermissionByMenu(menuName));

    this.canAdd$ = permission$.pipe(map((p:any) => p?.canAdd ?? false));
    this.canDelete$ = permission$.pipe(map((p: any) => p?.canDelete ?? false));
    this.http.get('/assets/fabicon-2-c.png', { responseType: 'blob' })
    .subscribe(res => {
      const reader = new FileReader();
      reader.onloadend = () => {
        var base64data = reader.result;                
            console.log(base64data);
            this.image2 = base64data;
      }
 
      reader.readAsDataURL(res); 
      console.log(res);
      this.image = res;
     
    });
    this.get();
  }

  reset(){
    this.data1.startDate = null;
    this.data1.endDate = null;
    this.get()
  }

  get() {
 

    this.loadingIndicator = true;
    if (this.data1.startDate || this.data1.endDate) {
      this.data1.startDate = this.dateformater.toModel(this.data1.startDate);
      this.data1.endDate = this.dateformater.toModel(this.data1.endDate);
    } else {
      this.data1.startDate = "null";
      this.data1.endDate = "null";
    }
    if(this.data1.startDate == "NaN-NaN-NaN" || this.data1.startDate == "undefined-undefined-undefined"){
      this.data1.startDate = "null";
      this.data1.endDate = "null";
    }
    // /${this.data1.startDate}/${this.data1.endDate}
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetCuttingList`)
      .subscribe(
        (res) => {
          this.response = res;
          if (this.response.success == true) {
            this.data = this.response.data;
            if (this.data1.startDate || this.data1.endDate) {
              this.data1.startDate = this.dateformater.fromModel1(this.data1.startDate);
              this.data1.endDate = this.dateformater.fromModel1(this.data1.endDate);
            } else {
              this.data1.startDate = "null";
              this.data1.endDate = "null";
            }
            
            this.gridView = this.data;
            this.gridData = [...this.data];
              setTimeout(() => {
        if (typeof KTMenu !== 'undefined') {
          KTMenu.init();
        }
      }, 100);

            this.loadingIndicator = false;
          } else {
            this.toastr.error(this.response.message, 'Message.');
            this.loadingIndicator = false;
          }
        },
        (err) => {
          if (err) {
            this.toastr.error(this.response.message, 'Message.');
            this.loadingIndicator = false;
          }
        }
      );
  }
  onExpand(e:any,index:number) {
    this.loadingIndicator = true;
    this.http
      .get(`${environment.apiUrl}/api/IGP/GetIGPDetailById/` + e.dataItem.id)
      .subscribe(
        (res) => {
          this.response = res;
          if (this.response.success == true) {
            this.response.data;
            console.log(this.response.data)
            this.gridData[index].objIGPDetail= this.response.data;
            this.gridData = [...this.gridData];
            this.loadingIndicator = false;
          } else {
            this.toastr.error(this.response.message, 'Message.');
            this.loadingIndicator = false;
          }
        },
        (err) => {
          if (err) {
            this.toastr.error(this.response.message, 'Message.');
            this.loadingIndicator = false;
          }
        }
      );
  }
  onDelete(data: any) {
      Swal.fire({
    title: 'Are you sure?',
    html: `Delete cutting order <strong>${data.productionCuttingHeaderNumber}</strong>?
           <br><small class="text-danger">This will also delete all bundles and roll register.</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.loadingIndicator = true;
      this.http
        .delete(`${environment.apiUrl}/api/ProductionCutting/DeleteCutting/` + data.id)
        .subscribe(
          (res: any) => {
            if (res.success) {
              Swal.fire({
                title: 'Deleted!',
                text: 'Cutting order has been deleted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
              this.get();
            } else {
              this.toastr.error(res.message, 'Error');
            }
            this.loadingIndicator = false;
          },
          () => {
            this.toastr.error('Error deleting record.', 'Error');
            this.loadingIndicator = false;
          }
        );
    }
  });
    
     }
onFilterField(event: any): void {
  const inputValue = event ? event.toLowerCase() : '';
  const temp = this.gridData.filter((d: any) => {
    return (
      (d.productionCuttingHeaderNumber && d.productionCuttingHeaderNumber.toLowerCase().indexOf(inputValue) !== -1) ||
      (d.jobNumber      && d.jobNumber.toLowerCase().indexOf(inputValue) !== -1)      ||
      (d.customerName   && d.customerName.toLowerCase().indexOf(inputValue) !== -1)   ||
      (d.styleName      && d.styleName.toLowerCase().indexOf(inputValue) !== -1)      ||
      (d.colorName      && d.colorName.toLowerCase().indexOf(inputValue) !== -1)      ||
      (d.articleName    && d.articleName.toLowerCase().indexOf(inputValue) !== -1)    ||
      !inputValue
    );
  });
  this.gridView = temp;
}

generateBundles(itemData: any) {
  if (!itemData.cutId) {
    this.toastr.warning('Please save the cutting plan first before generating bundles.', 'Warning');
    return;
  }

  const msg = itemData.bundlesGenerated
    ? `Regenerate bundles for ${itemData.productionCuttingHeaderNumber}? This will delete existing bundles.`
    : `Generate bundles for ${itemData.productionCuttingHeaderNumber}?`;

  Swal.fire({
    title: 'Generate Bundles',
    text: msg,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Generate!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.loadingIndicator = true;
      this.http
        .get(`${environment.apiUrl}/api/ProductionCutting/GenerateBundles/` + itemData.cutId)
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.toastr.success(res.message, 'Success');
              this.get(); // refresh grid to update bundlesGenerated flag
            } else {
              this.toastr.error(res.message, 'Message.');
            }
            this.loadingIndicator = false;
          },
          (err) => {
            this.toastr.error('Error generating bundles.', 'Error');
            this.loadingIndicator = false;
          }
        );
    }
  });
}
moveToFloor(itemData: any): void {
  Swal.fire({
    title: 'Move to Floor?',
    html: `Move all bundles of <strong>${itemData.productionCuttingHeaderNumber}</strong>
           from Cutting to Stitching Input?<br>
           <small class="text-muted">This sends the entire order to the next stage.</small>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Move to Floor'
  }).then((result) => {
    if (result.isConfirmed) {
      this.loadingIndicator = true;
      // toStageId = 3 (Stitching) — confirmed from your ProductionStage table
      this.http
        .post(`${environment.apiUrl}/api/ProductionCutting/MoveBundlesBulk/${itemData.cutId}/3`, {})
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.toastr.success(res.message, 'Moved');
              this.get();
            } else {
              this.toastr.error(res.message, 'Error');
            }
            this.loadingIndicator = false;
          },
          () => {
            this.toastr.error('Error moving bundles.', 'Error');
            this.loadingIndicator = false;
          }
        );
    }
  });
}
  public onFilter(value: Event): void {
    const inputValue = value;

    this.gridView = process(this.gridData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: 'igpNumber',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'dcNumber',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'gateEntryNo',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'driverName',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'vehicalNumber',
            operator: 'contains',
            value: inputValue,
          },
          {
            field: 'partyName',
            operator: 'contains',
            value: inputValue,
          },

            {
            field: 'purchaseOrderNumber',
            operator: 'contains',
            value: inputValue,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }
  getInitials(firstName: string, lastName: string): string {
    if (firstName && lastName) {
      return firstName[0].toUpperCase() + lastName[0].toUpperCase();
    } else {
      return (firstName || lastName || '').toUpperCase()[0] || ''; // Handle cases with missing names
    }
  }
  edit(data: any, check: string) {
        this.router.navigate(['/production-cutting/add-edit-cutting-master'], { 
    queryParams: { 
      statusCheck: check ,
      PId: data.id 
    } 
  });
    }
    add(check: string) {
    this.router.navigate(['/production-cutting/add-edit-cutting-master'], { 
    queryParams: { 
      statusCheck: check 
    } 
  });
    }
   printsportmethod(itemData: any){
      this.loadingIndicator = true;
      this.http
        .get(`${environment.apiUrl}/api/ProductionCutting/GetCuttingForPrint/` + itemData.id)
        .subscribe(
          (res) => {
            this.response = res;
            if (this.response.success == true) {
              this.response.data;
              this. generatePDFCutting(this.response.data)
              this.loadingIndicator = false;
            } else {
              this.toastr.error(this.response.message, 'Message.');
              this.loadingIndicator = false;
            }
          },
          (err) => {
            if (err) {
              this.toastr.error(this.response.message, 'Message.');
              this.loadingIndicator = false;
            }
          }
        );
    }

       printsportmethodBundles(itemData: any){
          if (!itemData.cutId) {
    this.toastr.warning('No cut found. Please save the cutting plan first.', 'Warning');
    return;
  }
  if (!itemData.bundlesGenerated) {
    this.toastr.warning('Bundles not generated yet. Please generate bundles first.', 'Warning');
    return;
  }
      this.loadingIndicator = true;
      this.http
        .get(`${environment.apiUrl}/api/ProductionCutting/GetBundlesForPrint/` + itemData.cutId)
        .subscribe(
          (res) => {
            this.response = res;
            if (this.response.success == true) {
              this.response.data;
              this.generatePDFBundleCore(this.response.data)
              this.loadingIndicator = false;
            } else {
              this.toastr.error(this.response.message, 'Message.');
              this.loadingIndicator = false;
            }
          },
          (err) => {
            if (err) {
              this.toastr.error(this.response.message, 'Message.');
              this.loadingIndicator = false;
            }
          }
        );
    }

    openLaySpreadingReport(itemData: any): void {
  if (!itemData.cutId) {
    this.toastr.warning(
      'Please save the cutting plan first.',
      'Warning'
    );
    return;
  }
  this.router.navigate(
    ['/production-cutting/lay-spreading-report'],
    {
      queryParams: {
        headerId: itemData.id,
        cutId:    itemData.cutId
      }
    }
  );
}
updateStatus(data: any, status: string): void {
  const messages: any = {
    'Checked':  { title: 'Mark as Checked?',  btn: 'Yes, Check it!',   color: '#16a34a' },
    'Approved': { title: 'Approve this cut?',  btn: 'Yes, Approve!',    color: '#2563eb' },
    'Draft':    { title: 'Revert to Draft?',   btn: 'Yes, Revert!',     color: '#f59e0b' }
  };

  const msg = messages[status];

  Swal.fire({
    title: msg.title,
    text:  `${data.productionCuttingHeaderNumber}`,
    icon:  'question',
    showCancelButton:    true,
    confirmButtonColor:  msg.color,
    cancelButtonColor:   '#6b7280',
    confirmButtonText:   msg.btn
  }).then((result) => {
    if (result.isConfirmed) {
      this.loadingIndicator = true;
      this.http
        .get(
          `${environment.apiUrl}/api/ProductionCutting/UpdateCuttingStatus/${data.id}/${status}`
        
        )
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.toastr.success(res.message, 'Success');
              this.get();
            } else {
              this.toastr.error(res.message, 'Error');
            }
            this.loadingIndicator = false;
          },
          () => {
            this.toastr.error('Error updating status.', 'Error');
            this.loadingIndicator = false;
          }
        );
    }
  });
}
generatePDFCutting(printData: any) {

  const cut = printData.cuts?.[0];

  const sections = (cut?.sections || []).map((sec: any) => ({
    ...sec,
    name: sec.sectionName,
    sizes: (sec.sizes || [])
      .slice()
      .sort((a: any, b: any) => (a.insertOrder || 0) - (b.insertOrder || 0))
      .map((sz: any) => ({
        ...sz,
        name: sz.sizeName,
        poQty: sz.poQty,
        cutQty: sz.cutQty,
        totalCalculated: sz.totalCalculated,
        diff: sz.diff
      })),
    lays: (sec.lays || []).map((lay: any) => {
      const breakdown: { [key: string]: number } = {};
      (lay.breakdowns || []).forEach((bd: any) => {
        breakdown[bd.sizeName] = bd.ratio;
      });
      return { ...lay, breakdown };
    })
  }));

  const sizeHeaders = (sections[0]?.sizes || [])
    .slice()
    .sort((a: any, b: any) => (a.insertOrder || 0) - (b.insertOrder || 0));

  const extraPercentage = printData.extraPercentage || 0;

  // ── HELPER: Size Breakdown Summary Table (top of page 1) ──
  const buildSummaryTable = () => {

    const headerRow = [
      { text: 'Section', style: 'tableHeader', fillColor: '#1e293b' },
      ...sizeHeaders.map((sz: any) => ({ text: sz.sizeName, style: 'tableHeader', fillColor: '#1e293b' })),
      { text: 'Total', style: 'tableHeader', fillColor: '#1e293b' }
    ];

    const qtyRows = sections.map((sec: any) => {
      const total = sec.sizes.reduce((s: number, sz: any) => s + (sz.poQty || 0), 0);
      return [
        { text: sec.name, style: 'cellLeft' },
        ...sec.sizes.map((sz: any) => ({ text: sz.poQty ? sz.poQty : '', style: 'cellNum', color: '#1d4ed8' })),
        { text: total || '', style: 'cellBold', color: '#1d4ed8', fillColor: '#eff6ff' }
      ];
    });

    const extraDividerRow = [
      { text: `Extra Allowance — ${extraPercentage}%`, style: 'common', colSpan: 2 + sizeHeaders.length, fillColor: '#f1f5f9' },
      ...Array(1 + sizeHeaders.length).fill({})
    ];

    const extraRows = sections.map((sec: any) => {
      const total = sec.sizes.reduce((s: number, sz: any) => s + ((sz.cutQty || 0) - (sz.poQty || 0)), 0);
      return [
        { text: sec.name, style: 'cellLeft', color: '#92400e' },
        ...sec.sizes.map((sz: any) => {
          const extra = (sz.cutQty || 0) - (sz.poQty || 0);
          return { text: extra ? extra : '', style: 'cellNum', color: '#b45309', fillColor: '#fefce8' };
        }),
        { text: total || '', style: 'cellBold', color: '#92400e', fillColor: '#fef9c3' }
      ];
    });

    const totalCutRow = [
      { text: 'Total Cut', style: 'tableHeader', fillColor: '#1e293b' },
      ...sizeHeaders.map((_: any, i: number) => {
        const colTotal = sections.reduce((s: number, sec: any) => s + (sec.sizes[i]?.cutQty || 0), 0);
        return { text: colTotal || '', style: 'tableHeader', fillColor: '#0f172a' };
      }),
      {
        text: sections.reduce((s: number, sec: any) => s + sec.sizes.reduce((ss: number, sz: any) => ss + (sz.cutQty || 0), 0), 0),
        style: 'tableHeader', fillColor: '#0f172a'
      }
    ];

    return {
      table: {
        headerRows: 1,
        widths: ['*', ...sizeHeaders.map(() => '*'), '*'],
        body: [headerRow, ...qtyRows, extraDividerRow, ...extraRows, totalCutRow]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1'
      },
      margin: [0, 0, 0, 10]
    };
  };

  // ── HELPER: Lay Matrix Table ──
  const buildLayMatrixTable = (sec: any) => {
    const headerRow = [
      { text: 'Req Fabric', style: 'tableHeaderSub', fillColor: '#fdf4ff', color: '#7e22ce' },
      { text: 'Mkr Avg', style: 'tableHeaderSub', fillColor: '#fff7ed', color: '#c2410c' },
      { text: 'Mkr Length', style: 'tableHeaderSub', fillColor: '#fff7ed', color: '#c2410c' },
      { text: 'Mkr Width', style: 'tableHeaderSub', fillColor: '#fff7ed', color: '#c2410c' },
      { text: 'Shrinkage', style: 'tableHeaderSub' },
      { text: 'Marker', style: 'tableHeaderSub' },
      { text: 'Status', style: 'tableHeaderSub' },
      { text: 'Plies', style: 'tableHeaderSub', fillColor: '#eff6ff', color: '#1e40af' },
      ...sec.sizes.map((sz: any) => ({ text: `${sz.name}`, style: 'tableHeaderSub' })),
      { text: 'Total Pcs', style: 'tableHeaderSub', fillColor: '#f0fdf4', color: '#166534' }
    ];

    const layRows = (sec.lays || []).map((lay: any) => [
      { text: lay.reqFabric || 0, style: 'cellBold', color: '#7e22ce', fillColor: '#fdf4ff' },
      { text: lay.markerAvg || 0, style: 'cellNum', color: '#c2410c', fillColor: '#fff7ed' },
      { text: lay.markerLength || 0, style: 'cellNum', color: '#c2410c', fillColor: '#fff7ed' },
      { text: lay.markerWidth || 0, style: 'cellNum', color: '#c2410c', fillColor: '#fff7ed' },
      { text: lay.shrinkage || '', style: 'cellNum' },
      { text: lay.markerName || '', style: 'cellBold' },
      { text: lay.status || '', style: 'cellNum' },
      { text: lay.plies || 0, style: 'cellBold', color: '#1e40af', fillColor: '#f0f7ff' },
      ...sec.sizes.map((sz: any) => ({ text: lay.breakdown[sz.name] || '', style: 'cellNum' })),
      { text: lay.totalPcs || 0, style: 'cellBold', color: '#16a34a', fillColor: '#f4fbf7' }
    ]);

    const totalReqFabric = parseFloat(
      (sec.lays || []).reduce((sum: number, lay: any) => sum + (lay.reqFabric || 0), 0).toFixed(2)
    );

    const totalRow = [
      { text: totalReqFabric, style: 'cellBold', color: '#7e22ce', fillColor: '#fdf4ff' },
      { text: '', fillColor: '#fff7ed' },
      { text: '', fillColor: '#fff7ed' },
      { text: '', fillColor: '#fff7ed' },
      { text: 'TOTAL', style: 'cellBold', colSpan: 2 },
      {},
      { text: '' },
      { text: sec.grandTotalPlies, style: 'cellBold', color: '#1e40af', fillColor: '#eff6ff' },
      ...sec.sizes.map((sz: any) => ({ text: sz.totalCalculated || 0, style: 'cellBold' })),
      { text: sec.grandTotalGarments, style: 'cellBold', color: '#166534', fillColor: '#f0fdf4' }
    ];

    return {
      table: {
        headerRows: 1,
        widths: [
          '8%', '7%', '8%', '8%', '7%', '6%', '6%', '7%',
          ...sec.sizes.map(() => '*'),
          '8%'
        ],
        body: [headerRow, ...layRows, totalRow]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1'
      }
    };
  };

  // ══════════════════════════════════════════
  // BUILD FULL DOCUMENT CONTENT
  // ══════════════════════════════════════════
  const content: any[] = [];

  content.push({ text: 'Size Breakdown Summary', style: 'sectionTitle' });
  content.push(buildSummaryTable());

  sections.forEach((sec: any, idx: number) => {
    if (idx > 0) {
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 750, y2: 0, lineWidth: 0.5, lineColor: '#e2e8f0' }],
        margin: [0, 10, 0, 10]
      });
    }

    content.push({
      text: `${(sec.name || '').toUpperCase()} PRODUCTION SHEET`,
      style: 'sectionTitle',
      margin: [0, idx === 0 ? 12 : 0, 0, 6],
      color: sec.color
    });

    content.push({
      text: `Fabric: ${sec.fabricLabel || '-'}`,
      style: 'common',
      margin: [0, 0, 0, 6]
    });

    content.push({ text: 'Lay Matrix Entries', style: 'sectionTitle', fontSize: 10, margin: [0, 6, 0, 4] });
    content.push(buildLayMatrixTable(sec));
  });

  // ══════════════════════════════════════════
  // DOC DEFINITION
  // ══════════════════════════════════════════
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [24, 75, 24, 45],
    pageOrientation: 'landscape',
    info: { title: `Cutting Plan - Cut ${cut?.cutNo || ''}` },

header: (currentPage: number, pageCount: number) => ({
  margin: [24, 16, 24, 0],
  columns: [
    {
      width: '40%',
      columns: [
        this.image2
          ? { image: this.image2, fit: [32, 32], width: 32, margin: [0, 0, 8, 0] }
          : { text: '', width: 0 },
        {
          width: '*',
          stack: [
            { text: 'FabIndustries (Pvt) Ltd', style: 'heading' },
            { text: 'Cutting Plan Sheet', style: 'subheading' }
          ]
        }
      ]
    },
    {
      width: '60%',
      alignment: 'right',
      stack: [
        { text: `Job: ${printData.jobNumber || '-'}    Article: ${printData.articleName || '-'}    Style: ${printData.styleName || '-'}`, style: 'common' },
        { text: `Customer: ${printData.customerName || '-'}    Color: ${printData.colorName || '-'}    Cut No: ${cut?.cutNo || '-'}    Shade: ${cut?.globalShade || '-'}`, style: 'common' },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'common', margin: [0, 2, 0, 0] }
      ]
    }
  ]
}),

    footer: (currentPage: number, pageCount: number) => {
      if (currentPage === pageCount) {
        return {
          margin: [24, 0, 24, 10],
          columns: [
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 25, y1: 0, x2: 175, y2: 0, lineWidth: 0.75 }] },
                { text: 'PREPARED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            },
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 25, y1: 0, x2: 175, y2: 0, lineWidth: 0.75 }] },
                { text: 'CHECKED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            },
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 25, y1: 0, x2: 175, y2: 0, lineWidth: 0.75 }] },
                { text: 'APPROVED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            }
          ]
        };
      }
      return null;
    },

    content: content,

    styles: {
      heading:        { fontSize: 14, bold: true, color: '#1e293b', margin: [0, 0, 0, 1] },
      subheading:     { fontSize: 9, bold: true, color: '#64748b' },
      common:         { fontSize: 8, color: '#475569' },
      sectionTitle:   { fontSize: 11, bold: true, color: '#1e3a8a', margin: [0, 12, 0, 6] },
      tableHeader:    { bold: true, fontSize: 8, color: 'white', alignment: 'center', margin: [2, 3, 2, 3] },
      tableHeaderSub: { bold: true, fontSize: 7, color: '#475569', alignment: 'center', fillColor: '#f1f5f9', margin: [2, 3, 2, 3] },
      cellNum:        { fontSize: 8, alignment: 'center', margin: [1, 2, 1, 2] },
      cellLeft:       { fontSize: 8, alignment: 'left', margin: [3, 2, 1, 2] },
      cellBold:       { fontSize: 8, bold: true, alignment: 'center', margin: [1, 2, 1, 2] },
      signatureName:  { alignment: 'center', italics: true, fontSize: 8, margin: [0, 0, 0, 1] },
      signatureTitle: { alignment: 'center', bold: true, fontSize: 7, margin: [0, 2, 0, 0], color: '#34495e' }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}
// ── Helper used inside generatePDFCutting ──
getTotalReqFabricForSection(sec: any): number {
  return parseFloat(
    (sec.lays || []).reduce((sum: number, lay: any) => sum + (lay.reqFabric || 0), 0).toFixed(2)
  );
}
generatePDFBundleCore(printData: any) {

  const sections = printData.sections || [];

  const buildCutBlockCell = (block: any) => {
    if (!block) return { text: '' };

    const rows: any[] = [];

    // ── Header rows ──
    rows.push([
      { text: 'Cut #', style: 'cutLabel', fillColor: '#e2e8f0' },
      { text: `${block.cutNo}`, style: 'cutValue', fillColor: '#1e293b', colSpan: 3 }, {}, {}
    ]);
    rows.push([
      { text: 'Shrk', style: 'cutLabel', fillColor: '#f1f5f9' },
      { text: block.shrinkage || '0X0%', style: 'cellNum', colSpan: 3 }, {}, {}
    ]);
    rows.push([
      { text: 'Shade', style: 'cutLabel', fillColor: '#f1f5f9' },
      { text: block.shade || '-', style: 'cellNum', colSpan: 3 }, {}, {}
    ]);
    rows.push([
      { text: 'B#',        style: 'colHeader', fillColor: '#f8fafc' },
      { text: 'SIZE',      style: 'colHeader', fillColor: '#f8fafc' },
      { text: 'NUMBERING', style: 'colHeader', fillColor: '#f8fafc' },
      { text: 'PCS',       style: 'colHeader', fillColor: '#f8fafc' }
    ]);

    // ── Bundle rows ──
    (block.bundles || []).forEach((b: any, i: number) => {
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      rows.push([
        { text: b.bundleNo,                      style: 'cellNum',  fillColor: bg },
        { text: b.sizeName,                      style: 'cellNum',  fillColor: bg },
        { text: `${b.fromNumber}/${b.toNumber}`, style: 'cellNum',  fillColor: bg },
        { text: b.totalQty,                      style: 'cellBold', fillColor: bg }
      ]);
    });

    // ── Total rows ──
    rows.push([
      { text: block.lastNumber, style: 'totalCell', fillColor: '#1e293b', colSpan: 4 },
      {}, {}, {}
    ]);
    rows.push([
      { text: block.totalPcs, style: 'totalCell', fillColor: '#0f172a', colSpan: 4 },
      {}, {}, {}
    ]);

    return {
      table: {
        widths: [20, 22, 48, 20],
        body: rows
      },
      layout: {
        hLineWidth:    () => 0.3,
        vLineWidth:    () => 0.3,
        hLineColor:    () => '#cbd5e1',
        vLineColor:    () => '#cbd5e1',
        paddingTop:    () => 0,
        paddingBottom: () => 0,
        paddingLeft:   () => 2,
        paddingRight:  () => 2
      }
    };
  };

 // ── Full header — ONLY shown once, for the FIRST section ──
  const buildFullHeader = (sec: any) => ({
    table: {
      widths: ['18%', '32%', '18%', '32%'],
      body: [
        [
          { text: 'W/O #',        style: 'infoLabel' },
          { text: printData.jobNumber || '-',    style: 'infoValue', colSpan: 3 },
          {}, {}
        ],
        [
          { text: 'BUYER',        style: 'infoLabel' },
          { text: printData.customerName || '-', style: 'infoValue' },
          { text: 'STYLE',        style: 'infoLabel' },
          { text: printData.styleName || '-',    style: 'infoValue' }
        ],
        [
          { text: 'FABRIC',       style: 'infoLabel' },
          { text: sec.fabricLabel || '-',        style: 'infoValue' },
          { text: 'SECTION',      style: 'infoLabel' },
          { text: sec.sectionName || '-',        style: 'infoValue',
            color: sec.sectionColor || '#1e293b' }
        ],
        [
          { text: 'WILL CUT QTY', style: 'infoLabel' },
          { text: sec.totalCutQty || 0,          style: 'infoValue' },
          { text: 'CUT QTY',      style: 'infoLabel' },
          { text: sec.totalCutQty || 0,          style: 'infoValue' }
        ]
      ]
    },
    layout: {
      hLineWidth:    () => 0.4,
      vLineWidth:    () => 0.4,
      hLineColor:    () => '#94a3b8',
      vLineColor:    () => '#94a3b8',
      paddingTop:    () => 2,
      paddingBottom: () => 2,
      paddingLeft:   () => 4,
      paddingRight:  () => 4
    },
    margin:              [0, 0, 0, 5],
    dontBreakRows:       true,
    keepWithHeaderRows:  1
  });

  // ── Compact section banner — used for 2nd, 3rd... sections (just the name) ──
const buildSectionBanner = (sec: any) => ({
  table: {
    widths: ['18%', '32%', '18%', '32%'],
    body: [
      [
        { text: 'SECTION',      style: 'infoLabel' },
        { text: sec.sectionName || '-', style: 'infoValue',
          color: sec.sectionColor || '#1e293b' },
        { text: 'FABRIC',       style: 'infoLabel' },
        { text: sec.fabricLabel || '-', style: 'infoValue' }
      ],
      [
        { text: 'CUT QTY',      style: 'infoLabel' },
        { text: sec.totalCutQty || 0,   style: 'infoValue' },
        { text: 'WILL CUT QTY', style: 'infoLabel' },
        { text: sec.totalCutQty || 0,   style: 'infoValue' }
      ]
    ]
  },
  layout: {
    hLineWidth:    () => 0.4,
    vLineWidth:    () => 0.4,
    hLineColor:    () => '#94a3b8',
    vLineColor:    () => '#94a3b8',
    paddingTop:    () => 2,
    paddingBottom: () => 2,
    paddingLeft:   () => 4,
    paddingRight:  () => 4
  },
  margin:              [0, 0, 0, 5],
  dontBreakRows:       true,
  keepWithHeaderRows:  1
});

  // ── CONTENT ──
  const content: any[] = [];

  sections.forEach((sec: any, idx: number) => {

    // ── Separator between sections ──
    if (idx > 0) {
      content.push({
        canvas: [{
          type: 'line', x1: 0, y1: 0, x2: 515, y2: 0,
          lineWidth: 0.8, lineColor: '#1e293b'
        }],
        margin: [0, 6, 0, 6]
      });
    }

    // ── Section header ──
   if (idx === 0) {
      content.push(buildFullHeader(sec));
    } else {
      content.push(buildSectionBanner(sec));
    }

    // ── Cut blocks using TABLE layout (not columns) ──
    const cutBlocks    = sec.cutBlocks || [];
    const blocksPerRow = 4;

    for (let i = 0; i < cutBlocks.length; i += blocksPerRow) {
      const rowBlocks = cutBlocks.slice(i, i + blocksPerRow);

      // Pad to 4
      while (rowBlocks.length < blocksPerRow) rowBlocks.push(null);

      content.push({
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            rowBlocks.map((block: any) => ({
              stack: block ? [buildCutBlockCell(block)] : [{ text: '' }],
              border: [false, false, false, false]
            }))
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 2]
      });
    }
  });

  // ── DOC DEFINITION ──
  const docDefinition: any = {
    pageSize:        'A4',
    pageMargins:     [10, 55, 10, 28],
    pageOrientation: 'portrait',

 // ── 2. Fix header margin ──
header: (currentPage: number, pageCount: number) => ({
  margin: [10, 12, 10, 0],       // ← was 6, now 12 for more breathing room
  columns: [
    {
      width: '50%',
      columns: [
        this.image2
          ? { image: this.image2, fit: [22, 22], width: 22, margin: [0, 0, 4, 0] }
          : { text: '', width: 0 },
        {
          stack: [
            { text: 'FabIndustries (Pvt) Ltd', style: 'heading' },
            { text: 'Bundle Core Sheet',       style: 'subheading' }
          ]
        }
      ]
    },
    {
      width: '50%',
      alignment: 'right',
      stack: [
        {
          text: `Job: ${printData.jobNumber || '-'}   Style: ${printData.styleName || '-'}   Color: ${printData.colorName || '-'}`,
          style: 'headerRight'    // ← new style
        },
        {
          text: `Cut No: ${printData.cutNo || '-'}   Shade: ${printData.globalShade || '-'}   Page ${currentPage}/${pageCount}`,
          style: 'headerRight'    // ← new style
        }
      ]
    }
  ]
}),

    footer: (currentPage: number, pageCount: number) => {
      if (currentPage === pageCount) {
        return {
          margin: [10, 0, 10, 4],
          columns: [
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 8, y1: 0, x2: 110, y2: 0, lineWidth: 0.6 }] },
                { text: 'PREPARED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            },
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 8, y1: 0, x2: 110, y2: 0, lineWidth: 0.6 }] },
                { text: 'CHECKED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            },
            {
              stack: [
                { text: ' ', style: 'signatureName' },
                { canvas: [{ type: 'line', x1: 8, y1: 0, x2: 110, y2: 0, lineWidth: 0.6 }] },
                { text: 'APPROVED BY', style: 'signatureTitle' }
              ],
              width: '33.3%'
            }
          ]
        };
      }
      return null;
    },

    content: content,

    styles: {
      heading:        { fontSize: 10, bold: true, color: '#1e293b' },
      subheading:     { fontSize: 7, bold: true, color: '#64748b' },
      common:         { fontSize: 6.5, color: '#475569', margin: [0, 1, 0, 0] },
      infoLabel:      { fontSize: 6.5, bold: true, color: '#64748b', fillColor: '#f1f5f9' },
      infoValue:      { fontSize: 7, bold: true, color: '#1e293b' },
      headerRight:    { fontSize: 7, color: '#1e293b', bold: false },
      cutLabel:       { fontSize: 6, bold: true, color: '#64748b', alignment: 'center' },
      cutValue:       { fontSize: 7, bold: true, color: 'white',   alignment: 'center' },
      colHeader:      { fontSize: 6, bold: true, color: '#475569', alignment: 'center' },
      cellNum:        { fontSize: 6.5, alignment: 'center' },
      cellBold:       { fontSize: 6.5, bold: true, alignment: 'center' },
      totalCell:      { fontSize: 6.5, bold: true, color: 'white', alignment: 'center' },
      signatureName:  { alignment: 'center', italics: true, fontSize: 6, margin: [0, 0, 0, 1] },
      signatureTitle: { alignment: 'center', bold: true, fontSize: 5.5, color: '#34495e' }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}

printBundleTickets(itemData: any): void {
  if (!itemData.cutId) {
    this.toastr.warning('No cut found.', 'Warning');
    return;
  }
  this.loadingIndicator = true;
  this.http
    .get(`${environment.apiUrl}/api/ProductionCutting/GetBundlesForTicket/` + itemData.cutId)
    .subscribe(
      (res: any) => {
        if (res.success) {
          this.generatePDFBundleTickets(res.data);
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.loadingIndicator = false;
      },
      () => {
        this.toastr.error('Error fetching tickets.', 'Error');
        this.loadingIndicator = false;
      }
    );
}

generatePDFBundleTickets(printData: any): void {

  const bundles = printData.bundles || [];
  if (bundles.length === 0) {
    this.toastr.warning('No bundles found.', 'Warning');
    return;
  }

  // ── 4 tickets per row, each ticket is a fixed size ──
  const ticketsPerRow = 4;
  const content: any[] = [];

    // ── Generate barcode images first ──
  bundles.forEach((b: any) => {
    b.barcodeImage = this.generateBarcode(b.barcode);
  });

  for (let i = 0; i < bundles.length; i += ticketsPerRow) {
    const rowBundles = bundles.slice(i, i + ticketsPerRow);

    // Pad to 4
    while (rowBundles.length < ticketsPerRow) rowBundles.push(null);

    content.push({
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          rowBundles.map((b: any) => b
            ? {
                stack: [
                  // ── Company ──
                  {
                    text: 'FabIndustries (Pvt) Ltd',
                    style: 'ticketCompany',
                    alignment: 'center'
                  },
                  // ── Order + Style ──
                  {
                    columns: [
                      { text: `W/O: ${printData.jobNumber}`, style: 'ticketField', width: '*' },
                      { text: `Cut: ${printData.cutNo}`,     style: 'ticketField', width: '*' }
                    ],
                    margin: [0, 2, 0, 0]
                  },
                  {
                    text: printData.styleName,
                    style: 'ticketStyle',
                    alignment: 'center'
                  },
                  // ── Size (large) ──
                  {
                    text: b.sizeName,
                    style: 'ticketSize',
                    alignment: 'center'
                  },
                  // ── Section + Shade ──
                  {
                    columns: [
                      { text: b.sectionName, style: 'ticketField', width: '*' },
                      { text: `Shade: ${b.shade}`, style: 'ticketField', width: '*' }
                    ]
                  },
                  // ── Numbering ──
                  {
                    text: `${b.fromNumber} / ${b.toNumber}`,
                    style: 'ticketNumbering',
                    alignment: 'center'
                  },
                  // ── Pcs ──
                  {
                    columns: [
                      { text: 'PCS', style: 'ticketLabel', width: 30 },
                      { text: `${b.totalQty}`, style: 'ticketPcs', width: '*' },
                      { text: `B# ${b.bundleNo}`, style: 'ticketBundleNo', width: '*' }
                    ],
                    margin: [0, 2, 0, 0]
                  },
                  // ── Shrinkage + Marker ──
                  {
                    columns: [
                      { text: `Shrk: ${b.shrinkage}`,  style: 'ticketSmall', width: '*' },
                      { text: `Mrkr: ${b.markerName}`, style: 'ticketSmall', width: '*' }
                    ]
                  },
                  // ── Barcode Image ──
                    {
                      image: b.barcodeImage,
                      width: 120,
                      alignment: 'center',
                      margin: [0, 4, 0, 0]
                    },

                    // ── Barcode Text ──
                    {
                      text: b.barcode,
                      fontSize: 6,
                      alignment: 'center',
                      margin: [0, 1, 0, 0],
                      color: '#1e293b'
                    },
                  // ── Divider ──
                  {
                    canvas: [{
                      type: 'rect',
                      x: 0, y: 0,
                      w: 130, h: 0.5,
                      color: '#000'
                    }],
                    margin: [0, 2, 0, 0]
                  }
                ],
                margin: [2, 2, 2, 2]
              }
            : { text: '' }
          )
        ]
      },
      layout: {
        hLineWidth:    (i: number) => i === 0 || i === 1 ? 0.5 : 0,
        vLineWidth:    (i: number) => 0.5,
        hLineColor:    () => '#cbd5e1',
        vLineColor:    () => '#cbd5e1',
        paddingTop:    () => 4,
        paddingBottom: () => 4,
        paddingLeft:   () => 4,
        paddingRight:  () => 4
      },
      margin: [0, 0, 0, 0]
    });
  }

  const docDefinition: any = {
    pageSize:        'A4',
    pageMargins:     [10, 10, 10, 10],
    pageOrientation: 'portrait',

    content: content,

    styles: {
      ticketCompany:   { fontSize: 6.5, bold: true,  color: '#1e293b' },
      ticketField:     { fontSize: 6.5, color: '#475569' },
      ticketStyle:     { fontSize: 8,   bold: true,  color: '#1e293b' },
      ticketSize:      { fontSize: 22,  bold: true,  color: '#1e293b' },
      ticketNumbering: { fontSize: 10,  bold: true,  color: '#1e293b' },
      ticketLabel:     { fontSize: 7,   color: '#64748b' },
      ticketPcs:       { fontSize: 14,  bold: true,  color: '#16a34a' },
      ticketBundleNo:  { fontSize: 10,  bold: true,  color: '#1e293b', alignment: 'right' },
      ticketSmall:     { fontSize: 6,   color: '#64748b' },
      ticketBarcode:   { fontSize: 7,
    font: 'Roboto',
    bold: true,
    characterSpacing: 1,
    color: '#1e293b' }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}

generateBarcode(value: string): string {

  const canvas = document.createElement('canvas');

  JsBarcode(canvas, value, {
    format: 'CODE39',      // or CODE128
    displayValue: false,   // true if you want text below barcode
    width: 2,
    height: 50,
    margin: 0
  });

  return canvas.toDataURL('image/png');
}

toggleMenu(event: MouseEvent, row: any): void {
  event.stopPropagation();
  const isOpen = row._menuOpen;
 
  // Close all first
  (this.gridView as any[]).forEach((r: any) => r._menuOpen = false);
 
  if (!isOpen) {
    const btn  = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 215;
 
    // Position below button, right-aligned
    this.menuTop  = rect.bottom + 4;
    this.menuLeft = rect.right - menuWidth;
 
    // If too close to bottom, flip upward
    const estimatedMenuHeight = 320;
    if (rect.bottom + estimatedMenuHeight > window.innerHeight) {
      this.menuTop = rect.top - estimatedMenuHeight - 4;
    }
 
    row._menuOpen = true;
  }
}
 
hasOpenMenu(): boolean {
  return (this.gridView as any[]).some((row: any) => row._menuOpen);
}
 
closeAllMenus(): void {
  (this.gridView as any[]).forEach((row: any) => row._menuOpen = false);
}
}
