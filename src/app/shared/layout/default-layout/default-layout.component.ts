import { Component, OnInit,HostListener, OnDestroy, AfterViewInit  } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { clearPermissions } from 'src/app/permission/permission.actions';
import Swal from 'sweetalert2';
declare var $: any;
import { Store } from '@ngrx/store';
import { selectAllPermissions, selectPermissionByMenu } from 'src/app/permission/permission.selectors';
import { filter, Subscription } from 'rxjs';
import { ServiceService } from '../../service.service';
declare const KTToggle: any;
declare const KTDrawer: any;
declare const KTMenu: any;
export interface BreadcrumbItem {
  label: string;
  url?: string;
}
@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
   pageTitle = '';
    
  breadcrumbs: BreadcrumbItem[] = [];
  // ─── Template bindings ────────────────────────────────────────
  username: string = '';
  initial: string = '';
  currentYear: number = new Date().getFullYear();
  isDarkMode: boolean = false;
 currentTheme = 'light';
  isSidebarMinimized = false;
  // ─── Internal ─────────────────────────────────────────────────
  private menuPermissions: any[] = [];
  private routerSub!: Subscription;
  private storeSub!: Subscription;
  constructor(
    private router: Router,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    private service:ServiceService
  ) {}

  ngOnInit(): void {
    // 1. Load permissions from NgRx store
    this.storeSub = this.store.select(selectAllPermissions).subscribe(perms => {
      this.menuPermissions = perms;
    });
    const wasMinimized = localStorage.getItem('aside-minimize') === 'true';
  this.isSidebarMinimized = wasMinimized;
  if (wasMinimized) {
    document.body.classList.add('aside-minimize');
  }
      const saved = this.service.getCurrentTheme();
    this.service.applyTheme(saved);
    this.currentTheme = saved;
 this.updateFromRoute();

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute());
    // 2. Load user info from localStorage
    try {
      const raw = sessionStorage.getItem('name');
      console.log('Raw user data from sessionStorage:', raw);
      if (raw) {
        const user = JSON.parse(raw);
        this.username = user|| 'User';
        this.initial = this.username.charAt(0).toUpperCase();
      }
    } catch {
      this.username = 'User';
      this.initial = 'U';
    }

    // 3. Sync dark mode state from localStorage
    const savedTheme = localStorage.getItem('data-bs-theme');
    this.isDarkMode = savedTheme === 'dark';

    // 4. Re-init Metronic JS after every Angular route change
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.reInitMetronic();
      });

    // 5. Init on first load
    this.reInitMetronic();
    this.currentYear = new Date().getFullYear();
  }

    setTheme(theme: string): void {
    this.service.applyTheme(theme);
    this.currentTheme = theme;
  }
    private reinitMetronic(): void {
    setTimeout(() => {
      if (typeof KTToggle  !== 'undefined') KTToggle.init();
      if (typeof KTDrawer  !== 'undefined') KTDrawer.init();
      if (typeof KTMenu    !== 'undefined') KTMenu.init();
    }, 100);
  }
 private updateFromRoute(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const data = route.snapshot.data;
    this.pageTitle   = data['title']       ?? '';
    this.breadcrumbs = data['breadcrumbs'] ?? [];
  }
  ngAfterViewInit(): void {
    // Reinitialize all Metronic components after Angular renders
    this.reinitMetronic();
  }
  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.storeSub?.unsubscribe();
  }

  // ─── Metronic v8 re-init after route change ───────────────────
private reInitMetronic(): void {
  setTimeout(() => {
    try {
      const w = window as any;
      if (w.KTMenu) w.KTMenu.init();
      if (w.KTDrawer) w.KTDrawer.init();
      if (w.KTScrolltop) w.KTScrolltop.init();
    } catch (e) {}
  }, 150);
}

  // ─── Permission check ─────────────────────────────────────────
  hasMenu(menuName: string): boolean {
    const search = (menus: any[]): boolean => {
      for (const menu of menus) {
        if (menu.name?.toLowerCase() === menuName.toLowerCase() && menu.canRead) {
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

  // ─── Dark / Light theme toggle ────────────────────────────────
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('data-bs-theme', theme);
  }

  // ─── Sign out ─────────────────────────────────────────────────
   signOut(): void {
    Swal.fire({
      title: 'Do you want to logout your session?Kindly confirm',
      showCancelButton: true,
      confirmButtonText: `Yes Log me out`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

        sessionStorage.setItem('STATE', 'false');
        sessionStorage.setItem('ROLE', '');
        sessionStorage.removeItem('token');
        sessionStorage.clear();
        this.store.dispatch(clearPermissions());
    
    // Remove permissions from localStorage
    localStorage.removeItem('permissions');
        this.router.navigate(['']);

      } else if (result.isDenied) {
      }
    });
  }

  // ✅ Angular-controlled sidebar toggle
  toggleSidebar(): void {
    this.isSidebarMinimized = !this.isSidebarMinimized;

  if (this.isSidebarMinimized) {
    document.body.classList.add('aside-minimize');
    localStorage.setItem('aside-minimize', 'true');
  } else {
    document.body.classList.remove('aside-minimize');
    localStorage.removeItem('aside-minimize');
  }
  }

  // ✅ Mobile drawer toggle
  toggleMobileDrawer(): void {
    const aside = document.getElementById('kt_aside');
    if (aside) {
      if (typeof KTDrawer !== 'undefined') {
        const drawer = KTDrawer.getInstance(aside);
        if (drawer) {
          drawer.toggle();
        }
      }
    }
  }



}
