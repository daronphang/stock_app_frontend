import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthComponent } from './views/auth/auth.component';
import { AuthGuardService } from './views/auth/services/auth-guard.service';
import { EarningsComponent } from './views/earnings/earnings.component';
import { ErrorComponent } from './views/error/error.component';
import { LogoutComponent } from './views/logout/logout.component';

const routes: Routes = [
  {
    path: 'lp',
    loadChildren: () =>
      import('./views/landing-page/landing-page.module').then((m) => m.LandingPageModule),
  },
  { path: 'earnings', component: EarningsComponent, data: { animationState: 'Earnings' } },
  { path: 'login', component: AuthComponent, data: { animationState: 'Login' } },
  {
    path: 'logout',
    component: LogoutComponent,
    data: { animationState: 'Logout' },
  },
  { path: '404', component: ErrorComponent, data: { animationState: 'error' } },
  { path: '', redirectTo: 'lp', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 100],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
