import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError, delay, map, take } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GetPortfolio, PortfolioMeta } from 'src/app/interfaces/portfolio';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  // dummyData = [
  //   { portfolioName: 'Automobile', tickers: ['TSLA', 'NIO', 'GM'] },
  //   { portfolioName: 'Software', tickers: ['PLTR', 'PINS', 'ZM', 'NFLX', 'U', 'PATH', 'RBLX'] },
  // ];

  constructor(private http: HttpClient, private appService: AppService) {}
  userPortfolio$ = new BehaviorSubject<PortfolioMeta[]>([]);

  // Retrieve user portfolios from database
  fetchPortfolios() {
    const response = this.http.get<GetPortfolio>('http://localhost:4280/daron/get-portfolios', {
      withCredentials: true,
    });

    return response.pipe(
      delay(1000),
      take(1),
      catchError((err) => this.appService.handleError(err)),
      map((response) => response.results)
    );
  }
}
