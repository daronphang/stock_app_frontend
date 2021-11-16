import { BehaviorSubject, Observable } from 'rxjs';
import {
  AgGridEvent,
  ColDef,
  ColumnApi,
  FirstDataRenderedEvent,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';

import { PortfolioTable } from 'src/app/interfaces/portfolio';
import { PortfolioService } from './portfolio.service';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export class PortfolioSource {
  portfolioTable$ = new BehaviorSubject<PortfolioTable[]>([]);
  isLoading: boolean = false;
  timestamp = new Date();
  gridApi: GridApi;
  columnApi: ColumnApi;

  defaultColDef = {
    resizable: true,
    rowDragManaged: true,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Ticker', field: 'ticker', pinned: 'left' },
    { headerName: 'Earnings', field: 'earningsDate' },
    { headerName: 'Price', field: 'price' },
    { headerName: 'Beta', field: 'beta' },
    { headerName: 'Market Cap.', field: 'marketCap' },
    { headerName: 'EV', field: 'ev' },
    { headerName: 'Shares Outs.', field: 'sharesOut' },
    { headerName: 'EV/EBIDTA', field: 'evToEbidta' },
    { headerName: 'EV/Rev', field: 'evToRev' },
    { headerName: 'P/E (F)', field: 'forwardPE' },
    { headerName: 'P/B', field: 'priceBook' },
    { headerName: 'EPS (F)', field: 'forwardEps' },
    { headerName: 'PEG Ratio', field: 'pegRatio' },
    { headerName: 'Short Ratio', field: 'shortRatio' },
    { headerName: 'FCF', field: 'fcf' },
    { headerName: 'ROE', field: 'roe' },
    { headerName: 'CR', field: 'currentRatio' },
    { headerName: 'Debt/Equity', field: 'debtToEquity' },
  ];

  editColumnDefs: ColDef[] = [
    {
      headerName: 'Delete',
      checkboxSelection: true,
      width: 80,
      headerClass: 'delete-header',
    },
    ...this.columnDefs,
  ];

  constructor(public portfolioService: PortfolioService, public snackBar: MatSnackBar) {}

  // To autosize columns not visible in DOM, need call both GridReady and FirstDataRendered
  // GridReady to fit all columns on DOM first
  // FirstDataRendered to autosize all columns
  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    const allColIds: string[] = [];
    params.columnApi.getAllColumns()?.forEach((column) => allColIds.push(column.getColId()));
    params.columnApi.autoSizeColumns(allColIds);
  }

  // Set loading to false, push final array to portfoliotable$ and add to session storage
  onFinalize(finalData: any[], isStore: boolean, key: string) {
    this.isLoading = false;
    this.portfolioTable$.next(finalData);
    this.timestamp = new Date(new Date());
    if (isStore)
      sessionStorage.setItem(key, JSON.stringify({ timestamp: new Date(), data: finalData }));
  }

  displayPortfolioTable(
    resultObs$: Observable<any[]>,
    takeValue: number,
    originalData: PortfolioTable[],
    isStore: boolean = false,
    key: string = '',
    successMsg: string,
    errMsg: string
  ) {
    const finalData: PortfolioTable[] = originalData;
    this.isLoading = true;

    resultObs$.pipe(take(takeValue)).subscribe(
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
        this.snackBar.open(`${errMsg}: ${err}`, 'Close', {
          panelClass: 'error-snackbar',
        });
      },
      () => {
        this.onFinalize(finalData, isStore, key);
        this.snackBar.open(`${successMsg}`, 'Close', {
          panelClass: 'success-snackbar',
          duration: 5000,
        });
      }
    );
  }
}
