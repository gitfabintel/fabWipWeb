import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './shared/login/login.component';
import { SignupComponent } from './shared/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { EncDecService } from './shared/auth/enc-dec.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './shared/auth/auth.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { BarcodeDialogComponent } from './shared/barcode-dialog/barcode-dialog.component';
import { PdfGeneratorService } from './shared/pdf-generator.service';
import { DefaultLayoutComponent } from './shared/layout/default-layout/default-layout.component';
import { StoreModule } from '@ngrx/store';
import { formReducer } from './shared/state/form.reducer';
import { permissionReducer } from './permission/permission.reducer';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    BarcodeDialogComponent,
    DefaultLayoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({ progressBar: true }),

    StoreModule.forRoot({
      form: formReducer,
      permission: permissionReducer
    }),

  ],
  providers: [
    NgbActiveModal,
    EncDecService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    PdfGeneratorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }