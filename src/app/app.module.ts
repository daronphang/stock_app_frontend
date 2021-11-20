import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './components/shared.module';
import { LandingPageModule } from './views/landing-page/landing-page.module';

import { AuthInterceptorService } from './views/auth/services/auth-interceptor.service';

import { AppComponent } from './app.component';
import { AuthComponent } from './views/auth/auth.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EarningsComponent } from './views/earnings/earnings.component';
import { ErrorComponent } from './views/error/error.component';
import { LogoutComponent } from './views/logout/logout.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HeaderComponent,
    FooterComponent,
    EarningsComponent,
    ErrorComponent,
    LogoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    LandingPageModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
