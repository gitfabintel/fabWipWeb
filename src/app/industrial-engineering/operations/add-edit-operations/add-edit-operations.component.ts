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
  selector: 'app-add-edit-operations',
  templateUrl: './add-edit-operations.component.html',
  styleUrls: ['./add-edit-operations.component.css']
})
export class AddEditOperationsComponent {

  @Input() statusCheck = 'Add';
  @Input() PId: any;
 
  data: any     = { active: true };
  sectionList:  any[] = [];
  response:     any;
  canUpdate$!:  Observable<boolean>;
 
  constructor(
    public  activeModal: NgbActiveModal,
    private http:        HttpClient,
    private spinner:     NgxSpinnerService,
    private toastr:      ToastrService,
    private store:       Store,
  ) {}
 
  ngOnInit(): void {
    this.canUpdate$ = this.store
      .select(selectPermissionByMenu('IE Operations'))
      .pipe(map((p: any) => p?.canUpdate ?? false));
 
    this.getSections();
 
    if (this.statusCheck === 'Edit') this.get();
    if (this.statusCheck === 'Add')  this.getCode();
  }
 
  getSections(): void {
    this.http
      .get(`${environment.apiUrl}/api/WageOperationSection/GetWageOperationSectionList`)
      .subscribe((res: any) => {
        if (res.success) this.sectionList = res.data;
      });
  }
 
  getCode(): void {
    this.http
      .get(`${environment.apiUrl}/api/WageOperation/GetNextNumber`)
      .subscribe((res: any) => {
        if (res.success) this.data.code = res.data;
      });
  }
 
  get(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/WageOperation/GetWageOperationById/${this.PId}`)
      .subscribe((res: any) => {
        if (res.success) this.data = res.data;
        else this.toastr.error(res.message, 'Error');
        this.spinner.hide();
      }, () => { this.toastr.error('Failed to load.', 'Error'); this.spinner.hide(); });
  }
 
  save(): void {
    const payload = {
      name:      this.data.name,
      code:      this.data.code,
      sectionId: this.data.sectionId,
      active:    this.data.active,
    };
 
    this.spinner.show();
 
    const req = this.statusCheck === 'Add'
      ? this.http.post(`${environment.apiUrl}/api/WageOperation/AddWageOperation`, payload)
      : this.http.put(`${environment.apiUrl}/api/WageOperation/UpdateWageOperation/${this.PId}`, payload);
 
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
