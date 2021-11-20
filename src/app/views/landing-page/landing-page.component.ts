import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { take, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PortfolioService } from './portfolio/portfolio.service';
import { LandingPageService } from './landing-page.service';
import { HeaderService } from 'src/app/components/header/header.service';
import { SearchEvent } from 'src/app/interfaces/generic';
import { PortfolioSource } from './portfolio/portfolio-source.class';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';
import { AppService } from 'src/app/app.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent extends PortfolioSource implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  userPortfolio: string[] = [];
  searchInput$ = new BehaviorSubject<string[]>([]);
  onSearch: boolean = false;
  onReorder: boolean = false;
  errorMsg: string;
  onCreate: boolean = false;

  reorderGridApi: GridApi;

  // Observable to be used if portfolio data does not exist in session storage
  dataSource = new BehaviorSubject<any[]>([]);

  reorderColumnDefs: ColDef[] = [{ headerName: 'Portfolio Name', field: 'portfolioName' }];

  constructor(
    private headerService: HeaderService,
    private appService: AppService,
    public portfolioService: PortfolioService,
    public landingPageService: LandingPageService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    super(portfolioService, snackBar);
    headerService.showHeader = true;
  }

  ngOnInit(): void {
    this.isLoading = true;

    // Fetches a list of unique tickers to API
    // If multiple portfolios have same stock, will only fetch once
    // if portfolio data exists in local storage, will not fetch
    const uniqueTickers = new Set<string>();
    this.landingPageService
      .fetchPortfolios()
      .pipe(
        switchMap((res) => {
          res.forEach((item) => {
            const portfolio = sessionStorage.getItem(item.portfolioName);
            portfolio ? null : item.tickers.forEach((ticker) => uniqueTickers.add(ticker));
          });

          this.landingPageService.userPortfolio$.next(res);
          this.isLoading = false;
          // Fetches chunk of 5 stocks per API request
          // Each portfolio will check if the ticker is included
          return this.portfolioService.fetchDataArr(Array.from(uniqueTickers));
        })
      )
      .subscribe(
        (results) => {
          this.dataSource.next(results);
        },
        (err) => {
          this.errorMsg = err;
          this.portfolioService.errorMsgs$.next([err]);
        },
        () => {
          this.dataSource.next(['completed']);
        }
      );
  }

  onCreatePortfolioHandler(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Create Portfolio',
        createPortfolio: true,
        actions: 'Create',
      },
    });

    let newPortfolio: PortfolioMeta;
    let userPortfolios: PortfolioMeta[];

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (result === 'cancel' || result.length === 0) return of(null);
          newPortfolio = result;
          return this.landingPageService.userPortfolio$.pipe(take(1));
        }),
        switchMap((portfolios) => {
          // If user clicks cancel
          if (!portfolios) return of(null);
          this.onCreate = true;
          userPortfolios = portfolios;
          newPortfolio['orderId'] = portfolios.length + 1;
          return this.http.post('http://localhost:4280/daron/create-portfolio', newPortfolio, {
            withCredentials: true,
          });
        }),
        catchError((err) => this.appService.handleError(err))
      )
      .subscribe(
        (response) => {
          if (!response) return;
          this.landingPageService.userPortfolio$.next([...userPortfolios, newPortfolio]);
          this.snackBar.open('Created new portfolio!', 'Close', {
            panelClass: 'success-snackbar',
          });
        },
        (err) => {
          this.snackBar.open(`Error while creating portfolio: ${err}`, 'Close', {
            panelClass: 'error-snackbar',
          });
        }
      );
  }

  onDeletePortfolioHandler(event: string) {
    this.landingPageService.userPortfolio$.pipe(take(1)).subscribe((prevData) => {
      const index = prevData.findIndex((item) => item.portfolioName === event);
      prevData.splice(index, 1);
      this.landingPageService.userPortfolio$.next(prevData);
      sessionStorage.removeItem(event);
      this.snackBar.open('Portfolio deleted!', 'Close', {
        panelClass: 'success-snackbar',
        duration: 5000,
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

  onReorderHandler() {
    this.onReorder = true;
  }

  reorderEventHandler(event: string) {
    switch (event) {
      case 'COMPLETE':
        this.onReorder = false;
        this.snackBar.open('Portfolios reordered!', 'Close', {
          panelClass: 'success-snackbar',
          duration: 5000,
        });
        break;
      default:
        this.onReorder = false;
    }
  }

  testErrorHandler() {
    this.portfolioService.errorMsgs$.pipe(take(1)).subscribe((data) => {
      this.portfolioService.errorMsgs$.next([...data, 'hello world']);
    });
  }

  onKeyPressEvent(event: string) {
    if (event === 'Escape') {
      this.onReorder = false;
    }
  }
}
