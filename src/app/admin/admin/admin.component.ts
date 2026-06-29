import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthSystemService } from 'src/app/shared/auth/auth.system.service';
import { Dateformater } from 'src/app/shared/dateformater';
import { ServiceService } from 'src/app/shared/service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignalRService } from '../../shared/SignalR.service';
import { combineLatest, forkJoin, map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Permission } from 'src/app/permission/permission.model';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  // ── Chart canvas refs ─────────────────────────────────────
  @ViewChild('dshDonut') dshDonut!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dshBar')   dshBar!:   ElementRef<HTMLCanvasElement>;

  private donutChart?: Chart;
  private barChart?:   Chart;

  // ── Legacy fields (kept as-is) ────────────────────────────
  gridView: any = [];
  gridData: any[] = [];
  dataBom: any;
  historyBom: any = [];
  loadingIndicator = true;
  Count: any;
  response: any;
  data: any;
  Url = '/api/Report/GetTop10Jobs';
  dateformater: Dateformater = new Dateformater();
  searchText = '';
  selectedStatus = '';
  selectedType = '';
  role: any;
  filteredData: any = [];
  activities: any[] = [];
  listprsFilter: any = [];
  jobSummaries: any = [];
  pRCanSignOff$!: Observable<boolean>;
  pRCanCheck$!:   Observable<boolean>;
  pRCanView$!:    Observable<boolean>;
  newdata: any;

  // ── Pipeline ──────────────────────────────────────────────
  loading    = false;
  stages:    any[] = [];
  orders:    any[] = [];
  drilldownOrder:   any = null;
  drilldownBundles: any[] = [];
  drilldownFilter:  number | null = null;
  STALL_PCT_THRESHOLD = 60;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private serviceSystem: AuthSystemService,
    private service: ServiceService,
    public signalRService: SignalRService,
    private store: Store,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
  ) {
    this.signalRService.eventCallback$.subscribe(value => {
      this.newdata = value;
      if (this.newdata && this.newdata.length > 0) {}
      console.log(value);
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }

  // ── Load ──────────────────────────────────────────────────
  load(): void {
    this.loading = true;
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetProductionDashboard`)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.stages = res.data.stages || [];
            this.orders = res.data.orders || [];
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.loading = false;
          this.spinner.hide();
          this.cdr.markForCheck();
          setTimeout(() => this.buildCharts(), 0);
        },
        error: () => {
          this.toastr.error('Error loading dashboard.', 'Error');
          this.loading = false;
          this.spinner.hide();
        }
      });
  }

  // ── Summary totals ────────────────────────────────────────
  get totalBundlesAllOrders(): number {
    return this.orders.reduce((s, o) => s + (o.totalBundles || 0), 0);
  }

  get totalPcsAllOrders(): number {
    return this.orders.reduce((s, o) => s + (o.totalPcs || 0), 0);
  }

  get stalledCount(): number {
    return this.orders.filter(o => this.orderHasStall(o)).length;
  }

  get stalledOrders(): any[] {
    return this.orders.filter(o => this.orderHasStall(o));
  }

  // ── Stall helpers ─────────────────────────────────────────
  orderHasStall(order: any): boolean {
    if (!order.stageBreakdown) return false;
    return order.stageBreakdown.some((seg: any, idx: number) =>
      idx < order.stageBreakdown.length - 1 &&
      seg.pct >= this.STALL_PCT_THRESHOLD
    );
  }

  isStalled(seg: any, order: any): boolean {
    const isLast = order.stageBreakdown[order.stageBreakdown.length - 1]?.id === seg.id;
    return !isLast && seg.pct >= this.STALL_PCT_THRESHOLD;
  }

  getStalledStage(order: any): string {
    const seg = (order.stageBreakdown || [])
      .slice(0, -1)
      .find((s: any) => s.pct >= this.STALL_PCT_THRESHOLD);
    return seg?.stageName || '';
  }

  getStalledPct(order: any): number {
    const seg = (order.stageBreakdown || [])
      .slice(0, -1)
      .find((s: any) => s.pct >= this.STALL_PCT_THRESHOLD);
    return seg?.pct || 0;
  }

  // ── Conveyor ──────────────────────────────────────────────
  getSegmentWeight(seg: any, order: any): number {
    if (seg.bundleCount === 0) return 0.3;
    return Math.max(seg.pct, 4);
  }

  getTopSegments(order: any): any[] {
    return (order.stageBreakdown || [])
      .filter((s: any) => s.bundleCount > 0)
      .sort((a: any, b: any) => b.pcsCount - a.pcsCount)
      .slice(0, 2);
  }

  // ── Stage distribution ────────────────────────────────────
  getStagePct(stageId: number): number {
    const total = this.totalPcsAllOrders;
    if (!total) return 0;
    const pcs = this.orders.reduce((sum, o) => {
      const seg = (o.stageBreakdown || []).find((s: any) => s.id === stageId);
      return sum + (seg?.pcsCount || 0);
    }, 0);
    return Math.round(pcs / total * 100);
  }

  getStageBundles(stageId: number): number {
    return this.orders.reduce((sum, o) => {
      const seg = (o.stageBreakdown || []).find((s: any) => s.id === stageId);
      return sum + (seg?.bundleCount || 0);
    }, 0);
  }

  // ── Drilldown ─────────────────────────────────────────────
  openDrilldown(order: any): void {
    this.drilldownOrder  = order;
    this.drilldownFilter = null;
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetOrderBundleDrilldown/${order.id}`)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.drilldownBundles = res.data.bundles || [];
          } else {
            this.toastr.error(res.message, 'Error');
          }
          this.spinner.hide();
        },
        error: () => {
          this.toastr.error('Error loading bundle detail.', 'Error');
          this.spinner.hide();
        }
      });
  }

  closeDrilldown(): void {
    this.drilldownOrder   = null;
    this.drilldownBundles = [];
    this.drilldownFilter  = null;
  }

  setDrilldownFilter(stageId: number | null): void {
    this.drilldownFilter = stageId;
  }

  getStageCount(stageId: number): number {
    return this.drilldownBundles.filter(b => b.currentStageId === stageId).length;
  }

  get filteredDrilldownBundles(): any[] {
    if (this.drilldownFilter === null) return this.drilldownBundles;
    return this.drilldownBundles.filter(b => b.currentStageId === this.drilldownFilter);
  }

  back(): void {
    this.router.navigate(['/production-cutting/cutting-master']);
  }

  // ── Charts ────────────────────────────────────────────────
  private buildCharts(): void {
    this.buildDonut();
    this.buildBar();
  }

  private buildDonut(): void {
    if (!this.dshDonut?.nativeElement || !this.stages.length) return;
    this.donutChart?.destroy();
    this.donutChart = new Chart(this.dshDonut.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.stages.map(s => s.stageName),
        datasets: [{
          data:            this.stages.map(s => this.getStagePct(s.id)),
          backgroundColor: this.stages.map(s => s.color),
          borderWidth: 0,
          hoverOffset: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } },
        },
      },
    });
  }

  private buildBar(): void {
    if (!this.dshBar?.nativeElement) return;
    this.barChart?.destroy();
    this.barChart = new Chart(this.dshBar.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: 'Bundles',
          data: [48, 62, 55, 71, 88, 43, 29],   // replace with real API data when available
          backgroundColor: '#2563eb',
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
          y: { grid: { color: 'rgba(0,0,0,.06)' }, ticks: { color: '#9ca3af', font: { size: 11 } }, border: { display: false } },
        },
      },
    });
  }
}