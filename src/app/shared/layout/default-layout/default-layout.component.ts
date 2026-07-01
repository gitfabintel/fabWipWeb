import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { clearPermissions } from 'src/app/permission/permission.actions';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { selectAllPermissions } from 'src/app/permission/permission.selectors';
import { filter, Subscription } from 'rxjs';
import { ServiceService } from '../../service.service';
import jwt_decode from 'jwt-decode';
export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface NavSubItem {
  label: string;
  route: string;
  permission?: string;
}

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  permission?: string;
  children?: NavSubItem[];
  expanded?: boolean;
}

export interface NavGroup {
  label: string;
  permission?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit, OnDestroy {

  pageTitle        = '';
  breadcrumbs: BreadcrumbItem[] = [];
  currentPageLabel = 'Dashboard';
  username         = '';
  initial          = '';
  role          = '';
  currentYear      = new Date().getFullYear();
  sidebarCollapsed = false;
  darkMode         = false;
  userMenuOpen     = false;
tokeninfo:any
  navGroups: NavGroup[] = [
    {
      label: '',
      items: [
        {
          label: 'Dashboard',
          icon: 'ti-layout-dashboard',
          route: '/admin',
          permission: 'Wip Dashboard',
        },
      ],
    },

    // ── PRODUCTION CUTTING ──────────────────────────────────────
    {
      label: 'Production Cutting',
      permission: 'Cutting Master',
      items: [
        {
          label: 'Cutting',
          icon: 'ti-cut',
          permission: 'Cutting Master',
          children: [
            { label: 'Dashboard',     route: '/production-cutting/cutting-dashboard', permission: 'Cutting Dashboard' },
            { label: 'Cutting Plans', route: '/production-cutting/cutting-master',    permission: 'Cutting Marker Planning' },
            { label: 'Lay Spreading', route: '/production-cutting/lay-spreading-report', permission: 'Lay Spreading' },
            { label: 'Scan Cutting',  route: '/production-cutting/scan-cutting',      permission: 'Scan Cutting' },
          ],
          expanded: false,
        },
      ],
    },

    // ── INDUSTRIAL ENGINEERING ───────────────────────────────────
// ── INDUSTRIAL ENGINEERING ───────────────────────────────────
{
  label: 'Industrial Engineering',
  permission: 'Industrial Engineering',
  items: [
    {
      label: 'IE Setup',
      icon: 'ti-settings-cog',
      permission: 'Industrial Engineering',
      children: [
        { label: 'Sections',   route: '/industrial-engineering/sections',   permission: 'IE Sections'   },
        { label: 'Operations', route: '/industrial-engineering/operations', permission: 'IE Operations' },
        { label: 'Machines',   route: '/industrial-engineering/machines',   permission: 'IE Machines'   },
        { label: 'Workers',    route: '/industrial-engineering/workers',    permission: 'IE Workers'    },
      ],
      expanded: false,
    },
    {
      label: 'Style Bulletin',
      icon: 'ti-file-description',
      route: '/industrial-engineering/style-bulletin',
      permission: 'IE Style Bulletin',
    },
  ],
},

    // ── PRODUCTION FLOOR ─────────────────────────────────────────
    // {
    //   label: 'Production Floor',
    //   permission: 'Production Floor',
    //   items: [
    //     {
    //       label: 'Production Floor', icon: 'ti-robot', permission: 'Production Floor',
    //       children: [
    //         { label: 'Dashboard',  route: '/production-floor/dashboard', permission: 'Production Floor' },
    //         { label: 'Floor Scan', route: '/production-floor/scan',      permission: 'Production Floor' },
    //       ], expanded: false,
    //     },
    //   ],
    // },

    // ── QUALITY CONTROL ───────────────────────────────────────────
    // {
    //   label: 'Quality Control',
    //   permission: 'Quality Control',
    //   items: [
    //     {
    //       label: 'Quality Control', icon: 'ti-clipboard-check', permission: 'Quality Control',
    //       children: [
    //         { label: 'Dashboard',   route: '/quality-control/dashboard',   permission: 'Quality Control' },
    //         { label: 'Inspections', route: '/quality-control/inspections', permission: 'Quality Control' },
    //       ], expanded: false,
    //     },
    //   ],
    // },

    // ── PACKING & FINISHING ───────────────────────────────────────
    // {
    //   label: 'Packing & Finishing',
    //   permission: 'Packing',
    //   items: [
    //     {
    //       label: 'Packing', icon: 'ti-package', permission: 'Packing',
    //       children: [
    //         { label: 'Dashboard',    route: '/packing/dashboard', permission: 'Packing' },
    //         { label: 'Packing List', route: '/packing/list',      permission: 'Packing' },
    //       ], expanded: false,
    //     },
    //   ],
    // },

    // ── DISPATCH ──────────────────────────────────────────────────
    // {
    //   label: 'Dispatch',
    //   permission: 'Dispatch',
    //   items: [
    //     {
    //       label: 'Dispatch', icon: 'ti-truck', permission: 'Dispatch',
    //       children: [
    //         { label: 'Dashboard', route: '/dispatch/dashboard', permission: 'Dispatch' },
    //         { label: 'Shipments', route: '/dispatch/shipments', permission: 'Dispatch' },
    //       ], expanded: false,
    //     },
    //   ],
    // },

    // ── ADMIN ─────────────────────────────────────────────────────
    // {
    //   label: 'Admin',
    //   permission: 'Admin',
    //   items: [
    //     { label: 'Settings', icon: 'ti-settings', route: '/admin/settings', permission: 'Admin' },
    //   ],
    // },
  ];

  private menuPermissions: any[] = [];
  private routerSub!: Subscription;
  private storeSub!: Subscription;

  constructor(
    private router: Router,
    private store: Store,
    private activatedRoute: ActivatedRoute,
    private service: ServiceService,
  ) {}

  ngOnInit(): void {
    this.storeSub = this.store.select(selectAllPermissions).subscribe(perms => {
      this.menuPermissions = perms;
    });

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateFromRoute();
        this.syncBreadcrumb();
        this.closeUserMenu();
      });

    this.updateFromRoute();
    this.syncBreadcrumb();

    const saved = localStorage.getItem('fi-theme');
    if (saved === 'dark') this.applyTheme(true);

    this.currentYear = new Date().getFullYear();
let token = sessionStorage.getItem('Token');

if (token !== null) {
    // TypeScript now knows 'token' is safely a string
    this.tokeninfo = this.getDecodedAccessToken(token);
    this.username=this.tokeninfo.LoginName
    this.role=this.tokeninfo.role
    this.initial =  this.username[0].toUpperCase()
} else {
    this.tokeninfo = null; 
    // Handle the logged-out state gracefully here
}
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.storeSub?.unsubscribe();
  }
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }
  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeUserMenu(); }

  private updateFromRoute(): void {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;
    const data       = route.snapshot.data;
    this.pageTitle   = data['title']       ?? '';
    this.breadcrumbs = data['breadcrumbs'] ?? [];
  }

  private syncBreadcrumb(): void {
    for (const group of this.navGroups) {
      for (const item of group.items) {
        if (item.route && this.isActive(item.route)) { this.currentPageLabel = item.label; return; }
        for (const child of item.children ?? []) {
          if (this.isActive(child.route)) { this.currentPageLabel = child.label; return; }
        }
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) this.closeUserMenu();
  }

  toggleTheme(): void { this.applyTheme(!this.darkMode); }

  applyTheme(dark: boolean): void {
    this.darkMode = dark;
    document.documentElement.setAttribute('data-fi-theme', dark ? 'dark' : 'light');
    localStorage.setItem('fi-theme', dark ? 'dark' : 'light');
  }

  toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }
  closeUserMenu(): void  { this.userMenuOpen = false; }

  toggleSubmenu(item: NavItem): void {
    if (item.children?.length) item.expanded = !item.expanded;
  }

  navigate(route: string, label: string): void {
    this.currentPageLabel = label;
    this.router.navigate([route]);
  }

  isActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  isGroupActive(item: NavItem): boolean {
    return item.children?.some(c => this.isActive(c.route)) ?? false;
  }

  // Returns true if permission not set (always show) OR user has canRead on it
  canSee(permission?: string): boolean {
    if (!permission) return true;
    return this.hasMenu(permission);
  }

  hasMenu(menuName: string): boolean {
    const search = (menus: any[]): boolean => {
      for (const menu of menus) {
        if (menu.name?.toLowerCase() === menuName.toLowerCase() && menu.canRead) return true;
        if (menu.subManu?.length > 0 && search(menu.subManu)) return true;
      }
      return false;
    };
    return search(this.menuPermissions);
  }

  signOut(): void {
    this.closeUserMenu();
    Swal.fire({
      title: 'Do you want to logout your session? Kindly confirm',
      showCancelButton: true,
      confirmButtonText: 'Yes, log me out',
    }).then(result => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        this.store.dispatch(clearPermissions());
        localStorage.removeItem('permissions');
        this.router.navigate(['']);
      }
    });
  }
}