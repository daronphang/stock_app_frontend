import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';

import { ModalComponent } from 'src/app/components/modal/modal.component';

import { PortfolioService } from './portfolio/portfolio.service';
import { LandingPageService } from './landing-page.service';
import { StockSearchList } from 'src/app/shared/search-stock-list';
import { SearchEvent } from 'src/app/interfaces/generic';
import { switchMap, take } from 'rxjs/operators';
import { PortfolioSource } from './portfolio/portfolio-source.class';
import { storageHandler } from 'src/app/helpers/storage';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent extends PortfolioSource implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  userPortfolio$ = new BehaviorSubject<PortfolioMeta[]>([]);
  searchInput$ = new BehaviorSubject<string[]>([]);
  onSearch: boolean = false;
  stockSearchList = StockSearchList;

  // Observable to be used if portfolio data does not exist in local storage
  dataSource = new BehaviorSubject<any[]>([]);

  constructor(
    public portfolioService: PortfolioService,
    public landingPageService: LandingPageService,
    public dialog: MatDialog
  ) {
    super(portfolioService);
  }

  ngOnInit(): void {
    this.isLoading = true;

    // Fetches a list of unique tickers to API
    // If multiple portfolios have same stock, will only fetch once
    // if portfolio data exists in local storage, will not fetch
    const uniqueTickers = new Set<string>();
    this.landingPageService.fetchPortfolio().subscribe(
      (portfolioData) => {
        this.isLoading = false;
        portfolioData.forEach((portfolio) => {
          storageHandler('LOCAL', portfolio.title).subscribe(
            () => (portfolio.storage = true),
            (err) => portfolio.tickers.forEach((ticker) => uniqueTickers.add(ticker))
          );
        });
        this.userPortfolio$.next(portfolioData);
        this.portfolioService.fetchDataArr(Array.from(uniqueTickers)).subscribe(
          (results) => this.dataSource.next(results),
          (err) => {},
          () => {
            this.dataSource.next(['completed']);
          }
        );
      },
      (err) => {}
    );
  }

  onCreatePortfolioHandler(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Create Portfolio',
        createPortfolio: true,
        actions: 'create',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'cancel' || result.length === 0) return;
      console.log(result);
      this.userPortfolio$.pipe(take(1)).subscribe((data) => {
        this.userPortfolio$.next([...data, result]);
      });
    });
  }

  displaySearchTable(takeValue: number): void {
    const resultObs$ = this.searchInput$
      .pipe(
        switchMap((tickers) => {
          this.isLoading = true;
          return this.portfolioService.fetchDataArr(tickers);
        })
      )
      .pipe(take(takeValue));
    this.displayPortfolioTable(resultObs$);
  }

  onSearchHandler(event: SearchEvent) {
    console.log(event.input);
    // If user clears search
    if (event.input === '') {
      return (this.onSearch = false);
    }
    this.onSearch = true;

    if (event.results.length > 0) {
      const searchTickers: string[] = [];
      // search results in [{name: 'Micron', ticker: 'MU'}]
      event.results.forEach((item) => searchTickers.push(item.ticker));
      const takeValue = Math.ceil(searchTickers.length / 5);
      this.searchInput$.next(searchTickers);
      return this.displaySearchTable(takeValue);
    }
    // send request to API with single ticker
    this.searchInput$.next([event.input]);
    return this.displaySearchTable(1);
  }
}
