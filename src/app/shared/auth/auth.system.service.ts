import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { EncDecService } from './enc-dec.service';
import jwt_decode from 'jwt-decode';
import { Store } from '@ngrx/store';
import { setPermissions } from 'src/app/permission/permission.actions';
import { selectAllPermissions } from 'src/app/permission/permission.selectors';
@Injectable({
  providedIn: 'root',
})
export class AuthSystemService {
  isLogin = false;
  roleAs: any;
  isPaid: boolean = false;
  response: any;
  tokenforsave: any;
  tokeninfo: any;
  private currentUserRole: string | null = null;
  constructor(
    private router: Router,
    private http: HttpClient,
    private EncrDecr: EncDecService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private store: Store
  ) {}

  login(data: any) {
    this.spinner.show();

    return this.http.post(`${environment.apiUrl}/api/Auth/Login`, data).pipe(
      map((res: any) => {
        this.response = res;

        if (this.response.success == true && this.response.data != null) {
         console.log(this.response.data);

          // Token Decrypted data
          this.tokenforsave = this.response.data.token;
          this.tokeninfo = this.getDecodedAccessToken(this.response.data.token);
          // Token Decrypted data

          if (this.response.success && this.response.data?.objMenu) {
            this.store.dispatch(setPermissions({ permissions: this.response.data.objMenu.result.data[0].data }));
          }
          this.store.select(selectAllPermissions).subscribe((permissions) => {
            sessionStorage.setItem('permissions', JSON.stringify(permissions));
          });
          this.isLogin = true;
          this.roleAs = this.response.data;
          sessionStorage.setItem('name', this.response.data.loggedInUserName);
          sessionStorage.setItem('STATE', 'true');
          var Admin = this.EncrDecr.set('123456$#@$^@1ERF', this.response.data.role[0]);
            sessionStorage.setItem('ROLE', Admin);
            

          sessionStorage.setItem('Token', this.response.data.token);
          localStorage.setItem('token', this.response.data.token);
          this.spinner.hide();
          return this.response;
        } else {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
          return this.response;
        }
      }),
      // Handle error using catchError operator
      catchError((err) => {
        if (err.status == 400) {
          this.toastr.error(this.response.message, 'Message.');
          this.spinner.hide();
          return throwError(this.response.message);
        }
        return throwError(err);
      })
    );
  }


  signup(data: any) {
    this.spinner.show();
    return this.http.post(`${environment.apiUrl}/api/Users/AddUser`, data);
    this.spinner.hide();
  }
  signOut() {
    this.isLogin = false;
    this.roleAs = '';
    sessionStorage.setItem('STATE', 'false');
    sessionStorage.setItem('ROLE', '');
    sessionStorage.removeItem('token');
    this.router.navigate(['']);
    sessionStorage.clear();
    localStorage.clear();
  }

  isLoggedIn() {
    const loggedIn = sessionStorage.getItem('STATE');
    if (loggedIn == 'true') this.isLogin = true;
    else this.isLogin = false;
    return this.isLogin;
    //return true;
  }

  getRole() {
    var decrypted = this.EncrDecr.get(
      '123456$#@$^@1ERF',
      sessionStorage.getItem('ROLE')
    );
    this.roleAs = decrypted;

    return this.roleAs;
    //return 'Admin';
  }
  getPaidCheck() {
    // var decrypted = this.EncrDecr.get('123456$#@$^@1ERF', sessionStorage.getItem('ROLE'));
    // this.roleAs = decrypted;

    return this.isPaid;
  }
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }
}
