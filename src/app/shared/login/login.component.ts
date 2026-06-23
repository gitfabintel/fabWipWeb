import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSystemService } from '../auth/auth.system.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectAllPermissions, selectPermissionByMenu } from 'src/app/permission/permission.selectors';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  data: any = {};
  response: any;
  isPasswordVisible = false;
 menuPermissions: any[] = [];
  constructor(
    private router: Router,
    // private authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private serviceSystem: AuthSystemService,
    private store: Store
  ) {}
  ngOnInit(): void {}

  onSubmit() {
    this.spinner.show();
    this.serviceSystem.login(this.data).subscribe((res) => {
      this.response = res;

      if ( this.response.success == true &&this.response.data != null ) {
       this.store.select(selectAllPermissions).subscribe((perms) => {
            this.menuPermissions = perms;
          });
        if (this.hasMenu('Dashboard ERP')) {
          this.router.navigate(['/admin']);
        } else if (this.hasMenu('Dashboard Accounts')) {
          this.router.navigate(['/admin/dashboard-acc']);
        } else {
          this.toastr.warning('No dashboard access assigned', 'Message');
        }

        this.spinner.hide();
       } 

       else {
        this.toastr.error(this.response.message, 'Message.');
        this.spinner.hide();
      }
    });
  }
    hasMenu(menuName: string): boolean {
    const search = (menus: any[]): boolean => {
      for (const menu of menus) {
        if (menu.name.toLowerCase() === menuName.toLowerCase() && menu.canRead) {
          return true;
        }
        if (menu.subManu?.length > 0 && search(menu.subManu)) {
          return true;
        }
      }
      return false;
    };
  
    return search(this.menuPermissions);
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  get passwordFieldType(): string {
    return this.isPasswordVisible ? 'text' : 'password';
  }
}
