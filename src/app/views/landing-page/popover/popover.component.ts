import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridEvent, ColDef } from 'ag-grid-community';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { SearchEvent } from 'src/app/interfaces/generic';
import { PopoverSearch, PortfolioTable } from 'src/app/interfaces/portfolio';
import { PortfolioSource } from '../portfolio/portfolio-source.class';
import { PortfolioService } from '../portfolio/portfolio.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css'],
})
export class PopoverComponent extends PortfolioSource implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Output() addedItems = new EventEmitter<any[]>();
  results$ = new BehaviorSubject<any[]>([]);
  displayResults$ = new BehaviorSubject<PopoverSearch[]>([]);

  columnDefs: ColDef[] = [
    { headerName: 'Ticker', field: 'ticker', checkboxSelection: true, width: 100, resizable: true },
    { headerName: 'Name', field: 'name', resizable: true },
  ];

  constructor(public portfolioService: PortfolioService) {
    super(portfolioService);
  }

  ngOnInit(): void {}

  onSearchHandler(event: SearchEvent) {
    // To trigger onSearch and isLoading only
    if (event.input === 'SEARCHING') {
      this.isLoading = true;
      return;
    }

    // If user clears search
    if (event.input === '') {
      this.isLoading = false;
      return this.displayResults$.next([]);
    }

    if (event.results.length > 0) {
      const finalData: PopoverSearch[] = [];
      const cleanData = event.results.filter((item) => item);

      this.results$.next(cleanData);

      cleanData.forEach((item) => {
        const stockData = {
          ticker: item.symbol,
          name: item.quoteType.shortName,
        };
        finalData.push(stockData);
      });
      this.displayResults$.next(finalData);
      this.isLoading = false;
      return;
    }

    // If search returned no results
    this.isLoading = false;
    this.displayResults$.next(event.results);
  }

  onAddHandler() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);

    const tickers = selectedData.map((obj) => obj.ticker);
    console.log(tickers);

    this.results$.subscribe((data) => {
      const selectedData = data.filter((item) => tickers.includes(item.symbol));
      this.addedItems.emit(selectedData);
    });
  }
}
