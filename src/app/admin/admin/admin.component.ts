import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthSystemService } from 'src/app/shared/auth/auth.system.service';
import { Dateformater } from 'src/app/shared/dateformater';
import { ServiceService } from 'src/app/shared/service.service';
import { environment } from 'src/environments/environment';
import { orderBy, process } from '@progress/kendo-data-query';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {SignalRService} from '../../shared/SignalR.service'
import jwt_decode from 'jwt-decode';
import { combineLatest, forkJoin, map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Permission } from 'src/app/permission/permission.model';
import { selectPermissionByMenu } from 'src/app/permission/permission.selectors';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
   gridView: any= [];
   gridData: any[] = [];


dataBom:any
historyBom:any=[]



  loadingIndicator = true;
  Count: any;
  response:any

  data:any

  Url = '/api/Report/GetTop10Jobs';
  dateformater: Dateformater = new Dateformater();
searchText = '';
  selectedStatus = '';
  selectedType = '';
role: any;

filteredData :any= [];
activities: any[] = [];
listprsFilter: any = [];
  jobSummaries:any=[]
   pRCanSignOff$!: Observable<boolean>;

  //  canSignOff$!: Observable<boolean>;

    pRCanCheck$!: Observable<boolean>;



   //canview
     pRCanView$!: Observable<boolean>;
   
   newdata:any
 
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
  ) {
       this.signalRService.eventCallback$.subscribe(value => {
         this.newdata =value;
       
        if (this.newdata && this.newdata.length > 0) {
          
           this.loadDashboardDataSi();
        }
        console.log(value); 
    });

    this.pRCanSignOff$ = this.getPermission('PR Dashboard Item', 'signOff');


//can check
  this.pRCanCheck$ = this.getPermission('PR Dashboard Item', 'canCheck');



//can view
  this.pRCanView$ = this.getPermission('PR Dashboard Item', 'canRead');

  }

  ngOnInit(): void {
      this.signalRService.startConnection();
    this.signalRService.addTransferChartDataListener();
     this.role = this.serviceSystem.getRole();
    
    // this.service.fetch((data: any) => {
    //   this.gridView = data;
    //   this.gridData = [...data];
    //   this.loadingIndicator = false;

    //   this.Count = this.gridView.length;
    // }, this.Url);
      this.loadDashboardData();
  }

  loadDashboardData() {



       
}
loadDashboardDataSi(){
   this.orderAlert();

  //  this.getMmc()

    this.getactivity()


}
getInitials(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return parts[0][0].toUpperCase() + ' ' + parts[parts.length - 1][0].toUpperCase();
}

getPermission(menuName: string, key: keyof Permission) {
  return this.store.select(selectPermissionByMenu(menuName)).pipe(
    map(p => p?.[key] ?? false)
  );
}

getactivity(){
  this.service.getActivities().subscribe(data => {
      this.activities = data;
    });
}
  orderAlert(){
    let token = sessionStorage.getItem('Token');
    let tokenInfo = this.getDecodedAccessToken(token || '');

   
let message = "";

if (this.newdata?.[0]?.purchaseReqNumber) {
  message = `📝 New Purchase Requisition Alert: ${this.newdata[0].purchaseReqNumber}`;
} 
else if (this.newdata?.[0]?.pOrderNumber) {
  message = `📦 New Purchase Order Alert: ${this.newdata[0].pOrderNumber}`;
} 
else if (this.newdata?.[0]?.ogpNumber) {
  message = `💰 New OGP Alert: ${this.newdata[0].ogpNumber}`;
} 
else if(this.newdata?.[0]?.rogpNumber){
  message = `💰 New ROGP Alert: ${this.newdata[0].rogpNumber}`;
}
else if(this.newdata?.[0]?.igP_ROGPNumber){
  message = `💰 New IGP_ROGP Alert: ${this.newdata[0].igP_ROGPNumber}`;
}

//  if((tokenInfo.role == 'Admin' || tokenInfo.role == 'C-Level Executive') && this.newdata[0].Status === 'Checked') {
//        this.notifyFunction(message);
//     }
//    else{
//       this.notifyFunction(message);
//     }

this.canUserSignOff().subscribe(canSignOff => {
  if (
    canSignOff &&
    (this.newdata[0].Status === 'Checked' || this.newdata[0].Status === 'Approved')
  ) {
    this.notifyFunction(message);
  }
});
  }

canUserSignOff(): Observable<boolean> {
  return combineLatest([
    this.pRCanSignOff$,

  ]).pipe(
    map(([pr]) => pr)
  );
}
notifyFunction(message:any){
    Swal.fire({
    customClass : {
      title: 'swal2-title'
    },
    toast: true,
    icon: 'info',
    showConfirmButton: false,
    title: message,
    padding: '1em',
    background: 'linear-gradient(to right, #a86008, #ffba56)',
    position:'top-right',
  
    //timer:50000
    
  })
 const audio = new Audio('../../../assets/toast_sound.mp3');
  audio.load();
  audio.play().catch(err => console.error('Audio play failed:', err));
}
  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }



  


  }
 

