import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { debounceTime, delay, map } from 'rxjs/operators';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  uniqueTickers: string[] = [];
  userPortfolio$ = new BehaviorSubject<PortfolioMeta[]>([]);

  // Retrieve user portfolios from database
  fetchPortfolio() {
    const portfolioList: PortfolioMeta[] = [
      {
        title: 'My Portfolio',
        tickers: ['TSLA', 'MU', 'APPS', 'AAPL', 'VIAC', 'JPM'], // , 'APPS', 'AAPL', 'VIAC', 'JPM', 'SE', 'NVDA'
        delayMultiplier: 0,
      },
      { title: 'Another Portfolio', tickers: ['APPS', 'SE', 'NVDA'], delayMultiplier: 0 },
    ];

    const mapPortfolio = portfolioList.map((item) => {
      const curIndex = portfolioList.indexOf(item);
      let prevItem;
      curIndex > 0 ? (prevItem = portfolioList[curIndex - 1]) : (prevItem = item);
      item.delayMultiplier = curIndex * Math.ceil(prevItem.tickers.length / 5);
      return item;
    });

    const tickers: string[] = [];
    portfolioList.forEach((obj) => tickers.push(...obj.tickers));

    this.uniqueTickers = Array.from(new Set(tickers));
    this.userPortfolio$.next(mapPortfolio);
    return of('success').pipe(delay(1000));
  }

  constructor() {}
}
