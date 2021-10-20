import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PopoverComponent } from './popover/popover.component';

@NgModule({
  declarations: [LandingPageComponent, PortfolioComponent, PopoverComponent],
  imports: [SharedModule, LandingPageRoutingModule],
  exports: [],
})
export class LandingPageModule {}
