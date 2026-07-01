import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthSystemService } from '../auth/auth.system.service';
import { selectAllPermissions } from 'src/app/permission/permission.selectors';

// ─────────────────────────────────────────────────────────────
// Permission menu name  →  dashboard route
// The FIRST matching menu (canRead: true) wins.
// Order matters — put most specific roles at the top.
// Add a new line here whenever you finish a new dashboard.
// ─────────────────────────────────────────────────────────────
const PERMISSION_ROUTES: [string, string][] = [
  ['Wip Dashboard',               '/admin'],
  ['Cutting Dashboard',  '/production-cutting/cutting-dashboard'],
  ['Production Floor',    '/production-floor/dashboard'],
  ['Quality Control',     '/quality-control/dashboard'],
  ['Packing',             '/packing/dashboard'],
  ['Finishing',           '/packing/dashboard'],
  ['Dispatch',            '/dispatch/dashboard'],
];

const DEFAULT_ROUTE = '/admin';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  showPassword = false;
  isLoading    = false;
  errorMessage = '';

  private menuPermissions: any[] = [];

  constructor(
    private router:        Router,
    private fb:            FormBuilder,
    private store:         Store,
    private spinner:       NgxSpinnerService,
    private toastr:        ToastrService,
    private serviceSystem: AuthSystemService,
  ) {
    this.loginForm = this.fb.group({
      loginName: ['', [Validators.required]],
      password:  ['', [Validators.required, Validators.minLength(4)]],
      remember:  [false],
    });
  }

  ngOnInit(): void {
    this.store.select(selectAllPermissions).subscribe(perms => {
      this.menuPermissions = perms;
    });
  }

  get loginName() { return this.loginForm.get('loginName')!; }
  get password()  { return this.loginForm.get('password')!; }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';
    this.spinner.show();

    this.serviceSystem.login({
      loginName: this.loginForm.value.loginName,
      password:  this.loginForm.value.password,
    }).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.isLoading = false;

        if (res?.success === true && res?.data != null) {
          // Permissions are already loaded into the store by AuthSystemService.
          // Re-read them now (they're populated after login response).
          this.store.select(selectAllPermissions).subscribe(perms => {
            this.menuPermissions = perms;
            const route = this.resolveFromPermissions();
            this.router.navigate([route]);
          }).unsubscribe();          // one-shot read, no leak
        } else {
          this.errorMessage = res?.message ?? 'Login failed. Please try again.';
          this.toastr.error(res?.message, 'Login failed');
        }
      },
      error: () => {
        this.spinner.hide();
        this.isLoading    = false;
        this.errorMessage = 'Unable to connect. Please try again.';
        this.toastr.error('Server error', 'Login failed');
      },
    });
  }

  // Walk PERMISSION_ROUTES in order — first menu the user can read wins
  private resolveFromPermissions(): string {
    for (const [menuName, route] of PERMISSION_ROUTES) {
      if (this.hasMenu(menuName)) {
        return route;
      }
    }
    return DEFAULT_ROUTE;
  }

  // Recursive search through menu tree (handles subManu nesting)
  hasMenu(menuName: string): boolean {
    const search = (menus: any[]): boolean => {
      for (const menu of menus) {
        if (menu.name?.toLowerCase() === menuName.toLowerCase() && menu.canRead) return true;
        if (menu.subManu?.length && search(menu.subManu)) return true;
      }
      return false;
    };
    return search(this.menuPermissions);
  }
}