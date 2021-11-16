import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { BehaviorSubject } from 'rxjs';
import { SearchEvent } from 'src/app/interfaces/generic';
import { StockSearch } from 'src/app/interfaces/portfolio';
import { PortfolioSource } from '../portfolio-source.class';
import { PortfolioService } from '../portfolio.service';

@Component({
  selector: 'app-popover',
  templateUrl: './add-popover.component.html',
  styleUrls: ['./add-popover.component.css'],
})
export class PopoverComponent extends PortfolioSource implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Output() addedItems = new EventEmitter<string[]>();
  displayResults$ = new BehaviorSubject<StockSearch[]>([]);

  columnDefs: ColDef[] = [
    { headerName: 'Ticker', field: 'ticker', checkboxSelection: true, width: 100, resizable: true },
    { headerName: 'Name', field: 'name', resizable: true },
  ];

  constructor(public portfolioService: PortfolioService, public snackBar: MatSnackBar) {
    super(portfolioService, snackBar);
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
      console.log(event.results);
      this.displayResults$.next(event.results);
      // this.displayResults$.next([{ name: 'hello', ticker: 'world' }]);
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

    const tickers: string[] = selectedData.map((obj) => obj.ticker);
    this.addedItems.emit(tickers);
  }
}
