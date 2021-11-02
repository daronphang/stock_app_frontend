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
import { HeaderService } from 'src/app/components/header/header.service';

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
    public dialog: MatDialog,
    private headerService: HeaderService
  ) {
    super(portfolioService);
    headerService.showHeader = true;
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

  onSearchHandler(event: SearchEvent) {
    // To trigger onSearch and isLoading only
    if (event.input === 'SEARCHING') {
      this.isLoading = true;
      this.onSearch = true;
      return;
    }

    // If user clears search
    if (event.input === '') {
      this.isLoading = false;
      this.onSearch = false;
      return;
    }

    if (event.results.length > 0) {
      const finalData: any[] = [];
      const cleanData = event.results.filter((item) => item);
      cleanData.forEach((item) => {
        const stockData = this.portfolioService.mapData(item);
        finalData.push(stockData);
      });
      this.portfolioTable$.next(finalData);
      this.isLoading = false;
      return;
    }

    // If search returned no results
    this.isLoading = false;
    this.portfolioTable$.next(event.results);
  }
}
