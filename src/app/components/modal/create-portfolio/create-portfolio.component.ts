import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';

import { PopoverComponent } from 'src/app/views/landing-page/popover/popover.component';
import { PortfolioService } from 'src/app/views/landing-page/portfolio/portfolio.service';

@Component({
  selector: 'app-create-portfolio',
  templateUrl: './create-portfolio.component.html',
  styleUrls: ['./create-portfolio.component.css'],
})
export class CreatePortfolioComponent extends PopoverComponent implements OnInit {
  @Output() selectedStocks = new EventEmitter<PortfolioMeta>();
  selectedTickers$ = new BehaviorSubject<string[]>([]);

  form = this.fb.group({
    title: ['', [Validators.required]],
  });

  constructor(public portfolioService: PortfolioService, private fb: FormBuilder) {
    super(portfolioService);
  }

  ngOnInit(): void {}

  getFormError(fc: string) {
    if (this.form.controls[fc].invalid && this.form.controls[fc].touched) return true;
    else return false;
  }

  // Sets only store unique values and hence, do not need to check for existing
  setHandler(action: string, selectedArr: string[], updateArr: string[]) {
    const updateSet = new Set(updateArr);
    if (action === 'add') selectedArr.forEach((item) => updateSet.add(item));
    if (action === 'remove') selectedArr.forEach((item) => updateSet.delete(item));
    return Array.from(updateSet);
  }

  onSelectHandler(action: string): void {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    const selectedTickers = selectedData.map((obj) => obj.ticker);

    this.selectedTickers$.pipe(take(1)).subscribe((tickers) => {
      let updatedTickers: string[] = [];
      if (action === 'add') updatedTickers = this.setHandler(action, selectedTickers, tickers);
      if (action === 'remove') updatedTickers = this.setHandler(action, selectedTickers, tickers);
      this.selectedTickers$.next(updatedTickers);

      this.selectedStocks.emit({
        title: this.form.controls['title'].value,
        tickers: updatedTickers,
      });
    });
  }
}
