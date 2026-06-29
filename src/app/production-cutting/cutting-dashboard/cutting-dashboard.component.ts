import {
  Component, OnInit, OnDestroy,
  AfterViewInit, ViewChild, ElementRef,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { ServiceService } from 'src/app/shared/service.service';
import {
  CuttingDashboardData,
  CuttingDashboardSummary,
  MarkerEfficiency,
  CutStatusCount,
  CuttingJob,
  WastageByDay,
} from './cutting-dashboard';

Chart.register(...registerables);

@Component({
  selector: 'app-cutting-dashboard',
  templateUrl: './cutting-dashboard.component.html',
  styleUrls: ['./cutting-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuttingDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('donutCanvas')  donutCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('effCanvas')    effCanvas!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('wastageCanvas') wastageCanvas!: ElementRef<HTMLCanvasElement>;

  // ─── State ────────────────────────────────────────────────
  loading = true;
  today   = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' });
  error   = '';

  summary:            CuttingDashboardSummary | null = null;
  markerEfficiencies: MarkerEfficiency[] = [];
  cutStatus:          CutStatusCount | null = null;
  recentJobs:         CuttingJob[] = [];
  wastageByDay:       WastageByDay[] = [];

  // ─── Table ────────────────────────────────────────────────
  jobSearch   = '';
  statusFilter: string = 'All';
  sortCol     = 'jobNo';
  sortAsc     = true;

  readonly statusOptions = ['All', 'Approved', 'Checked', 'Draft', 'Overdue'];

  // ─── Charts ───────────────────────────────────────────────
  private donutChart?:   Chart;
  private effChart?:     Chart;
  private wastageChart?: Chart;

  private destroy$ = new Subject<void>();

  constructor(
    private svc: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    // Charts built after data loads — see buildCharts()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.donutChart?.destroy();
    this.effChart?.destroy();
    this.wastageChart?.destroy();
  }

  // ─── Load data ────────────────────────────────────────────
  load(): void {
    this.loading = true;
    this.error   = '';

    this.svc.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: CuttingDashboardData) => {
          this.summary            = data.summary;
          this.markerEfficiencies = data.markerEfficiencies;
          this.cutStatus          = data.cutStatus;
          this.recentJobs         = data.recentJobs;
          this.wastageByDay       = data.wastageByDay;
          this.loading            = false;
          this.cdr.markForCheck();
          // Build charts after view updated
          setTimeout(() => this.buildCharts(), 0);
        },
        error: (err) => {
          this.error   = 'Failed to load dashboard. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  refresh(): void { this.load(); }

  // ─── Charts ───────────────────────────────────────────────
  private buildCharts(): void {
    this.buildDonut();
    this.buildEfficiency();
    this.buildWastage();
  }

  private buildDonut(): void {
    if (!this.donutCanvas || !this.cutStatus) return;
    this.donutChart?.destroy();
    const { approved, checked, draft, overdue } = this.cutStatus;
    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Checked', 'Draft', 'Overdue'],
        datasets: [{
          data: [approved, checked, draft, overdue],
          backgroundColor: ['#16a34a', '#2563eb', '#9ca3af', '#dc2626'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} jobs`,
            },
          },
        },
      },
    });
  }

  private buildEfficiency(): void {
    if (!this.effCanvas || !this.markerEfficiencies.length) return;
    this.effChart?.destroy();
    const labels = this.markerEfficiencies.map(m => m.styleNo);
    const data   = this.markerEfficiencies.map(m => m.efficiency);
    const colors = data.map(v => v >= 85 ? '#2563eb' : v >= 78 ? '#d97706' : '#dc2626');

    this.effChart = new Chart(this.effCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Marker efficiency %',
          data,
          backgroundColor: colors,
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            min: 60, max: 100,
            grid: { color: 'rgba(0,0,0,.06)' },
            ticks: { callback: v => v + '%', font: { size: 11 } },
          },
        },
      },
    });
  }

  private buildWastage(): void {
    if (!this.wastageCanvas || !this.wastageByDay.length) return;
    this.wastageChart?.destroy();
    this.wastageChart = new Chart(this.wastageCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.wastageByDay.map(w => w.date),
        datasets: [{
          label: 'Wastage %',
          data: this.wastageByDay.map(w => w.wastage),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            min: 0,
            grid: { color: 'rgba(0,0,0,.06)' },
            ticks: { callback: v => v + '%', font: { size: 11 } },
          },
        },
      },
    });
  }

  // ─── Table helpers ────────────────────────────────────────
  get filteredJobs(): CuttingJob[] {
    let jobs = this.recentJobs;

    if (this.statusFilter !== 'All') {
      jobs = jobs.filter(j => j.status === this.statusFilter);
    }

    if (this.jobSearch.trim()) {
      const q = this.jobSearch.toLowerCase();
      jobs = jobs.filter(j =>
        j.jobNo.toLowerCase().includes(q) ||
        j.styleNo.toLowerCase().includes(q)
      );
    }

    return [...jobs].sort((a, b) => {
      const av = (a as any)[this.sortCol];
      const bv = (b as any)[this.sortCol];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return this.sortAsc ? cmp : -cmp;
    });
  }

  sortBy(col: string): void {
    this.sortAsc = this.sortCol === col ? !this.sortAsc : true;
    this.sortCol = col;
  }

  sortIcon(col: string): string {
    if (this.sortCol !== col) return 'ti-selector';
    return this.sortAsc ? 'ti-sort-ascending' : 'ti-sort-descending';
  }

  // ─── Helpers ──────────────────────────────────────────────
  effColor(v: number): string {
    return v >= 85 ? 'badge-green' : v >= 78 ? 'badge-amber' : 'badge-red';
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      Approved: 'badge-green',
      Checked:  'badge-blue',
      Draft:    'badge-gray',
      Overdue:  'badge-red',
    };
    return map[s] ?? 'badge-gray';
  }

  sign(n: number): string { return n >= 0 ? '+' + n : String(n); }

  donutTotal(): number {
    if (!this.cutStatus) return 0;
    const { approved, checked, draft, overdue } = this.cutStatus;
    return approved + checked + draft + overdue;
  }
}