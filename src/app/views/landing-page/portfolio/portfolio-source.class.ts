import { BehaviorSubject, Observable } from 'rxjs';
import { AgGridEvent, ColDef } from 'ag-grid-community';

import { PortfolioTable } from 'src/app/interfaces/portfolio';
import { PortfolioService } from './portfolio.service';
import { take } from 'rxjs/operators';

export class PortfolioSource {
  portfolioTable$ = new BehaviorSubject<PortfolioTable[]>([]);
  isLoading: boolean = false;
  timestamp = new Date();

  defaultColDef = {
    resizable: true,
    rowDragManaged: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Ticker', field: 'ticker' },
    { headerName: 'Price', field: 'price' },
    { headerName: 'Beta', field: 'beta' },
    { headerName: 'Market Cap.', field: 'marketCap' },
    { headerName: 'Shares Outs.', field: 'sharesOut' },
    { headerName: 'EV/EBIDTA', field: 'evToEbidta' },
    { headerName: 'EV/Rev', field: 'evToRev' },
    { headerName: 'P/E (F)', field: 'forwardPE' },
    { headerName: 'Price/Book', field: 'priceBook' },
    { headerName: 'EPS (F)', field: 'forwardEps' },
    { headerName: 'PEG Ratio', field: 'pegRatio' },
    { headerName: 'Short Ratio', field: 'shortRatio', width: 140 },
    { headerName: 'FCF', field: 'fcf', width: 100 },
    { headerName: 'ROE', field: 'roe', width: 100 },
    { headerName: 'CR', field: 'currentRatio', width: 80 },
    { headerName: 'Debt/Equity', field: 'debtToEquity', width: 140 },
  ];

  editColumnDefs: ColDef[] = [
    { headerName: 'Del', checkboxSelection: true, rowDrag: true, width: 80 },
    ...this.columnDefs,
  ];

  constructor(public portfolioService: PortfolioService) {}

  onGridReady(params: AgGridEvent) {
    params.columnApi.autoSizeAllColumns();
  }

  onFinalize(finalData: any[], isStore: boolean, key: string) {
    this.isLoading = false;
    this.portfolioTable$.next(finalData);
    this.timestamp = new Date(new Date());
    if (isStore)
      localStorage.setItem(key, JSON.stringify({ timestamp: new Date(), data: finalData }));
  }

  displayPortfolioTable(resultObs$: Observable<any[]>, isStore: boolean = false, key: string = '') {
    const finalData: PortfolioTable[] = [];
    this.isLoading = true;

    resultObs$.pipe(take(1)).subscribe(
      (data: any[]) => {
        const cleanData = data.filter((item) => item);
        cleanData.forEach((item) => {
          const stockData = this.portfolioService.mapData(item);
          finalData.push(stockData);
        });
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
      },
      () => {
        this.onFinalize(finalData, isStore, key);
      }
    );
  }
}
