import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthComponent } from './views/auth/auth.component';

const routes: Routes = [
  {
    path: 'lp',
    loadChildren: () =>
      import('./views/landing-page/landing-page.module').then((m) => m.LandingPageModule),
  },
  { path: 'auth', component: AuthComponent },
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
