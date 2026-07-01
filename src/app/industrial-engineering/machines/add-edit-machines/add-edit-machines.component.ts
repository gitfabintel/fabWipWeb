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
  selector: 'app-add-edit-machines',
  templateUrl: './add-edit-machines.component.html',
  styleUrls: ['./add-edit-machines.component.css']
})
export class AddEditMachinesComponent {

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
      .select(selectPermissionByMenu('IE Machines'))
      .pipe(map((p: any) => p?.canUpdate ?? false));
 
    if (this.statusCheck === 'Edit') this.get();
  }
 
  get(): void {
    this.spinner.show();
    this.http
      .get(`${environment.apiUrl}/api/WageMachice/GetWageMachiceById/${this.PId}`)
      .subscribe((res: any) => {
        if (res.success) this.data = res.data;
        else this.toastr.error(res.message, 'Error');
        this.spinner.hide();
      }, () => { this.toastr.error('Failed to load.', 'Error'); this.spinner.hide(); });
  }
 
  save(): void {
    const payload = {
      name:   this.data.name,
      type:   this.data.type,
      active: this.data.active,
    };
 
    this.spinner.show();
 
    const req = this.statusCheck === 'Add'
      ? this.http.post(`${environment.apiUrl}/api/WageMachice/AddWageMachice`, payload)
      : this.http.put(`${environment.apiUrl}/api/WageMachice/UpdateWageMachice/${this.PId}`, payload);
 
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
