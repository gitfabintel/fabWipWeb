import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { ServiceService } from 'src/app/shared/service.service';
import { Dateformater } from 'src/app/shared/dateformater';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-edit-style-bulletin',
  templateUrl: './add-edit-style-bulletin.component.html',
  styleUrls: ['./add-edit-style-bulletin.component.css']
})
export class AddEditStyleBulletinComponent implements OnInit {

  statusCheck = 'Add';
  PId: any;

  data: any      = {};
  sections: any[] = [];

  customers:      any[] = [];
  articles:       any[] = [];
  styles:         any[] = [];
  sectionsMaster: any[] = [];
  operationsMaster: any[] = [];
  machines:       any[] = [];

  canUpdate$!: Observable<boolean>;
  dateformater = new Dateformater();

  constructor(
    private http:    HttpClient,
    private router:  Router,
    private route:   ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr:  ToastrService,
    private service: ServiceService,
    private store:   Store,
  ) {}

  ngOnInit(): void {
    this.canUpdate$ = this.store
      .select(selectPermissionByMenu('IE Style Bulletin'))
      .pipe(map((p: any) => p?.canUpdate ?? false));

    this.statusCheck = this.route.snapshot.queryParamMap.get('statusCheck') || 'Add';

    this.service.GetCustomer().subscribe((res: any) => {
      if (res.success) this.customers = res.data;
    });

    if (this.statusCheck === 'Edit') {
      this.PId = this.route.snapshot.queryParamMap.get('PId');
      forkJoin([
        this.http.get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`),
        this.http.get(`${environment.apiUrl}/api/WageOperation/GetWageOperationList`),
        this.http.get(`${environment.apiUrl}/api/WageMachice/GetWageMachiceList`),
      ]).subscribe(([sec, ops, mac]: any) => {
        this.sectionsMaster   = sec.data;
        this.operationsMaster = ops.data;
        this.machines         = mac.data;
        this.get();
      });
    }

    if (this.statusCheck === 'Add') {
      this.getCode();
      this.loadMasterData();
      this.data.effectiveFrom = new Date().toISOString().substring(0, 10);
    }
  }

  loadMasterData(): void {
    forkJoin([
      this.http.get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`),
      this.http.get(`${environment.apiUrl}/api/WageOperation/GetWageOperationList`),
      this.http.get(`${environment.apiUrl}/api/WageMachice/GetWageMachiceList`),
    ]).subscribe(([sec, ops, mac]: any) => {
      this.sectionsMaster   = sec.data;
      this.operationsMaster = ops.data;
      this.machines         = mac.data;
    });
  }

  getCode(): void {
    this.http.get(`${environment.apiUrl}/api/WageStyleOperation/GetNextNumber`)
      .subscribe((res: any) => { if (res.success) this.data.code = res.data; });
  }

  get(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/WageStyleOperation/GetWageStyleOperationById/${this.PId}`)
      .subscribe((res: any) => {
        if (res.success) {
          this.data = res.data;
          this.data.effectiveFrom = this.dateformater.fromModel(this.data.effectiveFrom);
          this.mapToSections(this.data.details || []);
          this.GetArticlesList();
          this.GetStylesList();
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.spinner.hide();
      }, () => { this.toastr.error('Failed to load.', 'Error'); this.spinner.hide(); });
  }

  mapToSections(details: any[]): void {
    const grouped: any = {};
    details.forEach((d: any) => {
      if (!grouped[d.sectionId]) grouped[d.sectionId] = [];
      grouped[d.sectionId].push(d);
    });
    this.sections = Object.keys(grouped).map(sectionId => {
      const section: any = {
        sectionId: +sectionId,
        operations: [],
        filteredOperations: this.operationsMaster.filter((x: any) => x.sectionId == +sectionId),
        isCollapsed: false,
      };
      grouped[sectionId].forEach((d: any, i: number) => {
        section.operations.push({
          id:               d.id,
          operationId:      d.operationId,
          machineId:        d.machineId,
          mcSam:            d.mcSam    || 0,
          nonMcSam:         d.nonMcSam || 0,
          sam:              d.sam      || 0,
          rate:             d.rate     || 0,
          cost:             (d.sam || 0) * (d.rate || 0),
          machinesRequired: d.machinesRequired || 0,
          headsAllocated:   d.headsAllocated   || 0,
          sequenceNo:       d.sequenceNo ?? (i + 1),
        });
      });
      return section;
    });
  }

  // ── Section helpers ───────────────────────────────────────
  addSection(): void {
    this.sections.push({
      sectionId: null, operations: [], filteredOperations: [], isCollapsed: false
    });
  }

  removeSection(i: number): void { this.sections.splice(i, 1); }

  onSectionChange(section: any): void {
    section.filteredOperations = this.operationsMaster
      .filter((x: any) => x.sectionId == section.sectionId);
  }

  addRow(section: any): void {
    section.operations.push({
      operationId: null, machineId: null,
      mcSam: 0, nonMcSam: 0, sam: 0, rate: 0, cost: 0,
      machinesRequired: 0, headsAllocated: 0,
      sequenceNo: section.operations.length + 1,
    });
  }

  removeRow(section: any, i: number): void { section.operations.splice(i, 1); }

  calcRow(row: any): void {
    row.sam  = parseFloat(((row.mcSam || 0) + (row.nonMcSam || 0)).toFixed(4));
    row.cost = parseFloat(((row.sam  || 0) * (row.rate     || 0)).toFixed(4));
  }

  getCapacity(row: any): number {
    return row.sam > 0 ? (480 * 0.85) / row.sam : 0;
  }

  // ── Section totals ────────────────────────────────────────
  getSectionSAM(sec: any):      number { return sec.operations.reduce((s: number, o: any) => s + (o.sam  || 0), 0); }
  getSectionRate(sec: any):     number { return sec.operations.reduce((s: number, o: any) => s + (o.rate || 0), 0); }
  getSectionCost(sec: any):     number { return sec.operations.reduce((s: number, o: any) => s + (o.cost || 0), 0); }
  getSectionMachines(sec: any): number { return sec.operations.reduce((s: number, o: any) => s + (o.machinesRequired || 0), 0); }
  getSectionHeads(sec: any):    number { return sec.operations.reduce((s: number, o: any) => s + (o.headsAllocated   || 0), 0); }

  getGrandTotalSAM():  number { return this.sections.reduce((s, sec) => s + this.getSectionSAM(sec),  0); }
  getGrandTotalRate(): number { return this.sections.reduce((s, sec) => s + this.getSectionRate(sec), 0); }
  getGrandTotalCost(): number { return this.sections.reduce((s, sec) => s + this.getSectionCost(sec), 0); }
  getTotalOps():       number { return this.sections.reduce((s, sec) => s + sec.operations.length,    0); }

  // ── Lookups ───────────────────────────────────────────────
  GetArticlesList(): void {
    this.service.GetCustomerArticle(this.data.customerId)
      .subscribe((res: any) => { if (res.success) { this.articles = res.data; if (this.statusCheck === 'Edit') this.GetStylesList(); } });
  }

  GetStylesList(): void {
    this.service.GetCustomerStyle(this.data.articleId)
      .subscribe((res: any) => { if (res.success) this.styles = res.data; });
  }

  // ── Build payload ─────────────────────────────────────────
  buildPayload(): any {
    const isEdit = this.statusCheck === 'Edit';
    return {
      customerId:   this.data.customerId,
      articleId:    this.data.articleId,
      styleId:      this.data.styleId,
      versionNo:    this.data.versionNo,
      effectiveFrom: this.dateformater.toModel(this.data.effectiveFrom),
      code:         this.data.code,
      details: this.sections.flatMap(sec =>
        sec.operations.map((op: any) => ({
          id:               isEdit ? (op.id || 0) : 0,
          sectionId:        sec.sectionId,
          operationId:      op.operationId,
          machineId:        op.machineId,
          mcSam:            op.mcSam    || 0,
          nonMcSam:         op.nonMcSam || 0,
          sam:              op.sam      || 0,
          rate:             op.rate     || 0,
          machinesRequired: op.machinesRequired || 0,
          headsAllocated:   op.headsAllocated   || 0,
          sequenceNo:       op.sequenceNo,
        }))
      )
    };
  }

  save(): void {
    this.spinner.show();
    const req = this.statusCheck === 'Add'
      ? this.http.post(`${environment.apiUrl}/api/WageStyleOperation/AddWageStyleOperation`, this.buildPayload())
      : this.http.put(`${environment.apiUrl}/api/WageStyleOperation/UpdateWageStyleOperation/${this.PId}`, this.buildPayload());

    req.subscribe((res: any) => {
      if (res.success) {
        this.toastr.success(res.message);
        this.cancel();
      } else {
        this.toastr.error(res.message, 'Error');
      }
      this.spinner.hide();
    }, (err: HttpErrorResponse) => {
      this.toastr.error('Failed to save.', 'Error');
      console.error(err);
      this.spinner.hide();
    });
  }

  cancel(): void {
    this.router.navigate(['/industrial-engineering/style-bulletin']);
  }
}