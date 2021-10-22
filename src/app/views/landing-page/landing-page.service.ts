import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  userPortfolio$ = new BehaviorSubject<PortfolioMeta[]>([]);

  // Retrieve user portfolios from database
  fetchPortfolio() {
    const portfolioList: PortfolioMeta[] = [
      {
        title: 'Automobile',
        tickers: ['TSLA', 'NIO', 'GM', 'LCID', 'HYLN'], // , 'APPS', 'AAPL', 'VIAC', 'JPM', 'SE', 'NVDA'
      },
      { title: 'Software', tickers: ['PLTR', 'PINS', 'ZM', 'NFLX', 'U', 'PATH', 'RBLX'] },
      { title: 'Social Media', tickers: ['FB', 'SNAP', 'TWTR'] },
      { title: 'Fintech', tickers: ['PYPL', 'SQ', 'V', 'UPST', 'SOFI'] },
      { title: 'Database', tickers: ['MDB', 'SNOW', 'DDOG', 'DBX'] },
      { title: 'Advertising', tickers: ['APPS', 'TTD'] },
      {
        title: 'Semiconductor',
        tickers: ['NVDA', 'MU', 'INTC', 'AMD', 'AMAT'],
      },
    ];

    // Maximum of 5 API calls per second
    // Each portfolio will delay fetch request by cumulative factor
    // i.e. if 1st has 7 tickers, 2nd will delay by Math.ceil(7/5) = 2s + 1s
    // 3rd will delay by 3s +
    // let delayMultiplier = 0;
    // const mapPortfolio = portfolioList.map((item) => {
    //   const curIndex = portfolioList.indexOf(item);
    //   let prevItem;
    //   if (curIndex === 1) {
    //     prevItem = portfolioList[0];
    //     delayMultiplier = Math.ceil(prevItem.tickers.length / 5) + 1;
    //     item.delayMultiplier = delayMultiplier;
    //   }
    //   if (curIndex > 1) {
    //     prevItem = portfolioList[curIndex - 1];
    //     delayMultiplier += Math.ceil(prevItem.tickers.length / 5);
    //     item.delayMultiplier = delayMultiplier;
    //   }
    //   return item;
    // });

    // const tickers: string[] = [];
    // portfolioList.forEach((obj) => tickers.push(...obj.tickers));
    // this.userPortfolio$.next(mapPortfolio);

    return of(portfolioList).pipe(delay(1000));
  }

  constructor() {}
}
