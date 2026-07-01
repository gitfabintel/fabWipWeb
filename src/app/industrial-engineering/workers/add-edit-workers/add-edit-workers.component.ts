import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-edit-workers',
  templateUrl: './add-edit-workers.component.html',
  styleUrls: ['./add-edit-workers.component.css']
})
export class AddEditWorkersComponent {

  @Input() statusCheck = 'Add';
  @Input() PId: any;
 
  data: any    = { active: true };
  canUpdate$!: Observable<boolean>;
 
  constructor(
    public  activeModal: NgbActiveModal,
    private http:        HttpClient,
    private spinner:     NgxSpinnerService,
    private toastr:      ToastrService,
    private store:       Store,
  ) {}
 
  ngOnInit(): void {
    this.canUpdate$ = this.store
      .select(selectPermissionByMenu('IE Workers'))
      .pipe(map((p: any) => p?.canUpdate ?? false));
 
    if (this.statusCheck === 'Edit') this.get();
    if (this.statusCheck === 'Add')  this.getCode();
  }
 
  getCode(): void {
    this.http
      .get(`${environment.apiUrl}/api/WageWorker/GetNextNumber`)
      .subscribe((res: any) => {
        if (res.success) this.data.code = res.data;
      });
  }
 
  get(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/WageWorker/GetWageWorkerById/${this.PId}`)
      .subscribe((res: any) => {
        if (res.success) this.data = res.data;
        else this.toastr.error(res.message, 'Error');
        this.spinner.hide();
      }, () => { this.toastr.error('Failed to load.', 'Error'); this.spinner.hide(); });
  }
 
  // ── CNIC auto-format: 00000-0000000-0 ────────────────────
  onCnicInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    let v = el.value.replace(/\D/g, '');
    if (v.length > 5)  v = v.slice(0, 5)  + '-' + v.slice(5);
    if (v.length > 13) v = v.slice(0, 13) + '-' + v.slice(13);
    v = v.slice(0, 15);
    el.value  = v;
    this.data.cnic = v;
  }
 
  isValidCnic(): boolean {
    return /^\d{5}-\d{7}-\d{1}$/.test(this.data.cnic || '');
  }
 
  save(): void {
    const payload = {
      name:       this.data.name,
      code:       this.data.code,
      cnic:       this.data.cnic,
      skillLevel: this.data.skillLevel,
      active:     this.data.active,
    };
 
    this.spinner.show();
 
    const req = this.statusCheck === 'Add'
      ? this.http.post(`${environment.apiUrl}/api/WageWorker/AddWageWorker`, payload)
      : this.http.put(`${environment.apiUrl}/api/WageWorker/UpdateWageWorker/${this.PId}`, payload);
 
    req.subscribe((res: any) => {
      if (res.success) {
        this.toastr.success(res.message);
        this.activeModal.close(true);
      } else {
        this.toastr.error(res.message, 'Error');
      }
      this.spinner.hide();
    }, () => { this.toastr.error('Failed to save.', 'Error'); this.spinner.hide(); });
  }
}
