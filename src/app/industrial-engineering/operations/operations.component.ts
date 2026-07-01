import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { environment } from 'src/environments/environment';
import { AddEditOperationsComponent } from './add-edit-operations/add-edit-operations.component';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {

  gridView:  any[] = [];
  gridData:  any[] = [];
  loadingIndicator = true;

  canAdd$!:    Observable<boolean>;
  canDelete$!: Observable<boolean>;

  constructor(
    private http:         HttpClient,
    private modalService: NgbModal,
    private toastr:       ToastrService,
    private store:        Store,
  ) {}

  ngOnInit(): void {
    const perm$ = this.store.select(selectPermissionByMenu('IE Operations'));
    this.canAdd$    = perm$.pipe(map((p: any) => p?.canAdd    ?? false));
    this.canDelete$ = perm$.pipe(map((p: any) => p?.canDelete ?? false));
    this.get();
  }

  get(): void {
    this.loadingIndicator = true;
    this.http
      .get(`${environment.apiUrl}/api/WageOperation/GetWageOperationList`)
      .subscribe((res: any) => {
        if (res.success) {
          this.gridView = res.data;
          this.gridData = [...res.data];
        } else {
          this.toastr.error(res.message, 'Error');
        }
        this.loadingIndicator = false;
      }, () => {
        this.toastr.error('Failed to load operations.', 'Error');
        this.loadingIndicator = false;
      });
  }

  onFilterField(value: string): void {
    const q = (value || '').toLowerCase();
    this.gridView = this.gridData.filter((d: any) =>
      !q ||
      (d.name        && d.name.toLowerCase().includes(q))        ||
      (d.code        && d.code.toLowerCase().includes(q))        ||
      (d.sectionName && d.sectionName.toLowerCase().includes(q))
    );
  }

  add(): void {
    const modalRef = this.modalService.open(AddEditOperationsComponent, {
      centered: true,
      size: 'lg slide-from-left',
    });
    modalRef.componentInstance.statusCheck = 'Add';
    modalRef.result.then(
      result => { if (result) this.get(); },
      () => {}
    );
  }

  edit(data: any): void {
    const modalRef = this.modalService.open(AddEditOperationsComponent, {
      centered: true,
      size: 'lg slide-from-left',
    });
    modalRef.componentInstance.statusCheck = 'Edit';
    modalRef.componentInstance.PId = data.id;
    modalRef.result.then(
      result => { if (result) this.get(); },
      () => {}
    );
  }

  onDelete(row: any): void {
    if (!confirm(`Delete operation "${row.name}"?`)) return;
    this.http
      .delete(`${environment.apiUrl}/api/WageOperation/DeleteWageOperation/${row.id}`)
      .subscribe((res: any) => {
        if (res.success) { this.toastr.success(res.message); this.get(); }
        else this.toastr.error(res.message, 'Error');
      }, () => this.toastr.error('Failed to delete.', 'Error'));
  }
}