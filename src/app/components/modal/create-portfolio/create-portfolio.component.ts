import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';

import { PopoverComponent } from 'src/app/views/landing-page/portfolio/add-popover/add-popover.component';
import { PortfolioService } from 'src/app/views/landing-page/portfolio/portfolio.service';

@Component({
  selector: 'app-create-portfolio',
  templateUrl: './create-portfolio.component.html',
  styleUrls: ['./create-portfolio.component.css'],
})
export class CreatePortfolioComponent extends PopoverComponent implements OnInit {
  @Output() selectedStocks = new EventEmitter<PortfolioMeta>();
  selectedTickers: string[] = [];

  form = this.fb.group({
    title: ['', [Validators.required]],
  });

  constructor(
    public portfolioService: PortfolioService,
    private fb: FormBuilder,
    public snackBar: MatSnackBar
  ) {
    super(portfolioService, snackBar);
  }

  ngOnInit(): void {}

  getFormError(fc: string) {
    if (this.form.controls[fc].invalid && this.form.controls[fc].touched) return true;
    else return false;
  }

  // Sets only store unique values and hence, do not need to check for existing
  setHandler(action: string, selectedArr: string[], updateArr: string[]) {
    const updateSet = new Set(updateArr);
    if (action === 'ADD') selectedArr.forEach((item) => updateSet.add(item));
    if (action === 'REMOVE') selectedArr.forEach((item) => updateSet.delete(item));
    return Array.from(updateSet);
  }

  onSelectHandler(action: string): void {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const tickers = selectedNodes.map((node) => node.data.ticker);

    switch (action.toUpperCase()) {
      case 'ADD':
        this.selectedTickers = this.setHandler('ADD', tickers, this.selectedTickers);
        break;
      case 'REMOVE':
        this.selectedTickers = this.setHandler('REMOVE', tickers, this.selectedTickers);
        break;
    }

    this.selectedStocks.emit({
      portfolioName: this.form.controls['title'].value,
      tickers: this.selectedTickers,
      orderId: 0,
    });
  }
}
