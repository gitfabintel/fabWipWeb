import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-scan-cutting',
  templateUrl: './scan-cutting.component.html',
  styleUrls: ['./scan-cutting.component.css']
})
export class ScanCuttingComponent {

  @ViewChild('scanInput') scanInputRef!: ElementRef<HTMLInputElement>;
 
  stages: any[] = [];
  targetStageId: number = 0;
 
  scanValue: string = '';
  scannedCount: number = 0;
 
  lastScanned: any = null;
  lastResult: 'success' | 'error' | null = null;
  lastErrorMessage: string = '';
 
  sessionLog: any[] = [];
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}
 
  ngOnInit(): void {
    this.loadStages();
  }
 
  loadStages(): void {
    this.http
      .get(`${environment.apiUrl}/api/ProductionCutting/GetProductionDashboard`)
      .subscribe((res: any) => {
        if (res.success) {
          this.stages = res.data.stages || [];
          // Default to the second stage (first real "receiving" target — e.g. Stitching)
          if (this.stages.length > 1) {
            this.targetStageId = this.stages[1].id;
          }
        }
        this.focusInput();
      });
  }
 
  selectStage(stageId: number): void {
    this.targetStageId = stageId;
    this.focusInput();
  }
 
  focusInput(): void {
    setTimeout(() => {
      this.scanInputRef?.nativeElement?.focus();
    }, 50);
  }
 
  refocus(): void {
    // Keep the scan field focused at all times — this is a kiosk screen
    this.focusInput();
  }
 
  processScan(): void {
    const barcode = this.scanValue.trim();
    if (!barcode) return;
 
    if (!this.targetStageId) {
      this.toastr.warning('Select a target stage first.', 'Warning');
      this.scanValue = '';
      return;
    }
 
    const payload = {
      barcode: barcode,
      toStageId: this.targetStageId
    };
 
    this.http
      .post(`${environment.apiUrl}/api/ProductionCutting/ScanMoveBundle`, payload)
      .subscribe(
        (res: any) => {
          const now = new Date();
          const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
 
          if (res.success) {
            this.lastResult   = 'success';
            this.lastScanned  = res.data;
            this.scannedCount++;
 
            this.sessionLog.unshift({
              time,
              bundleNo: res.data.bundleNo,
              detail: `${res.data.sizeName} → ${res.data.toStage}`,
              success: true
            });
          } else {
            this.lastResult       = 'error';
            this.lastErrorMessage = res.message;
 
            this.sessionLog.unshift({
              time,
              bundleNo: null,
              detail: res.message,
              success: false
            });
          }
 
          if (this.sessionLog.length > 12) {
            this.sessionLog = this.sessionLog.slice(0, 12);
          }
 
          this.scanValue = '';
          this.focusInput();
        },
        () => {
          this.lastResult       = 'error';
          this.lastErrorMessage = 'Connection error. Please try again.';
          this.scanValue = '';
          this.focusInput();
        }
      );
  }
 
  back(): void {
    this.router.navigate(['/production-cutting/cutting-master']);
  }
}
