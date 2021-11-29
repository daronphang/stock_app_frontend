import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/components/shared.module';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { LandingPageComponent } from './landing-page.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PopoverComponent } from './portfolio/add-popover/add-popover.component';
import { ReorderComponent } from './reorder/reorder.component';

@NgModule({
  declarations: [LandingPageComponent, PortfolioComponent, PopoverComponent, ReorderComponent],
  imports: [SharedModule, LandingPageRoutingModule],
  exports: [],
})
export class LandingPageModule {}
