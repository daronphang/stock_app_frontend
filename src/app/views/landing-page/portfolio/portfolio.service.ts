import { Injectable } from '@angular/core';
import { PortfolioTable } from 'src/app/interfaces/portfolio';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AlertsService } from 'src/app/components/alerts/alerts.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  stockData: PortfolioTable[] = [];

  constructor(private http: HttpClient, private alertsService: AlertsService) {}

  fetchData(ticker: string) {
    const headers = {
      'x-rapidapi-host': 'yh-finance.p.rapidapi.com',
      'x-rapidapi-key': '9484f772fbmsh9f388e9e7326eddp1f626ejsnc3ef33d3f125',
    };

    const response$ = this.http.get(
      `https://yh-finance.p.rapidapi.com/stock/v2/get-summary?symbol=${ticker}&region=US`,
      {
        headers: new HttpHeaders(headers),
      }
    );
    return response$.pipe(
      catchError((err) => this.handleError(err, ticker)),
      map((data) => {
        if (data === 'ticker does not exist') {
          return null;
        }
        return data;
      })
    );
  }

  handleError(errRes: HttpErrorResponse, ticker: string = '') {
    let errorMsg = 'An unknown error occurred.';

    // If ticker does not exist
    // To continue sending request and not throw error
    if (errRes.status === 302) {
      this.alertsService.displayMessage(`Unable to retrieve data for ${ticker} from API.`);
      return of('TICKER_NOT_EXIST');
    }

    if (errRes.error) return throwError(errRes.error);
    if (errRes.error.error) return throwError(errRes.error.error);

    return throwError(errorMsg);
  }

  fetchDataArr(tickerList: string[]) {
    // Maximum of 5 variables in array
    const chunkArr: string[][] = [];
    for (let i = 0; i < tickerList.length; i += 5) {
      const chunk = tickerList.slice(i, i + 5);
      chunkArr.push(chunk);
    }

    const results$ = from(chunkArr).pipe(
      concatMap((chunk) => {
        const chunkObs$ = chunk.map((ticker) => {
          return this.fetchData(ticker);
        });
        return forkJoin(chunkObs$);
      })
    );
    return results$;
  }

  mapData(item: any) {
    const stockData: PortfolioTable = {
      ticker: item.symbol,
      earningsDate: item.calendarEvents?.earnings?.earningsDate[0]?.fmt,
      price: item.price.regularMarketPrice?.fmt,
      beta: item.defaultKeyStatistics.beta?.fmt,
      marketCap: item.price.marketCap?.fmt,
      ev: item.defaultKeyStatistics.enterpriseValue.fmt,
      sharesOut: item.defaultKeyStatistics?.sharesOutstanding?.fmt,
      evToEbidta: item.defaultKeyStatistics?.enterpriseToEbitda?.fmt,
      evToRev: item.defaultKeyStatistics?.enterpriseToRevenue?.fmt,
      forwardPE: item.defaultKeyStatistics?.forwardPE?.fmt,
      priceBook: item.defaultKeyStatistics?.priceToBook?.fmt,
      forwardEps: item.defaultKeyStatistics?.forwardEps?.fmt,
      pegRatio: item.defaultKeyStatistics?.pegRatio?.fmt,
      shortRatio: item.defaultKeyStatistics?.shortRatio?.fmt,
      fcf: item.financialData?.freeCashflow?.fmt,
      roe: item.financialData?.returnOnEquity?.fmt,
      currentRatio: item.financialData?.currentRatio?.fmt,
      debtToEquity: item.financialData?.debtToEquity?.fmt,
    };
    return stockData;
  }
}
