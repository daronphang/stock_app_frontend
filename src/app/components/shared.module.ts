import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { AgGridModule } from 'ag-grid-angular';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { SearchComponent } from './search/search.component';
import { AlertsComponent } from './alerts/alerts.component';
import { ModalComponent } from './modal/modal.component';
import { CreatePortfolioComponent } from './modal/create-portfolio/create-portfolio.component';
import { KeyPressDirective } from '../directives/keypress.directive';
import { MessageComponent } from './alerts/message/message.component';

const components = [
  SearchComponent,
  AlertsComponent,
  ModalComponent,
  CreatePortfolioComponent,
  KeyPressDirective,
];
const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  AgGridModule,
  NgbPopoverModule,
];

@NgModule({
  declarations: [...components, MessageComponent],
  imports: [...modules],
  exports: [...modules, ...components],
})
export class SharedModule {}
