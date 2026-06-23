import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuttingMasterComponent } from './cutting-master/cutting-master.component';
import { AuthGuard } from '../shared/auth/auth.guard';
import { AddEditCuttingMasterComponent } from './cutting-master/add-edit-cutting-master/add-edit-cutting-master.component';
import { RollRegisterComponent } from './cutting-master/roll-register/roll-register.component';
import { LaySpreadingReportComponent } from './cutting-master/lay-spreading-report/lay-spreading-report.component';
import { ScanCuttingComponent } from './scan-cutting/scan-cutting.component';

const routes: Routes = [
    {
                path: 'cutting-master',
                component: CuttingMasterComponent,
                canActivate: [AuthGuard],
                 data: {
      title: 'Cutting Planning',
      breadcrumbs: [
        { label: 'Production Cutting', url: '/production-cutting/cutting-master' },
        { label: 'Cutting Planning' }
      ]
    }
              },

                 {
                path: 'add-edit-cutting-master',
                component: AddEditCuttingMasterComponent,
                canActivate: [AuthGuard],
                data: {
      title: 'Add / Edit Cutting Plan',
      breadcrumbs: [
        { label: 'Production Cutting',  url: '/production-cutting/cutting-master' },
        { label: 'Cutting Planning',    url: '/production-cutting/cutting-master' },
        { label: 'Add / Edit' }
      ]
    }
              },

                    {
                path: 'roll-register',
                component: RollRegisterComponent,
                canActivate: [AuthGuard],
                data: {
      title: 'Roll Register',
      breadcrumbs: [
        { label: 'Production Cutting', url: '/production-cutting/cutting-master' },
        { label: 'Roll Register' }
      ]
    }
              },

                     {
                path: 'lay-spreading-report',
                component: LaySpreadingReportComponent,
                canActivate: [AuthGuard],
                data: {
      title: 'Lay Spreading Report',
      breadcrumbs: [
        { label: 'Production Cutting', url: '/production-cutting/cutting-master' },
        { label: 'Lay Spreading Report' }
      ]
    }
              },

                           {
                path: 'scan-cutting',
                component: ScanCuttingComponent,
                canActivate: [AuthGuard],
                data: {
      title: 'Scan Cutting',
      breadcrumbs: [
        { label: 'Production Cutting', url: '/production-cutting/cutting-master' },
        { label: 'Scan Cutting' }
      ]
    }
              },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductionCuttingRoutingModule { }
