import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthComponent } from './views/auth/auth.component';
import { EarningsComponent } from './views/earnings/earnings.component';

const routes: Routes = [
  {
    path: 'lp',
    loadChildren: () =>
      import('./views/landing-page/landing-page.module').then((m) => m.LandingPageModule),
  },
  { path: 'earnings', component: EarningsComponent, data: { animationState: 'Earnings' } },
  { path: 'login', component: AuthComponent, data: { animationState: 'Login' } },
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
