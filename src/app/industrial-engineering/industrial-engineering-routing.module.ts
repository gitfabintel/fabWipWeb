import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionsComponent } from './sections/sections.component';
import { AuthGuard } from '../shared/auth/auth.guard';
import { OperationsComponent } from './operations/operations.component';
import { MachinesComponent } from './machines/machines.component';
import { WorkersComponent } from './workers/workers.component';
import { StyleBulletinComponent } from './style-bulletin/style-bulletin.component';
import { AddEditStyleBulletinComponent } from './style-bulletin/add-edit-style-bulletin/add-edit-style-bulletin.component';

const routes: Routes = [
    //  {
    //               path: 'cutting-dashboard',
    //               component: CuttingDashboardComponent,
    //               canActivate: [AuthGuard],
    //                data: {
    //     title: 'Dashboard',
    //     breadcrumbs: [
    //       { label: 'Production Cutting', url: '/production-cutting/cutting-master' },
    //       { label: 'Cutting Planning' }
    //     ]
    //   }
    //             },
{
    path: 'sections',
    component: SectionsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Sections',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Sections' }
      ]
    }
  },
  {
    path: 'operations',
    component: OperationsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Operations',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Operations' }
      ]
    }
  },
  {
    path: 'machines',
    component: MachinesComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Machines',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Machines' }
      ]
    }
  },
  {
    path: 'workers',
    component: WorkersComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Workers',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Workers' }
      ]
    }
  },
  {
    path: 'style-bulletin',
    component: StyleBulletinComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Style Bulletin',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Style Bulletin' }
      ]
    }
  },
  {
    path: 'add-edit-style-bulletin',
    component: AddEditStyleBulletinComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Style Bulletin',
      breadcrumbs: [
        { label: 'Industrial Engineering', url: '/industrial-engineering/sections' },
        { label: 'Style Bulletin', url: '/industrial-engineering/style-bulletin' },
        { label: 'Add / Edit' }
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndustrialEngineeringRoutingModule { }
