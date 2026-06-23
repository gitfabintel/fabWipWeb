import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModule } from './admin/admin.module';

import { LoginComponent } from './shared/login/login.component';
import { SignupComponent } from './shared/signup/signup.component';
import { AuthGuard } from './shared/auth/auth.guard';
import { DefaultLayoutComponent } from './shared/layout/default-layout/default-layout.component';

const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);

const productionCuttingModule = () => import('./production-cutting/production-cutting.module').then(x => x.ProductionCuttingModule);



const routes: Routes = [
   { path: 'login', redirectTo: 'login', pathMatch: 'full' },

  // Login & Signup
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // All authenticated routes under one layout
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
      },


      {
        path: 'production-cutting',
        loadChildren: () => import('./production-cutting/production-cutting.module').then(m => m.ProductionCuttingModule)
      },

    ]
  },

  // Default redirect (optional)
  { path: '**', redirectTo: 'login' }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
