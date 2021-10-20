import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { AgGridModule } from 'ag-grid-angular';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchComponent } from '../components/search/search.component';
import { AlertsComponent } from '../components/alerts/alerts.component';
import { ModalComponent } from '../components/modal/modal.component';
import { CreatePortfolioComponent } from '../components/modal/create-portfolio/create-portfolio.component';

const components = [SearchComponent, AlertsComponent, ModalComponent, CreatePortfolioComponent];
const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  AgGridModule,
  NgbPopoverModule,
];

@NgModule({
  declarations: [...components],
  imports: [...modules],
  exports: [...modules, ...components],
})
export class SharedModule {}
