import { PortfolioTable } from 'src/app/interfaces/portfolio';
import { DataSource } from '@angular/cdk/collections';
import { catchError, take } from 'rxjs/operators';
import { BehaviorSubject, throwError, Observable, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export class StockDataSource extends DataSource<PortfolioTable> {
  private _dataStream$ = new BehaviorSubject<PortfolioTable[]>([]);

  constructor(private http: HttpClient) {
    super();
  }

  connect(): Observable<PortfolioTable[]> {
    return this._dataStream$;
  }

  disconnect() {}

  setData(data: PortfolioTable[]) {
    this._dataStream$.next(data);
  }
}
